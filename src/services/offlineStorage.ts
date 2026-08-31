import { Note, SyncAction } from '../types';

const DB_NAME = 'NotesApp_OfflineDB_v2';
const DB_VERSION = 2;
const STORE_NOTES = 'notes';
const STORE_QUEUE = 'sync_queue';

class OfflineStorage {
  private dbPromise: Promise<IDBDatabase | null> | null = null;
  private isSupported: boolean = typeof window !== 'undefined' && 'indexedDB' in window;

  private getDB(): Promise<IDBDatabase | null> {
    if (!this.isSupported) return Promise.resolve(null);
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NOTES)) {
            const notesStore = db.createObjectStore(STORE_NOTES, { keyPath: 'id' });
            notesStore.createIndex('user_id', 'user_id', { unique: false });
            notesStore.createIndex('updated_at', 'updated_at', { unique: false });
          }
          if (!db.objectStoreNames.contains(STORE_QUEUE)) {
            const queueStore = db.createObjectStore(STORE_QUEUE, { keyPath: 'id' });
            queueStore.createIndex('userId', 'userId', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => {
          console.warn('IndexedDB open failed, using localStorage:', e);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB error, using localStorage:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  // Get notes for a user from local storage (hybrid synchronous cache + indexedDB)
  async getUserNotes(userId: string): Promise<Note[]> {
    // 1. Check synchronous localStorage first as rapid fallback
    let localCache: Note[] = [];
    try {
      const raw = localStorage.getItem(`notes_cache_${userId}`) || localStorage.getItem('notes_cache_global');
      if (raw) {
        localCache = JSON.parse(raw);
      }
    } catch {}

    const db = await this.getDB();
    if (!db) {
      return localCache;
    }

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NOTES, 'readonly');
        const store = tx.objectStore(STORE_NOTES);
        const index = store.index('user_id');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          const dbNotes: Note[] = request.result || [];
          if (dbNotes.length > 0) {
            // Keep localStorage updated with DB notes
            try {
              localStorage.setItem(`notes_cache_${userId}`, JSON.stringify(dbNotes));
            } catch {}
            resolve(dbNotes);
          } else if (localCache.length > 0) {
            // Re-seed DB from localCache
            this.saveUserNotes(userId, localCache).catch(() => {});
            resolve(localCache);
          } else {
            resolve([]);
          }
        };
        request.onerror = () => {
          resolve(localCache);
        };
      } catch {
        resolve(localCache);
      }
    });
  }

  // Save/Replace all notes in local cache for user
  async saveUserNotes(userId: string, notes: Note[]): Promise<void> {
    // 1. Always write to synchronous localStorage immediately
    try {
      localStorage.setItem(`notes_cache_${userId}`, JSON.stringify(notes));
      localStorage.setItem('notes_cache_global', JSON.stringify(notes));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NOTES, 'readwrite');
        const store = tx.objectStore(STORE_NOTES);

        for (const note of notes) {
          store.put(note);
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Save single note to local cache (dual write)
  async putNote(note: Note): Promise<void> {
    // 1. Update localStorage immediately
    try {
      const userKey = `notes_cache_${note.user_id}`;
      const raw = localStorage.getItem(userKey);
      const existing: Note[] = raw ? JSON.parse(raw) : [];
      const index = existing.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        existing[index] = note;
      } else {
        existing.unshift(note);
      }
      localStorage.setItem(userKey, JSON.stringify(existing));
      localStorage.setItem('notes_cache_global', JSON.stringify(existing));
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NOTES, 'readwrite');
        const store = tx.objectStore(STORE_NOTES);
        store.put(note);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Delete note from local cache (dual delete)
  async deleteNote(noteId: string, userId: string): Promise<void> {
    // 1. Remove from localStorage
    try {
      const userKey = `notes_cache_${userId}`;
      const raw = localStorage.getItem(userKey);
      if (raw) {
        const existing: Note[] = JSON.parse(raw);
        const filtered = existing.filter((n) => n.id !== noteId);
        localStorage.setItem(userKey, JSON.stringify(filtered));
        localStorage.setItem('notes_cache_global', JSON.stringify(filtered));
      }
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_NOTES, 'readwrite');
        const store = tx.objectStore(STORE_NOTES);
        store.delete(noteId);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Enqueue a sync action to be synced when online
  async enqueueAction(action: SyncAction): Promise<void> {
    try {
      const queueKey = `sync_queue_${action.userId}`;
      const raw = localStorage.getItem(queueKey);
      const list: SyncAction[] = raw ? JSON.parse(raw) : [];
      list.push(action);
      localStorage.setItem(queueKey, JSON.stringify(list));
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_QUEUE, 'readwrite');
        const store = tx.objectStore(STORE_QUEUE);
        store.put(action);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }

  // Get pending actions for user
  async getPendingActions(userId: string): Promise<SyncAction[]> {
    let localQueue: SyncAction[] = [];
    try {
      const raw = localStorage.getItem(`sync_queue_${userId}`);
      if (raw) localQueue = JSON.parse(raw);
    } catch {}

    const db = await this.getDB();
    if (!db) return localQueue;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_QUEUE, 'readonly');
        const store = tx.objectStore(STORE_QUEUE);
        const index = store.index('userId');
        const request = index.getAll(userId);

        request.onsuccess = () => {
          const res = request.result || [];
          resolve(res.length > 0 ? res : localQueue);
        };
        request.onerror = () => resolve(localQueue);
      } catch {
        resolve(localQueue);
      }
    });
  }

  // Clear pending actions for user after successful sync
  async clearPendingActions(userId: string, actionIds?: string[]): Promise<void> {
    try {
      if (!actionIds || actionIds.length === 0) {
        localStorage.removeItem(`sync_queue_${userId}`);
      } else {
        const raw = localStorage.getItem(`sync_queue_${userId}`);
        const list: SyncAction[] = raw ? JSON.parse(raw) : [];
        const filtered = list.filter((a) => !actionIds.includes(a.id));
        localStorage.setItem(`sync_queue_${userId}`, JSON.stringify(filtered));
      }
    } catch {}

    const db = await this.getDB();
    if (!db) return;

    return new Promise((resolve) => {
      try {
        const tx = db.transaction(STORE_QUEUE, 'readwrite');
        const store = tx.objectStore(STORE_QUEUE);

        if (!actionIds || actionIds.length === 0) {
          const index = store.index('userId');
          const request = index.getAllKeys(userId);
          request.onsuccess = () => {
            for (const key of request.result) {
              store.delete(key);
            }
          };
        } else {
          for (const id of actionIds) {
            store.delete(id);
          }
        }

        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      } catch {
        resolve();
      }
    });
  }
}

export const offlineStorage = new OfflineStorage();
