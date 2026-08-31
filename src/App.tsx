import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { Note, FolderItem, DEFAULT_FOLDERS } from './types';
import { SidebarNav } from './components/SidebarNav';
import { NotesListPanel } from './components/NotesListPanel';
import { WorkspaceEditor } from './components/WorkspaceEditor';
import { CommandPalette } from './components/CommandPalette';
import { AuthView } from './components/AuthView';
import { ConfirmModal } from './components/ConfirmModal';

function NotesDashboard() {
  const { user, logout } = useAuth();
  const {
    notes,
    rawNotesCount,
    loading,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterTag,
    setFilterTag,
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
  } = useNotes();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [mobileView, setMobileView] = useState<'list' | 'editor'>('list');

  const [activeView, setActiveView] = useState<'all' | 'pinned' | 'recent' | string>('all');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Custom user-defined folders stored locally
  const [customFolders, setCustomFolders] = useState<FolderItem[]>(() => {
    try {
      const raw = localStorage.getItem('doodlepop_custom_folders');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const handleAddFolder = (name: string, icon = '📁', color = '#2DD4BF') => {
    const newFolder: FolderItem = {
      id: name,
      label: name,
      icon,
      color,
    };
    setCustomFolders((prev) => {
      if (prev.some((f) => f.id.toLowerCase() === name.toLowerCase())) return prev;
      const next = [...prev, newFolder];
      try {
        localStorage.setItem('doodlepop_custom_folders', JSON.stringify(next));
      } catch {}
      return next;
    });
    setActiveFolder(name);
    setFilterTag(null);
    setActiveView('all');
  };

  // Combine default folders, custom user folders, and any folders found on notes
  const allFolders = useMemo(() => {
    const map = new Map<string, FolderItem>();
    DEFAULT_FOLDERS.forEach((f) => map.set(f.id, f));
    customFolders.forEach((f) => map.set(f.id, f));

    notes.forEach((n) => {
      if (n.folder && !map.has(n.folder)) {
        map.set(n.folder, {
          id: n.folder,
          label: n.folder,
          icon: '📁',
          color: '#A78BFA',
        });
      }
    });

    return Array.from(map.values());
  }, [customFolders, notes]);

  // Compute live note counts per folder
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    allFolders.forEach((f) => {
      counts[f.id] = notes.filter(
        (n) => n.folder === f.id || (Array.isArray(n.tags) && n.tags.includes(f.id.toLowerCase()))
      ).length;
    });
    return counts;
  }, [allFolders, notes]);

  // Automatically select the first note on initial load if none selected
  useEffect(() => {
    if (!activeNote && notes.length > 0) {
      if (activeFolder) {
        const matching = notes.filter(
          (n) => n.folder === activeFolder || (Array.isArray(n.tags) && n.tags.includes(activeFolder.toLowerCase()))
        );
        setActiveNote(matching[0] || null);
      } else {
        setActiveNote(notes[0]);
      }
    } else if (activeNote && !notes.some((n) => n.id === activeNote.id)) {
      setActiveNote(notes[0] || null);
    }
  }, [notes, activeFolder]);

  // Global Keyboard Shortcuts (Cmd+N, Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleCreateNewNote();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user, activeFolder]);

  const handleCreateNewNote = async (overrideFolder?: string) => {
    const targetFolder = overrideFolder || activeFolder || 'Personal';
    let folderColor = 'teal';
    if (targetFolder === 'School & Work') folderColor = 'indigo';
    else if (targetFolder === 'My Diary') folderColor = 'amber';
    else if (targetFolder === 'Fun & Ideas') folderColor = 'rose';

    const newNote = await createNote({
      title: 'Untitled Note',
      body: '',
      is_pinned: false,
      color_tag: folderColor,
      folder: targetFolder,
      tags: targetFolder !== 'Personal' ? [targetFolder.toLowerCase()] : [],
    });
    setActiveNote(newNote);
    setMobileView('editor');
    setIsMobileSidebarOpen(false);
  };

  const handleSelectFolder = (folderId: string | null) => {
    setActiveFolder(folderId);
    setFilterTag(null);
    setActiveView('all');
    if (folderId) {
      const matching = notes.filter(
        (n) => n.folder === folderId || (Array.isArray(n.tags) && n.tags.includes(folderId.toLowerCase()))
      );
      if (matching.length > 0) {
        setActiveNote(matching[0]);
      } else {
        setActiveNote(null);
      }
    } else {
      setActiveNote(notes[0] || null);
    }
  };

  const handleSelectNote = (note: Note) => {
    setActiveNote(note);
    setMobileView('editor');
  };

  const handleSaveNote = async (data: {
    id?: string;
    title: string;
    body: string;
    is_pinned: boolean;
    color_tag: string;
    tags: string[];
    folder?: string;
  }) => {
    if (data.id) {
      const updated = await updateNote(data.id, {
        title: data.title,
        body: data.body,
        is_pinned: data.is_pinned,
        color_tag: data.color_tag,
        tags: data.tags,
        folder: data.folder,
      });
      if (updated) {
        setActiveNote(updated);
      }
    } else {
      const created = await createNote({
        title: data.title || 'Untitled Note',
        body: data.body,
        is_pinned: data.is_pinned,
        color_tag: data.color_tag,
        tags: data.tags,
        folder: data.folder || activeFolder || 'Personal',
      });
      if (created) {
        setActiveNote(created);
      }
    }
  };

  const handleConfirmDelete = async () => {
    if (deletingNote) {
      await deleteNote(deletingNote.id);
      if (activeNote?.id === deletingNote.id) {
        const remaining = notes.filter((n) => n.id !== deletingNote.id);
        setActiveNote(remaining[0] || null);
        if (remaining.length === 0) {
          setMobileView('list');
        }
      }
      setDeletingNote(null);
    }
  };

  // Filter notes according to sidebar active view
  const displayNotes = notes.filter((note) => {
    if (activeView === 'pinned') return note.is_pinned;
    if (activeView === 'recent') {
      const dayDiff =
        (Date.now() - new Date(note.updated_at || note.created_at).getTime()) /
        (1000 * 60 * 60 * 24);
      return dayDiff <= 7;
    }
    if (activeFolder) {
      return (
        note.folder === activeFolder ||
        (Array.isArray(note.tags) && note.tags.includes(activeFolder.toLowerCase()))
      );
    }
    return true;
  });

  const pinnedNotesCount = notes.filter((n) => n.is_pinned).length;

  return (
    <div className="h-screen w-screen bg-[#121212] text-slate-100 flex overflow-hidden font-sans relative">
      {/* 1. DESKTOP LEFT COLLAPSIBLE NAVIGATION BAR */}
      <div className="hidden md:flex h-full shrink-0">
        <SidebarNav
          user={user!}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          activeView={activeView}
          onSelectView={(v) => {
            setActiveView(v);
            setActiveFolder(null);
            setFilterTag(null);
          }}
          activeTag={filterTag}
          onSelectTag={(t) => {
            setFilterTag(t);
            setActiveFolder(null);
            setActiveView('all');
          }}
          activeFolder={activeFolder}
          onSelectFolder={handleSelectFolder}
          folders={allFolders}
          folderCounts={folderCounts}
          onAddFolder={handleAddFolder}
          allTags={allTags}
          totalNotes={rawNotesCount}
          pinnedCount={pinnedNotesCount}
          syncStatus={syncStatus}
          pendingCount={pendingCount}
          onNewNote={() => handleCreateNewNote()}
          onLogout={() => setShowLogoutConfirm(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
      </div>

      {/* MOBILE DRAWER NAVIGATION OVERLAY */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Drawer Content */}
          <div className="relative z-10 h-full max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
            <SidebarNav
              user={user!}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              activeView={activeView}
              onSelectView={(v) => {
                setActiveView(v);
                setActiveFolder(null);
                setFilterTag(null);
                setIsMobileSidebarOpen(false);
              }}
              activeTag={filterTag}
              onSelectTag={(t) => {
                setFilterTag(t);
                setActiveFolder(null);
                setActiveView('all');
                setIsMobileSidebarOpen(false);
              }}
              activeFolder={activeFolder}
              onSelectFolder={(f) => {
                handleSelectFolder(f);
                setIsMobileSidebarOpen(false);
              }}
              folders={allFolders}
              folderCounts={folderCounts}
              onAddFolder={handleAddFolder}
              allTags={allTags}
              totalNotes={rawNotesCount}
              pinnedCount={pinnedNotesCount}
              syncStatus={syncStatus}
              pendingCount={pendingCount}
              onNewNote={() => handleCreateNewNote()}
              onLogout={() => {
                setIsMobileSidebarOpen(false);
                setShowLogoutConfirm(true);
              }}
              onOpenCommandPalette={() => {
                setIsMobileSidebarOpen(false);
                setIsCommandPaletteOpen(true);
              }}
              isMobile={true}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
            />
          </div>
        </div>
      )}

      {/* 2. MIDDLE LIST PANEL FOR NOTES / FOLDERS / PINNED */}
      <div
        className={`h-full ${
          mobileView === 'list' ? 'flex w-full md:w-auto' : 'hidden md:flex'
        }`}
      >
        <NotesListPanel
          notes={displayNotes}
          allNotesCount={rawNotesCount}
          activeNoteId={activeNote?.id || null}
          onSelectNote={handleSelectNote}
          onNewNote={handleCreateNewNote}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          activeTag={filterTag}
          onClearTag={() => setFilterTag(null)}
          activeFolder={activeFolder}
          onClearFolder={() => handleSelectFolder(null)}
          onTogglePin={togglePin}
          onDeleteNote={(note) => setDeletingNote(note)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onOpenSidebarMobile={() => setIsMobileSidebarOpen(true)}
          folders={allFolders}
        />
      </div>

      {/* 3. MAIN WORKSPACE / EDITOR CANVAS */}
      <div
        className={`h-full flex-1 overflow-hidden ${
          mobileView === 'editor' ? 'flex w-full' : 'hidden md:flex'
        }`}
      >
        <WorkspaceEditor
          note={activeNote}
          onSave={handleSaveNote}
          onDelete={(note) => setDeletingNote(note)}
          onTogglePin={togglePin}
          syncStatus={syncStatus}
          pendingCount={pendingCount}
          onForceSync={forceSync}
          onNewNote={handleCreateNewNote}
          onBack={() => setMobileView('list')}
          activeFolder={activeFolder}
          folders={allFolders}
        />
      </div>

      {/* Cmd + K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={(n) => {
          setActiveNote(n);
          setMobileView('editor');
        }}
        onNewNote={handleCreateNewNote}
        onFilterPinned={() => setActiveView('pinned')}
        onForceSync={forceSync}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deletingNote)}
        title="Delete Note"
        message={`Are you sure you want to permanently delete "${deletingNote?.title || 'this note'}"? This action cannot be undone.`}
        confirmLabel="Delete Note"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeletingNote(null)}
      />

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        title="Log Out"
        message="Are you sure you want to log out of your account?"
        confirmLabel="Log Out"
        isDestructive={false}
        onConfirm={() => {
          setShowLogoutConfirm(false);
          logout();
        }}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </div>
  );
}

function Main() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#121212] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-[#2DD4BF] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-400 font-jetbrains">Loading your workspace...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  return <NotesDashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
}
