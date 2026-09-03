import React, { useState, useEffect, useRef } from 'react';
import { Note, SyncStatus, FolderItem, DEFAULT_FOLDERS, ThemeMode } from '../types';
import { FolderIcon } from './FolderIcon';
import Markdown from 'react-markdown';
import {
  Pin,
  Trash2,
  Copy,
  Check,
  FileDown,
  Maximize2,
  Minimize2,
  Cloud,
  CloudOff,
  RefreshCw,
  Bold,
  Italic,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  Link as LinkIcon,
  Minus,
  Edit3,
  Eye,
  Columns,
  ArrowLeft,
  ChevronDown,
  MoreHorizontal,
  X
} from 'lucide-react';

interface WorkspaceEditorProps {
  note: Note | null;
  onUpdate: (updatedNote: Note) => void;
  onDelete: (note: Note) => void;
  onTogglePin: (id: string, current: boolean) => void;
  syncStatus: SyncStatus;
  pendingCount: number;
  onForceSync: () => void;
  folders?: FolderItem[];
  onBackToList?: () => void;
  onGoHome?: () => void;
  isMobile?: boolean;
  themeMode?: ThemeMode;
  // Deprecated backward-compat props
  pageTheme?: any;
  onThemeChange?: any;
}

export const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({
  note,
  onUpdate,
  onDelete,
  onTogglePin,
  syncStatus,
  pendingCount,
  onForceSync,
  folders = DEFAULT_FOLDERS,
  onBackToList,
  isMobile = false,
  themeMode = 'dark',
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [folder, setFolder] = useState<string>('Personal');
  const [copied, setCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('write');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const isDark = themeMode === 'dark';

  // Sync state with selected note
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setBody(note.body || '');
      setTags(Array.isArray(note.tags) ? note.tags : []);
      setFolder(note.folder || 'Personal');
    } else {
      setTitle('');
      setBody('');
      setTags([]);
      setFolder('Personal');
    }
  }, [note?.id]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(e.target as Node)) {
        setShowFolderDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced auto-save function
  const triggerAutoSave = (updatedFields: Partial<Note>) => {
    if (!note) return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({
        ...note,
        ...updatedFields,
        updated_at: new Date().toISOString(),
      });
    }, 400);
  };

  const handleTitleChange = (newTitle: string) => {
    setTitle(newTitle);
    triggerAutoSave({ title: newTitle });
  };

  const handleBodyChange = (newBody: string) => {
    setBody(newBody);
    triggerAutoSave({ body: newBody });
  };

  const handleFolderChange = (newFolder: string) => {
    setFolder(newFolder);
    setShowFolderDropdown(false);
    triggerAutoSave({ folder: newFolder });
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (cleanTag && !tags.includes(cleanTag)) {
        const newTags = [...tags, cleanTag];
        setTags(newTags);
        setTagInput('');
        triggerAutoSave({ tags: newTags });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const newTags = tags.filter((t) => t !== tagToRemove);
    setTags(newTags);
    triggerAutoSave({ tags: newTags });
  };

  // Formatting helpers for Markdown toolbar
  const insertMarkdown = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end) || defaultText;
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);
    triggerAutoSave({ body: newBody });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  const handleCopyMarkdown = () => {
    const fullContent = `# ${title}\n\n${body}`;
    navigator.clipboard.writeText(fullContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFile = () => {
    const fullContent = `# ${title}\n\n${body}`;
    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(title || 'untitled').replace(/[^a-z0-9]/gi, '_').toLowerCase()}.md`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcut listener for bold, italic, etc.
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        insertMarkdown('**', '**', 'bold text');
      } else if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
        e.preventDefault();
        insertMarkdown('*', '*', 'italic text');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [body]);

  const currentFolderObj = folders.find((f) => f.id === folder) || folders[0];
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  if (!note) {
    return (
      <main
        id="workspace-empty-state"
        className={`flex-1 h-full flex flex-col items-center justify-center p-6 text-center select-none ${
          isDark ? 'bg-[#0F1117] text-slate-300' : 'bg-slate-50 text-slate-700'
        }`}
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 border shadow-sm ${
            isDark
              ? 'bg-[#181A24] border-slate-800'
              : 'bg-white border-slate-200'
          }`}
        >
          <span>📒</span>
        </div>
        <h2 className={`font-fredoka text-xl font-bold mb-1 ${isDark ? 'text-white' : 'text-slate-900'}`}>
          No Note Selected
        </h2>
        <p className={`font-quicksand text-xs max-w-sm mb-6 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
          Select an existing note from the list or create a fresh one to begin writing.
        </p>
      </main>
    );
  }

  return (
    <main
      id="workspace-editor"
      className={`relative flex-1 h-full flex flex-col justify-between overflow-hidden select-text transition-colors duration-200 ${
        isDark ? 'bg-[#0F1117]' : 'bg-slate-50'
      } ${isZenMode ? (isDark ? 'fixed inset-0 z-50 bg-[#0F1117]' : 'fixed inset-0 z-50 bg-slate-50') : ''}`}
    >
      {/* TOP WORKSPACE HEADER */}
      <header
        className={`h-14 px-3 sm:px-5 border-b flex items-center justify-between gap-2 shrink-0 z-20 ${
          isDark ? 'bg-[#141620] border-slate-800' : 'bg-white border-slate-200'
        }`}
      >
        {/* Left: Back (mobile) + Folder Selector + Pin */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {onBackToList && (
            <button
              onClick={onBackToList}
              title="Back to notes list"
              className={`md:hidden p-2 -ml-1 rounded-xl transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center gap-1 text-xs font-quicksand font-bold shrink-0 ${
                isDark
                  ? 'text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700'
                  : 'text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200'
              }`}
            >
              <ArrowLeft className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="hidden xs:inline">Notes</span>
            </button>
          )}

          {/* Folder Selector Dropdown (Personal, School, Work, Archive) */}
          <div className="relative" ref={folderDropdownRef}>
            <button
              onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              title="Change note folder"
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-quicksand font-bold transition-colors cursor-pointer min-h-[36px] max-w-[120px] sm:max-w-[160px] ${
                isDark
                  ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700/80'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
              }`}
            >
              <FolderIcon icon={currentFolderObj?.icon} className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span className="truncate">{folder || 'Personal'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {showFolderDropdown && (
              <div
                className={`absolute left-0 mt-1.5 w-48 border rounded-xl shadow-xl p-1 z-50 space-y-0.5 animate-in fade-in ${
                  isDark
                    ? 'bg-[#1a1d2e] border-slate-700 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}
              >
                <div
                  className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border-b ${
                    isDark ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'
                  }`}
                >
                  Select Folder
                </div>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFolderChange(f.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                      folder === f.id
                        ? isDark
                          ? 'bg-slate-800 text-white font-bold'
                          : 'bg-amber-50 text-amber-900 font-bold'
                        : isDark
                        ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <FolderIcon icon={f.icon} className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{f.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Star / Pin Toggle */}
          <button
            onClick={() => onTogglePin(note.id, note.is_pinned)}
            title={note.is_pinned ? 'Unstar note' : 'Star note'}
            className={`p-2 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center border shrink-0 ${
              note.is_pinned
                ? 'bg-amber-500/15 text-amber-500 border-amber-500/30'
                : isDark
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/80'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-900 border-slate-200'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Right: View Modes & Action Tools */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mode Switcher (Write / Split / Preview) */}
          <div
            className={`flex items-center p-0.5 rounded-xl border shrink-0 ${
              isDark ? 'bg-slate-800/90 border-slate-700/80' : 'bg-slate-100 border-slate-200'
            }`}
          >
            <button
              onClick={() => setEditorMode('write')}
              title="Editor Only (Write)"
              className={`px-2 py-1.5 rounded-lg text-xs font-quicksand font-bold transition-all cursor-pointer flex items-center gap-1 ${
                editorMode === 'write'
                  ? isDark
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Write</span>
            </button>

            <button
              onClick={() => setEditorMode('split')}
              title="Split View (Editor + Live Preview)"
              className={`hidden xl:flex items-center gap-1 px-2 py-1.5 rounded-lg text-xs font-quicksand font-bold transition-all cursor-pointer ${
                isZenMode ? '!flex' : ''
              } ${
                editorMode === 'split'
                  ? isDark
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>

            <button
              onClick={() => setEditorMode('preview')}
              title="Markdown Preview"
              className={`px-2 py-1.5 rounded-lg text-xs font-quicksand font-bold transition-all cursor-pointer flex items-center gap-1 ${
                editorMode === 'preview'
                  ? isDark
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-900 shadow-xs'
                  : isDark
                  ? 'text-slate-400 hover:text-white'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Desktop Direct Quick Actions (Only on >= xl to prevent crowding on tablet / desktop-mode mobile) */}
          <div className="hidden xl:flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              title="Copy markdown content"
              className={`w-8 h-8 rounded-lg border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={handleExportFile}
              title="Export as Markdown file"
              className={`w-8 h-8 rounded-lg border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsZenMode(!isZenMode)}
              title={isZenMode ? 'Exit Zen Mode' : 'Zen Focus Mode'}
              className={`w-8 h-8 rounded-lg border transition-colors cursor-pointer flex items-center justify-center shrink-0 ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
              }`}
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onDelete(note)}
              title="Delete note"
              className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact More Menu for Mobile, Tablet & Desktop Mode on Mobile */}
          <div className="relative xl:hidden shrink-0" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More options"
              className={`w-8 h-8 rounded-lg border transition-colors cursor-pointer flex items-center justify-center shrink-0 min-h-[36px] min-w-[36px] ${
                isDark
                  ? 'bg-slate-800 text-slate-300 hover:text-white border-slate-700 hover:bg-slate-700'
                  : 'bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 hover:bg-slate-200'
              }`}
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div
                className={`absolute right-0 mt-1.5 w-48 border rounded-xl shadow-xl p-1 z-50 space-y-0.5 animate-in fade-in ${
                  isDark ? 'bg-[#1a1d2e] border-slate-700' : 'bg-white border-slate-200'
                }`}
              >
                <button
                  onClick={() => {
                    handleCopyMarkdown();
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'text-slate-200 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                </button>

                <button
                  onClick={() => {
                    handleExportFile();
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'text-slate-200 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .md</span>
                </button>

                <button
                  onClick={() => {
                    setIsZenMode(!isZenMode);
                    setShowMoreMenu(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold rounded-lg cursor-pointer transition-colors ${
                    isDark ? 'text-slate-200 hover:bg-slate-800 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  {isZenMode ? <Minimize2 className="w-3.5 h-3.5 text-slate-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{isZenMode ? 'Exit Zen Mode' : 'Zen Focus'}</span>
                </button>

                <div className={`border-t my-1 ${isDark ? 'border-slate-800' : 'border-slate-100'}`}></div>

                <button
                  onClick={() => {
                    onDelete(note);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold text-rose-500 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Note</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* MARKDOWN FORMATTING TOOLBAR */}
      {editorMode !== 'preview' && (
        <div
          className={`px-3 sm:px-4 py-1.5 border-b flex items-center gap-0.5 sm:gap-1 overflow-x-auto scrollbar-none shrink-0 z-10 select-none ${
            isDark ? 'bg-[#12131C] border-slate-800/80' : 'bg-slate-100/70 border-slate-200'
          }`}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          <button
            onClick={() => insertMarkdown('**', '**', 'bold text')}
            title="Bold (Cmd+B)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*', 'italic text')}
            title="Italic (Cmd+I)"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('~~', '~~', 'strikethrough')}
            title="Strikethrough"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className={`w-px h-4 mx-1 shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div>

          <button
            onClick={() => insertMarkdown('### ', '', 'Heading 3')}
            title="Heading"
            className={`px-2 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 font-mono ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            H3
          </button>
          <button
            onClick={() => insertMarkdown('- ', '', 'List item')}
            title="Bullet list"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('1. ', '', 'Numbered item')}
            title="Numbered list"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('- [ ] ', '', 'Task item')}
            title="Task checkbox"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <div className={`w-px h-4 mx-1 shrink-0 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`}></div>

          <button
            onClick={() => insertMarkdown('> ', '', 'Quote text')}
            title="Blockquote"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('`', '`', 'code')}
            title="Inline code"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('[', '](https://example.com)', 'link title')}
            title="Insert Link"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('\n---\n', '', '')}
            title="Horizontal divider"
            className={`p-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
              isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* WORKSPACE CANVAS / EDITOR BODY */}
      <div className="flex-1 flex overflow-hidden">
        {/* EDITING PANE */}
        {(editorMode === 'write' || editorMode === 'split') && (
          <div
            className={`flex-1 h-full flex flex-col p-4 sm:p-8 overflow-y-auto ${
              editorMode === 'split' ? (isDark ? 'border-r border-slate-800' : 'border-r border-slate-200') : ''
            }`}
          >
            <div className="max-w-3xl w-full mx-auto flex-1 flex flex-col space-y-4">
              {/* Note Title Input */}
              <input
                id="note-title-input"
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Note title..."
                className={`w-full bg-transparent border-none font-fredoka text-2xl sm:text-3xl font-bold focus:outline-hidden tracking-tight ${
                  isDark ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-400'
                }`}
              />

              {/* Tag Chips Input Section */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-quicksand font-semibold border ${
                      isDark
                        ? 'bg-slate-800 text-slate-300 border-slate-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span>#{t}</span>
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-500 ml-0.5 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleAddTag}
                  placeholder="+ Add tag..."
                  className={`bg-transparent border-none text-xs font-quicksand focus:outline-hidden py-1 px-2 min-w-[90px] ${
                    isDark ? 'text-slate-400 placeholder-slate-600' : 'text-slate-600 placeholder-slate-400'
                  }`}
                />
              </div>

              {/* Note Body Textarea */}
              <textarea
                id="note-body-input"
                ref={textareaRef}
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder="Write your note in Markdown here..."
                className={`flex-1 w-full bg-transparent border-none focus:outline-hidden resize-none font-nunito text-base leading-relaxed ${
                  isDark ? 'text-slate-200 placeholder-slate-600' : 'text-slate-800 placeholder-slate-400'
                }`}
              />
            </div>
          </div>
        )}

        {/* MARKDOWN LIVE PREVIEW PANE */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div
            className={`flex-1 h-full p-4 sm:p-8 overflow-y-auto ${
              isDark ? 'bg-[#0C0D13]' : 'bg-white'
            }`}
          >
            <div className="max-w-3xl w-full mx-auto markdown-preview">
              <h1 className={`border-b pb-3 mb-4 ${isDark ? 'border-slate-800' : 'border-slate-200'}`}>
                {title || 'Untitled Note'}
              </h1>
              {body.trim() ? (
                <Markdown>{body}</Markdown>
              ) : (
                <p className={`italic ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  No content to preview yet. Start typing on the left!
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM WORKSPACE STATUS BAR */}
      <footer
        className={`h-9 px-3 sm:px-6 border-t flex items-center justify-between text-[11px] font-quicksand shrink-0 z-20 safe-area-bottom ${
          isDark ? 'bg-[#141620] border-slate-800 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
        }`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 truncate">
          <span className="flex items-center gap-1.5 font-medium truncate">
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3 h-3 text-sky-400 animate-spin shrink-0" />
                <span className="truncate">Syncing note...</span>
              </>
            ) : syncStatus === 'offline' ? (
              <>
                <CloudOff className="w-3 h-3 text-amber-500 shrink-0" />
                <span className="truncate">Offline mode</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-emerald-500 shrink-0" />
                <span className="truncate">Saved locally & cloud</span>
              </>
            )}
          </span>

          {pendingCount > 0 && (
            <button
              onClick={onForceSync}
              className="text-amber-500 hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>({pendingCount} pending)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px] shrink-0 ml-2">
          <span>{wordCount} words</span>
          <span className="hidden sm:inline">{charCount} chars</span>
          <span className="hidden md:inline">{readTimeMinutes} min read</span>
        </div>
      </footer>
    </main>
  );
};
