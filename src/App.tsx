import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { useNotes } from './hooks/useNotes';
import { Note } from './types';
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
  const [activeView, setActiveView] = useState<'all' | 'pinned' | 'recent' | string>('all');
  const [activeFolder, setActiveFolder] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [deletingNote, setDeletingNote] = useState<Note | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Automatically select the first note on initial load if none selected
  useEffect(() => {
    if (!activeNote && notes.length > 0) {
      setActiveNote(notes[0]);
    } else if (activeNote && !notes.some((n) => n.id === activeNote.id)) {
      setActiveNote(notes[0] || null);
    }
  }, [notes, activeNote]);

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
  }, [user]);

  const handleCreateNewNote = async () => {
    const newNote = await createNote({
      title: 'Untitled Note',
      body: '',
      is_pinned: false,
      color_tag: 'teal',
      tags: activeFolder ? [activeFolder.toLowerCase()] : [],
    });
    setActiveNote(newNote);
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
    <div className="h-screen w-screen bg-[#121212] text-slate-100 flex overflow-hidden font-sans">
      {/* 1. LEFT COLLAPSIBLE ICON NAVIGATION BAR */}
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
        onSelectFolder={(f) => {
          setActiveFolder(f);
          setFilterTag(null);
          setActiveView('all');
        }}
        allTags={allTags}
        totalNotes={rawNotesCount}
        pinnedCount={pinnedNotesCount}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
        onNewNote={handleCreateNewNote}
        onLogout={() => setShowLogoutConfirm(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 2. MIDDLE LIST PANEL FOR NOTES / FOLDERS / PINNED GRID */}
      <NotesListPanel
        notes={displayNotes}
        allNotesCount={rawNotesCount}
        activeNoteId={activeNote?.id || null}
        onSelectNote={(note) => setActiveNote(note)}
        onNewNote={handleCreateNewNote}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        sortBy={sortBy}
        onSortChange={setSortBy}
        activeTag={filterTag}
        onClearTag={() => setFilterTag(null)}
        activeFolder={activeFolder}
        onClearFolder={() => setActiveFolder(null)}
        onTogglePin={togglePin}
        onDeleteNote={(note) => setDeletingNote(note)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* 3. WIDE MAIN WORKSPACE FEATURING RICH TEXT EDITOR */}
      <WorkspaceEditor
        note={activeNote}
        onSave={handleSaveNote}
        onDelete={(note) => setDeletingNote(note)}
        onTogglePin={togglePin}
        syncStatus={syncStatus}
        pendingCount={pendingCount}
        onForceSync={forceSync}
        onNewNote={handleCreateNewNote}
      />

      {/* Cmd + K Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        notes={notes}
        onSelectNote={(n) => setActiveNote(n)}
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

