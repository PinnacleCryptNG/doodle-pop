import React, { useState, useEffect, useRef } from 'react';
import { Note, SyncStatus, NOTE_COLORS, NoteColor, FolderItem, DEFAULT_FOLDERS, getThemeConfig } from '../types';
import Markdown from 'react-markdown';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Quote,
  List,
  ListOrdered,
  CheckSquare,
  Minus,
  Link as LinkIcon,
  Cloud,
  CloudOff,
  RefreshCw,
  Star,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  Columns,
  Eye,
  Edit3,
  FileDown,
  ArrowLeft,
  ChevronDown,
  Sparkles,
  MoreHorizontal,
  Palette
} from 'lucide-react';

interface WorkspaceEditorProps {
  note: Note | null;
  onSave: (data: {
    id?: string;
    title: string;
    body: string;
    is_pinned: boolean;
    color_tag: string;
    tags: string[];
    folder?: string;
  }) => Promise<void>;
  onDelete: (note: Note) => void;
  onTogglePin: (id: string, current: boolean) => void;
  syncStatus: SyncStatus;
  pendingCount: number;
  onForceSync: () => void;
  onNewNote: (folder?: string) => void;
  onBack?: () => void;
  activeFolder?: string | null;
  folders?: FolderItem[];
  pageTheme?: NoteColor;
  onThemeChange?: (color: NoteColor) => void;
}

export const WorkspaceEditor: React.FC<WorkspaceEditorProps> = ({
  note,
  onSave,
  onDelete,
  onTogglePin,
  syncStatus,
  pendingCount,
  onForceSync,
  onNewNote,
  onBack,
  activeFolder = null,
  folders = DEFAULT_FOLDERS,
  pageTheme = 'cyan',
  onThemeChange
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [folder, setFolder] = useState<string>('Personal');
  const [isPinned, setIsPinned] = useState(false);
  const [colorTag, setColorTag] = useState<NoteColor>(pageTheme);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'split' | 'preview'>('write');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const colorPickerRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (colorPickerRef.current && !colorPickerRef.current.contains(target)) {
        setShowColorPicker(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setShowMoreMenu(false);
      }
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(target)) {
        setShowFolderDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync state when active note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setBody(note.body || '');
      setFolder(note.folder || 'Personal');
      setIsPinned(note.is_pinned || false);
      const c = ((note.color_tag as NoteColor) && NOTE_COLORS[note.color_tag as NoteColor])
        ? (note.color_tag as NoteColor)
        : pageTheme;
      setColorTag(c);
      setIsSaved(true);
    } else {
      setTitle('');
      setBody('');
      setFolder(activeFolder || 'Personal');
      setIsPinned(false);
      setColorTag(pageTheme || 'cyan');
      setIsSaved(true);
    }
  }, [note?.id, activeFolder]);

  // Debounced auto-save handler
  const triggerAutoSave = (updatedFields: {
    title?: string;
    body?: string;
    is_pinned?: boolean;
    color_tag?: string;
    folder?: string;
  }) => {
    setIsSaved(false);
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      const currentTitle = updatedFields.title !== undefined ? updatedFields.title : title;
      const currentBody = updatedFields.body !== undefined ? updatedFields.body : body;

      // Don't auto-save if brand new empty note and user hasn't typed anything
      if (!note && !currentTitle.trim() && !currentBody.trim()) {
        setIsSaved(true);
        return;
      }

      const payload = {
        id: note?.id,
        title: currentTitle.trim() || 'Untitled Doodle',
        body: currentBody,
        is_pinned: updatedFields.is_pinned !== undefined ? updatedFields.is_pinned : isPinned,
        color_tag: updatedFields.color_tag !== undefined ? updatedFields.color_tag : colorTag,
        tags: note?.tags || [],
        folder: updatedFields.folder !== undefined ? updatedFields.folder : folder,
      };

      await onSave(payload);
      setIsSaved(true);
    }, 400);
  };

  const handleTitleChange = (val: string) => {
    setTitle(val);
    triggerAutoSave({ title: val });
  };

  const handleBodyChange = (val: string) => {
    setBody(val);
    triggerAutoSave({ body: val });
  };

  const handleTogglePinLocal = () => {
    const nextPin = !isPinned;
    setIsPinned(nextPin);
    triggerAutoSave({ is_pinned: nextPin });
    if (note) {
      onTogglePin(note.id, isPinned);
    }
  };

  const handleSelectColor = (c: NoteColor) => {
    setColorTag(c);
    setShowColorPicker(false);
    triggerAutoSave({ color_tag: c });
    if (onThemeChange) {
      onThemeChange(c);
    }
  };

  // Helper to insert markdown syntax into textarea
  const insertMarkdown = (prefix: string, suffix: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = body;
    const selection = currentText.substring(start, end) || placeholder;

    const newText =
      currentText.substring(0, start) +
      prefix +
      selection +
      suffix +
      currentText.substring(end);

    setBody(newText);
    triggerAutoSave({ body: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selection.length
      );
    }, 10);
  };

  // Copy note as text
  const handleCopyMarkdown = async () => {
    const fullContent = `# ${title || 'Untitled'}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(fullContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Export note file
  const handleExportFile = () => {
    const fullContent = `# ${title || 'Untitled'}\n\n${body}`;
    const blob = new Blob([fullContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(title || 'untitled-doodle').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const activeColorObj = getThemeConfig(colorTag || pageTheme);
  const currentFolderItem = folders.find((f) => f.id === folder) || { id: folder, label: folder, icon: '📁', color: '#38BDF8' };

  return (
    <main
      id="workspace-editor"
      className={`flex-1 h-full flex flex-col overflow-hidden relative transition-colors duration-500 ${
        isZenMode ? 'fixed inset-0 z-50 bg-[#0F101E]' : 'bg-transparent'
      }`}
    >
      {/* Dynamic Ambient Background Glow Spheres */}
      <div
        className="absolute top-10 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none transition-all duration-700 animate-pulse-glow -z-10"
        style={{ backgroundColor: activeColorObj.primary }}
      />
      <div
        className="absolute bottom-10 left-1/3 w-80 h-80 rounded-full blur-3xl opacity-15 pointer-events-none transition-all duration-700 -z-10"
        style={{ backgroundColor: activeColorObj.auroraOrbs[1]?.color || activeColorObj.primaryHover }}
      />

      {/* TOP HEADER CONTROLS */}
      <header className="h-16 px-4 sm:px-6 bg-[#16172B]/80 backdrop-blur-xl border-b border-white/10 flex items-center justify-between shrink-0 z-20 gap-3 relative">
        {/* Left Side: Mobile Back Button + Folder Selector + Title Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Back to all notes"
              className="md:hidden inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-quicksand font-bold cursor-pointer shrink-0 transition-all btn-bouncy"
            >
              <ArrowLeft className="w-4 h-4 text-cyan-300" />
              <span>Doodles</span>
            </button>
          )}

          {/* Interactive Folder Selector */}
          <div className="relative shrink-0" ref={folderDropdownRef}>
            <button
              type="button"
              onClick={() => setShowFolderDropdown((prev) => !prev)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 text-white border border-white/10 text-xs font-quicksand font-bold cursor-pointer transition-all hover:border-white/20"
              title="Organize note into a folder"
            >
              <span className="text-sm">{currentFolderItem.icon}</span>
              <span className="truncate max-w-[80px] sm:max-w-[130px]">{currentFolderItem.label}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showFolderDropdown && (
              <div className="absolute left-0 top-full mt-2 w-52 bg-[#1B1C33] border border-white/15 rounded-2xl shadow-2xl p-1.5 z-50 animate-in fade-in zoom-in-95 backdrop-blur-2xl">
                <div className="px-3 py-1.5 text-[10px] font-fredoka uppercase tracking-wider text-slate-400 font-bold border-b border-white/10">
                  Move to Space
                </div>
                <div className="max-h-52 overflow-y-auto py-1 space-y-0.5">
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFolder(f.id);
                        setShowFolderDropdown(false);
                        triggerAutoSave({ folder: f.id });
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-quicksand text-left cursor-pointer transition-colors ${
                        folder === f.id
                          ? 'bg-white/10 text-white font-bold'
                          : 'text-slate-300 hover:bg-white/5 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <span>{f.icon}</span>
                        <span className="truncate">{f.label}</span>
                      </div>
                      {folder === f.id && <Check className="w-3.5 h-3.5" style={{ color: activeColorObj.primary }} />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="text-white/20 font-normal hidden sm:inline shrink-0">/</span>

          {/* Truncated note title in header */}
          <span className="font-fredoka text-slate-200 font-semibold truncate text-xs sm:text-sm max-w-[120px] sm:max-w-[200px] md:max-w-[280px] hidden xs:inline">
            {title || 'Untitled Doodle'}
          </span>

          {/* Saved Status Indicator */}
          <div className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-quicksand font-semibold text-slate-300 whitespace-nowrap shrink-0">
            <div
              className={`w-2 h-2 rounded-full transition-all ${
                isSaved ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-amber-400 animate-ping'
              }`}
            />
            <span>{isSaved ? 'Auto-Saved' : 'Saving...'}</span>
          </div>
        </div>

        {/* Right Side: Theme Color Picker + Star + View Modes + Action Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* THEME COLOR SELECTOR - Synchronizes Entire Workspace & Page Theme */}
          <div className="relative shrink-0" ref={colorPickerRef}>
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title={`Active Theme: ${activeColorObj.label} (Changes Entire Workspace Palette)`}
              className="px-3 py-1.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 transition-all cursor-pointer flex items-center gap-2 shrink-0 btn-bouncy"
              style={{
                borderColor: showColorPicker ? activeColorObj.primary : undefined,
                boxShadow: showColorPicker ? `0 0 16px ${activeColorObj.glow}` : undefined,
              }}
            >
              <div
                className="w-4 h-4 rounded-full border border-white/30 shadow-sm shrink-0 animate-pulse-glow"
                style={{ backgroundColor: activeColorObj.primary }}
              />
              <span className="text-xs font-quicksand font-bold text-white hidden sm:inline">
                {activeColorObj.label.split(' ')[0]}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 mt-2 w-64 bg-[#1B1C33] border border-white/20 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] p-3 z-50 space-y-2 backdrop-blur-2xl animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-2 text-xs font-fredoka font-bold text-white">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>Workspace Palette</span>
                  </div>
                  <span className="text-[9px] font-fredoka uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-cyan-300">
                    Full Theme
                  </span>
                </div>
                <div className="space-y-1 pt-1 max-h-72 overflow-y-auto">
                  {(Object.keys(NOTE_COLORS) as NoteColor[]).map((key) => {
                    const c = NOTE_COLORS[key];
                    const isCurrent = (colorTag === key) || (key === 'cyan' && colorTag === 'default');
                    return (
                      <button
                        key={c.id}
                        onClick={() => handleSelectColor(c.id)}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-quicksand font-bold transition-all cursor-pointer ${
                          isCurrent
                            ? 'bg-white/15 text-white border border-white/20 shadow-sm'
                            : 'text-slate-300 hover:bg-white/5 hover:text-white border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-full border border-white/30 shadow-xs shrink-0"
                            style={{ backgroundColor: c.primary }}
                          />
                          <span>{c.label}</span>
                        </div>
                        {isCurrent && (
                          <Check className="w-4 h-4" style={{ color: c.primary }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Star / Pin Button */}
          <button
            onClick={handleTogglePinLocal}
            title={isPinned ? 'Unstar note' : 'Star note'}
            className={`w-9 h-9 rounded-2xl transition-all cursor-pointer border flex items-center justify-center shrink-0 btn-bouncy ${
              isPinned
                ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-[0_0_16px_rgba(251,191,36,0.35)]'
                : 'bg-white/5 text-slate-400 hover:text-white border-white/10 hover:border-white/20 hover:bg-white/10'
            }`}
          >
            <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Mobile View Toggle */}
          <button
            onClick={() => setEditorMode(editorMode === 'preview' ? 'write' : 'preview')}
            title={editorMode === 'preview' ? 'Switch to edit doodle' : 'Switch to read preview'}
            className="sm:hidden p-2 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            {editorMode === 'preview' ? (
              <Edit3 className="w-4 h-4 text-cyan-300" />
            ) : (
              <Eye className="w-4 h-4 text-cyan-300" />
            )}
          </button>

          {/* Desktop View Mode Switcher */}
          <div className="hidden sm:inline-flex items-center p-1 rounded-2xl bg-white/5 border border-white/10 shrink-0">
            <button
              onClick={() => setEditorMode('write')}
              title="Write mode"
              className={`px-3 py-1 rounded-xl text-xs font-quicksand font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                editorMode === 'write'
                  ? 'bg-white/15 text-white border border-white/20 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              onClick={() => setEditorMode('split')}
              title="Side-by-side view"
              className={`px-3 py-1 rounded-xl text-xs font-quicksand font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                editorMode === 'split'
                  ? 'bg-white/15 text-white border border-white/20 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              title="Read mode"
              className={`px-3 py-1 rounded-xl text-xs font-quicksand font-bold transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                editorMode === 'preview'
                  ? 'bg-white/15 text-white border border-white/20 shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Read</span>
            </button>
          </div>

          {/* Desktop Direct Quick Actions */}
          <div className="hidden lg:flex items-center gap-2 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              title="Copy markdown text"
              className="w-9 h-9 rounded-2xl bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center shrink-0 btn-bouncy"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            <button
              onClick={handleExportFile}
              title="Export doodle as .md"
              className="w-9 h-9 rounded-2xl bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center shrink-0 btn-bouncy"
            >
              <FileDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsZenMode(!isZenMode)}
              title={isZenMode ? 'Exit full screen' : 'Full screen focus mode'}
              className="w-9 h-9 rounded-2xl bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center shrink-0 btn-bouncy"
            >
              {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {note && (
              <button
                onClick={() => onDelete(note)}
                title="Delete note"
                className="w-9 h-9 rounded-2xl bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/25 hover:border-rose-500/40 transition-all cursor-pointer flex items-center justify-center shrink-0 btn-bouncy"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Compact More Menu for Mobile & Tablet */}
          <div className="relative lg:hidden shrink-0" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More actions"
              className="w-9 h-9 rounded-2xl bg-white/5 text-slate-300 hover:text-white border border-white/10 hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-2 w-52 bg-[#1B1C33] border border-white/20 rounded-3xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-2xl animate-in fade-in zoom-in-95">
                <button
                  onClick={() => {
                    handleCopyMarkdown();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-quicksand font-bold text-slate-200 hover:bg-white/10 hover:text-white rounded-xl cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-slate-400" />}
                  <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                </button>

                <button
                  onClick={() => {
                    handleExportFile();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-quicksand font-bold text-slate-200 hover:bg-white/10 hover:text-white rounded-xl cursor-pointer transition-colors"
                >
                  <FileDown className="w-4 h-4 text-slate-400" />
                  <span>Export as .md</span>
                </button>

                <button
                  onClick={() => {
                    setIsZenMode(!isZenMode);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2 text-xs font-quicksand font-bold text-slate-200 hover:bg-white/10 hover:text-white rounded-xl cursor-pointer transition-colors"
                >
                  {isZenMode ? (
                    <Minimize2 className="w-4 h-4 text-slate-400" />
                  ) : (
                    <Maximize2 className="w-4 h-4 text-slate-400" />
                  )}
                  <span>{isZenMode ? 'Exit Full Screen' : 'Focus Mode'}</span>
                </button>

                {note && (
                  <>
                    <div className="h-[1px] bg-white/10 my-1" />
                    <button
                      onClick={() => {
                        setShowMoreMenu(false);
                        onDelete(note);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 text-xs font-quicksand font-bold text-rose-400 hover:bg-rose-500/15 rounded-xl cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-rose-400" />
                      <span>Delete Doodle</span>
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* EASY WRITING TOOLBAR */}
      {editorMode !== 'preview' && (
        <div
          id="markdown-toolbar"
          className="px-4 sm:px-6 py-2.5 bg-[#141528]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between gap-3 overflow-x-auto shrink-0"
        >
          <div className="flex items-center gap-1 shrink-0">
            {/* Text Formats */}
            <button
              onClick={() => insertMarkdown('**', '**', 'bold text')}
              title="Bold (**text**)"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('*', '*', 'italic text')}
              title="Italic (*text*)"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('~~', '~~', 'crossed out')}
              title="Strikethrough (~~text~~)"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('`', '`', 'code')}
              title="Inline Code (`code`)"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-white/10 mx-1.5" />

            {/* Headings */}
            <button
              onClick={() => insertMarkdown('# ', '', 'Heading 1')}
              title="Heading 1"
              className="h-8 px-2.5 rounded-xl text-xs font-fredoka font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              H1
            </button>
            <button
              onClick={() => insertMarkdown('## ', '', 'Heading 2')}
              title="Heading 2"
              className="h-8 px-2.5 rounded-xl text-xs font-fredoka font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              H2
            </button>
            <button
              onClick={() => insertMarkdown('### ', '', 'Heading 3')}
              title="Heading 3"
              className="h-8 px-2.5 rounded-xl text-xs font-fredoka font-bold text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              H3
            </button>

            <div className="w-[1px] h-4 bg-white/10 mx-1.5" />

            {/* Lists & Blocks */}
            <button
              onClick={() => insertMarkdown('- ', '', 'List item')}
              title="Bullet list"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('1. ', '', 'Numbered item')}
              title="Numbered list"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('- [ ] ', '', 'Task item')}
              title="Task Checklist"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <CheckSquare className="w-3.5 h-3.5 text-cyan-300" />
            </button>
            <button
              onClick={() => insertMarkdown('> ', '', 'Quote')}
              title="Blockquote"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('[', '](https://example.com)', 'link text')}
              title="Link"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('\n---\n')}
              title="Horizontal rule"
              className="h-8 w-8 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all cursor-pointer flex items-center justify-center btn-bouncy"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] font-quicksand font-bold text-cyan-300 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Markdown Live Editor</span>
          </div>
        </div>
      )}

      {/* EDITOR CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={`max-w-4xl mx-auto px-6 sm:px-12 py-8 min-h-full flex flex-col ${
            editorMode === 'split' ? 'max-w-7xl' : ''
          }`}
        >
          {/* Note Title Input */}
          <input
            id="workspace-note-title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Give your doodle a title..."
            className="w-full font-fredoka text-3xl sm:text-4xl lg:text-5xl font-bold text-white placeholder-white/20 bg-transparent border-none focus:outline-hidden tracking-tight leading-tight mb-6"
          />

          {/* MAIN WRITING / PREVIEW AREA */}
          <div className="flex-1 flex gap-8">
            {/* WRITING TEXTAREA */}
            {(editorMode === 'write' || editorMode === 'split') && (
              <div className="flex-1 flex flex-col">
                <textarea
                  id="workspace-note-body"
                  ref={textareaRef}
                  value={body}
                  onChange={(e) => handleBodyChange(e.target.value)}
                  placeholder="Pour your thoughts, sketches, ideas, and stories here..."
                  className="w-full flex-1 bg-transparent text-slate-100 placeholder-white/20 border-none focus:outline-hidden resize-none font-nunito text-base sm:text-lg leading-relaxed tracking-normal min-h-[440px]"
                />
              </div>
            )}

            {/* SPLIT / PREVIEW MARKDOWN AREA */}
            {(editorMode === 'preview' || editorMode === 'split') && (
              <div
                className={`flex-1 overflow-y-auto markdown-preview glass-panel p-6 sm:p-8 rounded-3xl min-h-[440px] text-slate-100 font-nunito ${
                  editorMode === 'preview' ? 'w-full' : ''
                }`}
              >
                {body.trim() ? (
                  <Markdown>{body}</Markdown>
                ) : (
                  <div className="text-slate-400 italic text-sm font-quicksand flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-300" />
                    <span>Your formatted markdown preview will appear here in real-time.</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER STATUS BAR */}
      <footer className="h-auto py-2.5 px-4 sm:px-8 bg-[#141528]/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between gap-3 shrink-0 text-xs font-quicksand font-semibold text-slate-400 z-20 flex-wrap">
        {/* Left: Word & Character Count */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <span className="font-mono text-[11px] text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">
            {wordCount} words
          </span>
          <span className="text-white/20">•</span>
          <span className="font-mono text-[11px] text-slate-300 bg-white/5 px-2.5 py-0.5 rounded-lg border border-white/5">
            {charCount} chars
          </span>
          <span className="text-white/20 hidden xs:inline">•</span>
          <span className="font-mono text-[11px] text-cyan-300 hidden xs:inline">
            {readTimeMinutes} min read
          </span>
        </div>

        {/* Right: OFFLINE STATUS */}
        <div className="flex items-center gap-2">
          <div
            onClick={onForceSync}
            title={
              syncStatus === 'syncing'
                ? 'Syncing notes with cloud...'
                : syncStatus === 'offline'
                ? 'Working offline. Tap to reconnect.'
                : 'All notes are safely saved and synced'
            }
            className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-quicksand font-bold transition-all cursor-pointer border btn-bouncy ${
              syncStatus === 'offline'
                ? 'bg-amber-500/15 text-amber-300 border-amber-500/30 hover:bg-amber-500/25'
                : syncStatus === 'syncing'
                ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/40'
                : 'bg-white/5 text-slate-200 hover:text-white border-white/10 hover:bg-white/10'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-cyan-300 animate-spin shrink-0" />
            ) : syncStatus === 'offline' ? (
              <CloudOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            )}

            <span>
              {syncStatus === 'offline'
                ? 'Offline Mode'
                : syncStatus === 'syncing'
                ? 'Syncing...'
                : 'Synced to Cloud'}
            </span>

            {pendingCount > 0 && (
              <span className="px-2 py-0.2 rounded-full bg-amber-400 text-amber-950 text-[10px] font-fredoka font-bold">
                {pendingCount}
              </span>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
};

