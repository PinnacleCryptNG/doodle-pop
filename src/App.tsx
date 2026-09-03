import React, { useState, useEffect, useMemo } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { Note, FolderItem, DEFAULT_FOLDERS, ThemeMode } from './types';
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
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    filterTag,
    setFilterTag,
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

  // Global Theme Mode: 'dark' | 'light'
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('doodlepop_theme_mode');
      if (saved === 'light' || saved === 'dark') {
        return saved;
      }
    } catch {}
    return 'dark';
  });

  // Apply Dark/Light mode class and CSS variables to document root
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
      root.style.colorScheme = 'dark';
      root.style.setProperty('--theme-primary', '#F59E0B');
      root.style.setProperty('--theme-hover', '#FBBF24');
      root.style.setProperty('--theme-rgb', '245, 158, 11');
      root.style.setProperty('--theme-glow', 'rgba(245, 158, 11, 0.2)');
      root.style.setProperty('--theme-bg-subtle', 'rgba(245, 158, 11, 0.12)');
      root.style.setProperty('--theme-border-subtle', 'rgba(245, 158, 11, 0.3)');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
      root.style.setProperty('--theme-primary', '#D97706');
      root.style.setProperty('--theme-hover', '#B45309');
      root.style.setProperty('--theme-rgb', '217, 119, 6');
      root.style.setProperty('--theme-glow', 'rgba(217, 119, 6, 0.2)');
      root.style.setProperty('--theme-bg-subtle', 'rgba(217, 119, 6, 0.1)');
      root.style.setProperty('--theme-border-subtle', 'rgba(217, 119, 6, 0.25)');
    }
  }, [themeMode]);

  // Handle Theme Toggle
  const handleToggleTheme = (mode?: ThemeMode) => {
    const nextMode: ThemeMode = mode || (themeMode === 'dark' ? 'light' : 'dark');
    setThemeMode(nextMode);
    try {
      localStorage.setItem('doodlepop_theme_mode', nextMode);
    } catch {}
  };

  // Home Click: Reset all filters to show All Notes and List view
  const handleGoHome = () => {
    setActiveView('all');
    setActiveFolder(null);
    setFilterTag(null);
    setSearchQuery('');
    setOnlyPinned(false);
    if (notes.length > 0) {
      setActiveNote(notes[0]);
    }
    setMobileView('list');
    setIsMobileSidebarOpen(false);
  };

  // Compute live note counts for the 4 clean default folders
  const folderCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    DEFAULT_FOLDERS.forEach((f) => {
      counts[f.id] = notes.filter((n) => (n.folder || 'Personal') === f.id).length;
    });
    return counts;
  }, [notes]);

  // Automatically select the first note on initial load if none selected
  useEffect(() => {
    if (!activeNote && notes.length > 0) {
      if (activeFolder) {
        const matching = notes.filter((n) => (n.folder || 'Personal') === activeFolder);
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

    const newNote = await createNote({
      title: 'Untitled Note',
      body: '',
      is_pinned: false,
      folder: targetFolder,
      tags: [],
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
      const matching = notes.filter((n) => (n.folder || 'Personal') === folderId);
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

  const handleUpdateNote = async (updatedNote: Note) => {
    const updated = await updateNote(updatedNote.id, {
      title: updatedNote.title,
      body: updatedNote.body,
      is_pinned: updatedNote.is_pinned,
      tags: updatedNote.tags,
      folder: updatedNote.folder || 'Personal',
    });
    if (updated) {
      setActiveNote(updated);
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
      return (note.folder || 'Personal') === activeFolder;
    }
    return true;
  });

  const pinnedNotesCount = notes.filter((n) => n.is_pinned).length;

  return (
    <div
      id="notes-app-root"
      className={`h-screen h-[100dvh] w-full max-w-full flex overflow-hidden font-nunito relative select-none transition-colors duration-200 ${
        themeMode === 'dark' ? 'bg-[#0F1117] text-slate-100' : 'bg-slate-50 text-slate-900'
      }`}
    >
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
          folders={DEFAULT_FOLDERS}
          folderCounts={folderCounts}
          allTags={allTags}
          totalNotes={rawNotesCount}
          pinnedCount={pinnedNotesCount}
          syncStatus={syncStatus}
          pendingCount={pendingCount}
          onNewNote={() => handleCreateNewNote()}
          onLogout={() => setShowLogoutConfirm(true)}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
          onGoHome={handleGoHome}
          themeMode={themeMode}
          onToggleTheme={handleToggleTheme}
        />
      </div>

      {/* MOBILE DRAWER NAVIGATION OVERLAY */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Drawer Content */}
          <div className="relative z-10 h-full w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-200">
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
              folders={DEFAULT_FOLDERS}
              folderCounts={folderCounts}
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
              onGoHome={handleGoHome}
              isMobile={true}
              onCloseMobile={() => setIsMobileSidebarOpen(false)}
              themeMode={themeMode}
              onToggleTheme={handleToggleTheme}
            />
          </div>
        </div>
      )}

      {/* 2. MIDDLE LIST PANEL FOR NOTES / FOLDERS / PINNED */}
      <div
        className={`h-full shrink-0 ${
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
          onGoHome={handleGoHome}
          folders={DEFAULT_FOLDERS}
          themeMode={themeMode}
        />
      </div>

      {/* 3. MAIN WORKSPACE / EDITOR CANVAS */}
      <div
        className={`h-full flex-1 min-w-0 overflow-hidden ${
          mobileView === 'editor' ? 'flex w-full' : 'hidden md:flex'
        }`}
      >
        <WorkspaceEditor
          note={activeNote}
          onUpdate={handleUpdateNote}
          onDelete={(note) => setDeletingNote(note)}
          onTogglePin={togglePin}
          syncStatus={syncStatus}
          pendingCount={pendingCount}
          onForceSync={forceSync}
          folders={DEFAULT_FOLDERS}
          onBackToList={() => setMobileView('list')}
          onGoHome={handleGoHome}
          isMobile={mobileView === 'editor'}
          themeMode={themeMode}
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
        themeMode={themeMode}
        onToggleTheme={handleToggleTheme}
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
      <div className="min-h-screen bg-[#0F1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-400 font-quicksand">Loading your workspace...</span>
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
