import { useState, useEffect, useCallback, useMemo } from 'react';
import { Note, SortOption, SyncStatus, SyncAction } from '../types';
import { api } from '../services/api';
import { offlineStorage } from '../services/offlineStorage';
import { syncManager } from '../services/syncManager';
import { useAuth } from './useAuth';

export function useNotes() {
  const { user } = useAuth();
  
  // Instant synchronous recovery from localStorage cache on initial render
  const [notes, setNotes] = useState<Note[]>(() => {
    try {
      if (typeof window === 'undefined') return [];
      const userKey = user ? `notes_cache_${user.id}` : 'notes_cache_global';
      const raw = localStorage.getItem(userKey) || localStorage.getItem('notes_cache_global');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState<boolean>(() => {
    try {
      if (typeof window === 'undefined') return false;
      const userKey = user ? `notes_cache_${user.id}` : 'notes_cache_global';
      const raw = localStorage.getItem(userKey) || localStorage.getItem('notes_cache_global');
      return !raw || JSON.parse(raw).length === 0;
    } catch {
      return false;
    }
  });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortOption>('created_desc');
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [filterColor, setFilterColor] = useState<string | null>(null);
  const [onlyPinned, setOnlyPinned] = useState<boolean>(false);
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('online');
  const [pendingCount, setPendingCount] = useState<number>(0);

  // Subscribe to syncManager status
  useEffect(() => {
    const unsubscribe = syncManager.subscribe((status, count) => {
      setSyncStatus(status);
      setPendingCount(count);
    });
    return unsubscribe;
  }, []);

  // Load notes initially from offline cache, then trigger background sync
  const loadNotes = useCallback(async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      // 1. Instant load from local IndexedDB & LocalStorage cache
      const cached = await offlineStorage.getUserNotes(user.id);
      if (cached && cached.length > 0) {
        setNotes(cached);
        setLoading(false);
      }

      await syncManager.updatePendingCount(user.id);

      // 2. Fetch fresh from server if online
      if (navigator.onLine) {
        const synced = await syncManager.syncNotes(user.id);
        if (synced && synced.length > 0) {
          setNotes(synced);
        } else {
          // Fallback direct get
          try {
            const res = await api.getNotes();
            if (res.notes && res.notes.length > 0) {
              setNotes(res.notes);
              await offlineStorage.saveUserNotes(user.id, res.notes);
            }
          } catch (e) {
            console.warn('Direct fetch notes error, using cached:', e);
          }
        }
      }
    } catch (err) {
      console.warn('Error loading notes:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadNotes();
    if (user) {
      syncManager.startPeriodicSync(user.id, 25000);
    }
    return () => {
      syncManager.stopPeriodicSync();
    };
  }, [loadNotes, user]);

  // CREATE NOTE (Optimistic + Offline Queue)
  const createNote = async (data: {
    title: string;
    body: string;
    is_pinned?: boolean;
    color_tag?: string;
    tags?: string[];
  }): Promise<Note> => {
    if (!user) throw new Error('Must be logged in to create a note');

    const now = new Date().toISOString();
    const tempId = `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const newNote: Note = {
      id: tempId,
      user_id: user.id,
      title: data.title.trim(),
      body: data.body.trim(),
      is_pinned: Boolean(data.is_pinned),
      color_tag: data.color_tag || 'default',
      tags: data.tags || [],
      created_at: now,
      updated_at: now,
      _syncStatus: 'pending',
    };

    // 1. Optimistic local update in memory
    setNotes((prev) => [newNote, ...prev]);

    // 2. Persist to offline storage
    await offlineStorage.putNote(newNote);

    // 3. Queue offline action
    const syncAction: SyncAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action: 'create',
      noteId: tempId,
      userId: user.id,
      payload: newNote,
      timestamp: Date.now(),
    };
    await offlineStorage.enqueueAction(syncAction);
    await syncManager.updatePendingCount(user.id);

    // 4. If online, sync to server
    if (navigator.onLine) {
      try {
        const res = await api.createNote(newNote);
        if (res.note) {
          // Replace temp note with server note
          setNotes((prev) => prev.map((n) => (n.id === tempId ? { ...res.note, _syncStatus: 'synced' } : n)));
          await offlineStorage.putNote(res.note);
          await offlineStorage.clearPendingActions(user.id, [syncAction.id]);
          await syncManager.updatePendingCount(user.id);
          return res.note;
        }
      } catch (err) {
        console.warn('Offline note creation queued for sync:', err);
      }
    }

    return newNote;
  };

  // UPDATE NOTE (Optimistic + Offline Queue)
  const updateNote = async (id: string, updates: Partial<Note>): Promise<Note> => {
    if (!user) throw new Error('Must be logged in to update a note');

    const now = new Date().toISOString();
    let updatedNote: Note | null = null;

    // 1. Optimistic update
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          updatedNote = {
            ...n,
            ...updates,
            updated_at: now,
            _syncStatus: 'pending',
          };
          return updatedNote;
        }
        return n;
      })
    );

    if (!updatedNote) throw new Error('Note not found in local state');

    // 2. Save locally
    await offlineStorage.putNote(updatedNote);

    // 3. Queue sync action
    const syncAction: SyncAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action: 'update',
      noteId: id,
      userId: user.id,
      payload: updates,
      timestamp: Date.now(),
    };
    await offlineStorage.enqueueAction(syncAction);
    await syncManager.updatePendingCount(user.id);

    // 4. Send to server if online
    if (navigator.onLine) {
      try {
        const res = await api.updateNote(id, updates);
        if (res.note) {
          setNotes((prev) => prev.map((n) => (n.id === id ? { ...res.note, _syncStatus: 'synced' } : n)));
          await offlineStorage.putNote(res.note);
          await offlineStorage.clearPendingActions(user.id, [syncAction.id]);
          await syncManager.updatePendingCount(user.id);
          return res.note;
        }
      } catch (err) {
        console.warn('Offline note update queued for sync:', err);
      }
    }

    return updatedNote;
  };

  // DELETE NOTE (Optimistic + Offline Queue)
  const deleteNote = async (id: string): Promise<void> => {
    if (!user) throw new Error('Must be logged in to delete a note');

    // 1. Optimistic removal
    setNotes((prev) => prev.filter((n) => n.id !== id));

    // 2. Remove from local store
    await offlineStorage.deleteNote(id, user.id);

    // 3. Queue delete sync action
    const syncAction: SyncAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      action: 'delete',
      noteId: id,
      userId: user.id,
      timestamp: Date.now(),
    };
    await offlineStorage.enqueueAction(syncAction);
    await syncManager.updatePendingCount(user.id);

    // 4. If online, send delete to server
    if (navigator.onLine) {
      try {
        await api.deleteNote(id);
        await offlineStorage.clearPendingActions(user.id, [syncAction.id]);
        await syncManager.updatePendingCount(user.id);
      } catch (err) {
        console.warn('Offline note deletion queued for sync:', err);
      }
    }
  };

  // Toggle Pin
  const togglePin = async (id: string): Promise<void> => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    await updateNote(id, { is_pinned: !note.is_pinned });
  };

  // Manual Sync trigger
  const forceSync = async () => {
    if (!user) return;
    const res = await syncManager.syncNotes(user.id);
    if (res) {
      setNotes(res);
    }
  };

  // Extract all unique tags across user's notes
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const n of notes) {
      if (Array.isArray(n.tags)) {
        for (const t of n.tags) {
          if (t && t.trim()) set.add(t.trim());
        }
      }
    }
    return Array.from(set).sort();
  }, [notes]);

  // Filter and Sort notes
  const filteredNotes = useMemo(() => {
    let result = [...notes];

    // Search filter (stretch goal: filter notes by title or body)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.body.toLowerCase().includes(q) ||
          (Array.isArray(n.tags) && n.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Pinned filter
    if (onlyPinned) {
      result = result.filter((n) => n.is_pinned);
    }

    // Tag filter
    if (filterTag) {
      result = result.filter((n) => Array.isArray(n.tags) && n.tags.includes(filterTag));
    }

    // Color filter
    if (filterColor) {
      result = result.filter((n) => n.color_tag === filterColor);
    }

    // Sorting (stretch goal: sort newest first, or by title / updated)
    result.sort((a, b) => {
      // Pinned notes always surface to top unless sorting purely overrides
      if (a.is_pinned !== b.is_pinned) {
        return a.is_pinned ? -1 : 1;
      }

      switch (sortBy) {
        case 'created_desc':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'created_asc':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case 'updated_desc':
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
        case 'title_asc':
          return a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
        default:
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      }
    });

    return result;
  }, [notes, searchQuery, sortBy, onlyPinned, filterTag, filterColor]);

  return {
    notes: filteredNotes,
    rawNotesCount: notes.length,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterTag,
    setFilterTag,
    filterColor,
    setFilterColor,
    onlyPinned,
    setOnlyPinned,
    allTags,
    syncStatus,
    pendingCount,
    createNote,
    updateNote,
    deleteNote,
    togglePin,
    forceSync,
    refreshNotes: loadNotes,
  };
}
