import React, { useState, useEffect, useRef } from 'react';
import { Note, SyncStatus, NOTE_COLORS, NoteColor, FolderItem, DEFAULT_FOLDERS } from '../types';
import Markdown from 'react-markdown';
import { BrandLogo } from './BrandLogo';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
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
  Plus,
  X,
  FileDown,
  BookOpen,
  ArrowLeft,
  ChevronDown,
  Folder as FolderIcon
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
  folders = DEFAULT_FOLDERS
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [folder, setFolder] = useState<string>('Personal');
  const [isPinned, setIsPinned] = useState(false);
  const [colorTag, setColorTag] = useState<string>('default');
  const [tags, setTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [showTagInput, setShowTagInput] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'split' | 'preview'>('write');
  const [isZenMode, setIsZenMode] = useState(false);
  const [isSaved, setIsSaved] = useState(true);
  const [copied, setCopied] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state when active note changes
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setBody(note.body || '');
      setFolder(note.folder || 'Personal');
      setIsPinned(note.is_pinned || false);
      setColorTag(note.color_tag || 'default');
      setTags(note.tags || []);
      setIsSaved(true);
    } else {
      setTitle('');
      setBody('');
      setFolder(activeFolder || 'Personal');
      setIsPinned(false);
      setColorTag('default');
      setTags([]);
      setIsSaved(true);
    }
  }, [note?.id, activeFolder]);

  // Debounced auto-save handler
  const triggerAutoSave = (updatedFields: {
    title?: string;
    body?: string;
    is_pinned?: boolean;
    color_tag?: string;
    tags?: string[];
    folder?: string;
  }) => {
    setIsSaved(false);
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      if (!note && !updatedFields.title && !updatedFields.body) return;

      const payload = {
        id: note?.id,
        title: updatedFields.title !== undefined ? updatedFields.title : title,
        body: updatedFields.body !== undefined ? updatedFields.body : body,
        is_pinned: updatedFields.is_pinned !== undefined ? updatedFields.is_pinned : isPinned,
        color_tag: updatedFields.color_tag !== undefined ? updatedFields.color_tag : colorTag,
        tags: updatedFields.tags !== undefined ? updatedFields.tags : tags,
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

  const handleSelectColor = (c: string) => {
    setColorTag(c);
    setShowColorPicker(false);
    triggerAutoSave({ color_tag: c });
  };

  const handleAddTag = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = newTagInput.trim().replace(/^#/, '');
    if (clean && !tags.includes(clean)) {
      const nextTags = [...tags, clean];
      setTags(nextTags);
      setNewTagInput('');
      setShowTagInput(false);
      triggerAutoSave({ tags: nextTags });
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    triggerAutoSave({ tags: nextTags });
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
    a.download = `${(title || 'untitled-note').toLowerCase().replace(/\s+/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Stats calculation
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const activeColorObj = NOTE_COLORS[colorTag as NoteColor] || NOTE_COLORS.default;
  const currentFolderItem = folders.find((f) => f.id === folder) || { id: folder, label: folder, icon: '📁', color: '#2DD4BF' };

  if (!note) {
    const activeFolderObj = folders.find((f) => f.id === activeFolder);
    const folderTitle = activeFolderObj ? activeFolderObj.label : activeFolder;
    const folderIcon = activeFolderObj ? activeFolderObj.icon : '📁';

    return (
      <div className="flex-1 h-screen bg-[#121212] flex flex-col items-center justify-center text-center p-8">
        <div className="max-w-md w-full bg-[#1E1E2E] border border-white/[0.08] rounded-3xl p-8 shadow-[0_10px_30px_rgba(0,0,0,0.5)] flex flex-col items-center">
          {activeFolder ? (
            <div className="w-16 h-16 rounded-2xl bg-white/[0.06] border border-white/[0.1] flex items-center justify-center text-3xl mb-4 shadow-inner">
              {folderIcon}
            </div>
          ) : (
            <BrandLogo size="xl" className="mb-4 hover:scale-105 transition-transform" />
          )}

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 text-[#2DD4BF] text-xs font-outfit font-bold mb-2">
            <span>{activeFolder ? `📁 ${folderTitle}` : '✨ Welcome to DoodlePop!'}</span>
          </div>
          <h2 className="font-outfit text-2xl font-bold text-white tracking-tight">
            {activeFolder ? `No notes in ${folderTitle} yet!` : 'Ready to write something fun?'}
          </h2>
          <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans max-w-[280px]">
            {activeFolder
              ? `Start your very first note in ${folderTitle} to keep everything organized and colorful.`
              : 'Pick any note on the left, or tap the button below to start a brand new note!'}
          </p>

          <button
            onClick={() => onNewNote(activeFolder || undefined)}
            className="mt-6 px-6 py-3 rounded-2xl bg-gradient-to-r from-[#2DD4BF] to-[#14B8A6] hover:from-[#5EEAD4] hover:to-[#2DD4BF] text-slate-950 font-outfit font-bold text-xs tracking-wide transition-all shadow-[0_0_25px_rgba(45,212,191,0.35)] hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            {activeFolder ? `Create Note in ${folderTitle} ✨` : 'Make a New Note ✨'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main
      id="workspace-editor"
      className={`flex-1 h-full bg-[#121212] flex flex-col overflow-hidden relative ${
        isZenMode ? 'fixed inset-0 z-50 bg-[#121212]' : ''
      }`}
    >
      {/* TOP HEADER CONTROLS */}
      <header className="h-15 px-3 sm:px-6 bg-[#141418]/95 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between shrink-0 z-20 gap-2.5">
        {/* Left: Mobile Back Button + Folder Selector & Save Indicator */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              title="Back to all notes"
              className="md:hidden inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-slate-300 hover:text-white border border-white/[0.08] text-xs font-medium cursor-pointer shrink-0 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-[#2DD4BF]" />
              <span className="font-outfit font-semibold">Notes</span>
            </button>
          )}

          {/* Interactive Folder Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowFolderDropdown((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/[0.06] hover:bg-white/[0.1] text-slate-200 hover:text-white border border-white/[0.08] text-xs font-medium cursor-pointer transition-colors"
              title="Organize note into a folder"
            >
              <span>{currentFolderItem.icon}</span>
              <span className="truncate max-w-[85px] xs:max-w-[120px] sm:max-w-[150px] font-semibold">{currentFolderItem.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showFolderDropdown && (
              <div className="absolute left-0 top-full mt-1.5 w-48 bg-[#1A1A24] border border-white/[0.12] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95">
                <div className="px-2.5 py-1 text-[10px] font-cabinet uppercase tracking-wider text-slate-400 font-bold border-b border-white/[0.06]">
                  Move to Folder
                </div>
                <div className="max-h-48 overflow-y-auto py-1 space-y-0.5">
                  {folders.map((f) => (
                    <button
                      key={f.id}
                      type="button"
                      onClick={() => {
                        setFolder(f.id);
                        setShowFolderDropdown(false);
                        triggerAutoSave({ folder: f.id });
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs text-left cursor-pointer transition-colors ${
                        folder === f.id
                          ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] font-semibold'
                          : 'text-slate-300 hover:bg-white/[0.06] hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span>{f.icon}</span>
                        <span className="truncate">{f.label}</span>
                      </div>
                      {folder === f.id && <Check className="w-3 h-3 text-[#2DD4BF]" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <span className="text-slate-600 font-normal hidden xs:inline">/</span>

          <span className="text-slate-100 font-semibold truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[200px] md:max-w-[280px] text-xs">
            {title || 'Untitled Note'}
          </span>

          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/[0.04] border border-white/[0.08] text-[10px] sm:text-[11px] font-medium text-slate-300 whitespace-nowrap shrink-0">
            <div
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                isSaved ? 'bg-[#2DD4BF] shadow-[0_0_8px_rgba(45,212,191,0.6)]' : 'bg-amber-400 animate-pulse'
              }`}
            />
            <span>{isSaved ? 'Saved' : 'Saving...'}</span>
          </div>
        </div>

        {/* Right: Actions, View Mode & Controls */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Mobile View Toggle (Write vs Read) */}
          <button
            onClick={() => setEditorMode(editorMode === 'preview' ? 'write' : 'preview')}
            title={editorMode === 'preview' ? 'Switch to write note' : 'Switch to read preview'}
            className="sm:hidden p-2 rounded-xl bg-white/[0.04] border border-white/[0.08] text-slate-300 hover:text-white flex items-center justify-center shrink-0 cursor-pointer"
          >
            {editorMode === 'preview' ? (
              <Edit3 className="w-4 h-4 text-[#2DD4BF]" />
            ) : (
              <Eye className="w-4 h-4 text-[#2DD4BF]" />
            )}
          </button>

          {/* Desktop View Mode Switcher */}
          <div className="hidden sm:inline-flex items-center p-1 rounded-xl bg-white/[0.04] border border-white/[0.08]">
            <button
              onClick={() => setEditorMode('write')}
              title="Write mode"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                editorMode === 'write'
                  ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Write</span>
            </button>
            <button
              onClick={() => setEditorMode('split')}
              title="Side by side view"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                editorMode === 'split'
                  ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Side by side</span>
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              title="Read mode"
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                editorMode === 'preview'
                  ? 'bg-[#2DD4BF]/15 text-[#2DD4BF] font-semibold border border-[#2DD4BF]/30 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Read</span>
            </button>
          </div>

          <div className="w-[1px] h-5 bg-white/[0.08] mx-0.5 hidden sm:block" />

          {/* Star Note Button */}
          <button
            onClick={handleTogglePinLocal}
            title={isPinned ? 'Unstar this note' : 'Star this note'}
            className={`w-8.5 h-8.5 rounded-xl transition-all cursor-pointer border flex items-center justify-center shrink-0 ${
              isPinned
                ? 'bg-amber-400/15 text-amber-300 border-amber-400/35 shadow-[0_0_12px_rgba(251,191,36,0.2)]'
                : 'bg-white/[0.03] text-slate-400 hover:text-white border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.08]'
            }`}
          >
            <Star className={`w-4 h-4 ${isPinned ? 'fill-amber-400 text-amber-400' : ''}`} />
          </button>

          {/* Color Palette Selector */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowColorPicker(!showColorPicker)}
              title="Pick a color theme for this note"
              className="w-8.5 h-8.5 rounded-xl bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center"
            >
              <div
                className={`w-3.5 h-3.5 rounded-full border border-white/20 shadow-xs ${
                  colorTag === 'teal' ? 'bg-[#2DD4BF]' : activeColorObj.dot
                }`}
              />
            </button>

            {showColorPicker && (
              <div className="absolute right-0 mt-2 w-48 bg-[#181822] border border-white/[0.12] rounded-2xl shadow-2xl p-2 z-50 space-y-1 backdrop-blur-xl">
                <span className="font-outfit text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 block py-1">
                  Color Tag
                </span>
                {Object.values(NOTE_COLORS).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => handleSelectColor(c.id)}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl text-xs transition-colors cursor-pointer ${
                      colorTag === c.id
                        ? 'bg-white/[0.1] text-white font-semibold'
                        : 'text-slate-300 hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full ${c.dot} border border-white/10`} />
                    <span>{c.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Copy Note */}
          <button
            onClick={handleCopyMarkdown}
            title="Copy markdown text"
            className="w-8.5 h-8.5 rounded-xl bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            {copied ? <Check className="w-4 h-4 text-[#2DD4BF]" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Export File */}
          <button
            onClick={handleExportFile}
            title="Export note as .md"
            className="w-8.5 h-8.5 rounded-xl bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <FileDown className="w-4 h-4" />
          </button>

          {/* Fullscreen Mode Toggle */}
          <button
            onClick={() => setIsZenMode(!isZenMode)}
            title={isZenMode ? 'Exit full screen' : 'Full screen focus'}
            className="w-8.5 h-8.5 rounded-xl bg-white/[0.03] text-slate-400 hover:text-white border border-white/[0.08] hover:border-white/[0.16] hover:bg-white/[0.08] transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>

          {/* Delete Button */}
          <button
            onClick={() => onDelete(note)}
            title="Delete note"
            className="w-8.5 h-8.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/35 transition-all cursor-pointer flex items-center justify-center shrink-0"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* EASY WRITING TOOLBAR */}
      {editorMode !== 'preview' && (
        <div
          id="markdown-toolbar"
          className="px-4 sm:px-6 py-2 bg-[#171820]/90 border-b border-white/[0.06] flex items-center justify-between gap-3 overflow-x-auto shrink-0"
        >
          <div className="flex items-center gap-1 shrink-0">
            {/* Text Formats */}
            <button
              onClick={() => insertMarkdown('**', '**', 'bold text')}
              title="Bold (**text**)"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('*', '*', 'italic text')}
              title="Italic (*text*)"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('~~', '~~', 'crossed out')}
              title="Strikethrough (~~text~~)"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('`', '`', 'code')}
              title="Inline Code (`code`)"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Code className="w-3.5 h-3.5" />
            </button>

            <div className="w-[1px] h-4 bg-white/[0.1] mx-1.5" />

            {/* Headings */}
            <button
              onClick={() => insertMarkdown('# ', '', 'Heading 1')}
              title="Heading 1"
              className="h-7.5 px-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer font-outfit flex items-center justify-center"
            >
              H1
            </button>
            <button
              onClick={() => insertMarkdown('## ', '', 'Heading 2')}
              title="Heading 2"
              className="h-7.5 px-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer font-outfit flex items-center justify-center"
            >
              H2
            </button>
            <button
              onClick={() => insertMarkdown('### ', '', 'Heading 3')}
              title="Heading 3"
              className="h-7.5 px-2 rounded-lg text-xs font-bold text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer font-outfit flex items-center justify-center"
            >
              H3
            </button>

            <div className="w-[1px] h-4 bg-white/[0.1] mx-1.5" />

            {/* Lists & Blocks */}
            <button
              onClick={() => insertMarkdown('- ', '', 'List item')}
              title="Bullet list"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('1. ', '', 'Numbered item')}
              title="Numbered list"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('- [ ] ', '', 'Task item')}
              title="Task Checklist"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <CheckSquare className="w-3.5 h-3.5 text-[#2DD4BF]" />
            </button>
            <button
              onClick={() => insertMarkdown('> ', '', 'Quote')}
              title="Blockquote"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('[', '](https://example.com)', 'link text')}
              title="Link"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => insertMarkdown('\n---\n')}
              title="Horizontal rule"
              className="h-7.5 w-7.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/[0.08] transition-colors cursor-pointer flex items-center justify-center"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-400 font-medium shrink-0">
            <span>Markdown formatting enabled</span>
          </div>
        </div>
      )}

      {/* EDITOR CONTENT CANVAS */}
      <div className="flex-1 overflow-y-auto">
        <div
          className={`max-w-4xl mx-auto px-6 sm:px-10 py-8 min-h-full flex flex-col ${
            editorMode === 'split' ? 'max-w-7xl' : ''
          }`}
        >
          {/* Note Title Input */}
          <input
            id="workspace-note-title"
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            placeholder="Note title..."
            className="w-full font-outfit text-3xl sm:text-4xl font-extrabold text-white placeholder-white/20 bg-transparent border-none focus:outline-hidden tracking-tight leading-tight mb-4"
          />

          {/* Tag Manager */}
          <div className="flex flex-wrap items-center gap-2 mb-6 pb-4 border-b border-white/[0.06]">
            {tags.map((tag) => (
              <span
                key={tag}
                className="group inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#1E1E2E] text-slate-200 text-xs font-cabinet border border-white/[0.08] shadow-xs"
              >
                <span className="text-[#2DD4BF] font-semibold">#</span>
                <span>{tag}</span>
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="opacity-60 group-hover:opacity-100 hover:text-rose-400 ml-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {showTagInput ? (
              <form onSubmit={handleAddTag} className="inline-flex items-center">
                <input
                  type="text"
                  autoFocus
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onBlur={() => handleAddTag()}
                  placeholder="New tag..."
                  className="w-28 px-2.5 py-1 rounded-lg bg-[#1E1E2E] border border-[#2DD4BF]/50 text-xs text-white placeholder-slate-400 focus:outline-hidden"
                />
              </form>
            ) : (
              <button
                onClick={() => setShowTagInput(true)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] text-slate-400 hover:text-slate-200 text-xs font-medium transition-colors cursor-pointer border border-dashed border-white/[0.1]"
              >
                <Plus className="w-3 h-3" />
                <span>Add Tag</span>
              </button>
            )}
          </div>

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
                  placeholder="Type your thoughts, lists, or stories here..."
                  className="w-full flex-1 bg-transparent text-slate-200 placeholder-white/20 border-none focus:outline-hidden resize-none font-sans text-sm sm:text-base leading-relaxed tracking-normal min-h-[420px]"
                />
              </div>
            )}

            {/* SPLIT / PREVIEW MARKDOWN AREA */}
            {(editorMode === 'preview' || editorMode === 'split') && (
              <div
                className={`flex-1 overflow-y-auto markdown-preview bg-[#181824] p-6 rounded-2xl border border-white/[0.08] shadow-[0_4px_20px_rgba(0,0,0,0.3)] min-h-[420px] ${
                  editorMode === 'preview' ? 'w-full' : ''
                }`}
              >
                {body.trim() ? (
                  <Markdown>{body}</Markdown>
                ) : (
                  <div className="text-slate-400 italic text-sm">
                    No text to show yet. Start typing your note.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM FOOTER STATUS BAR */}
      <footer className="h-auto py-2 px-3 sm:px-6 bg-[#141416] border-t border-white/[0.06] flex items-center justify-between gap-2 shrink-0 text-xs text-slate-400 font-medium z-20 flex-wrap">
        {/* Left: Word & Character Count */}
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="font-jetbrains text-[10px] sm:text-[11px] text-slate-400">
            {wordCount} words
          </span>
          <span className="text-slate-500">•</span>
          <span className="font-jetbrains text-[10px] sm:text-[11px] text-slate-400">
            {charCount} chars
          </span>
          <span className="text-slate-500 hidden xs:inline">•</span>
          <span className="font-jetbrains text-[10px] sm:text-[11px] text-slate-400 hidden xs:inline">
            {readTimeMinutes} min read
          </span>
        </div>

        {/* Right: OFFLINE STATUS */}
        <div className="flex items-center gap-2">
          <div
            onClick={onForceSync}
            title={
              syncStatus === 'syncing'
                ? 'Syncing notes...'
                : syncStatus === 'offline'
                ? 'Working offline. Tap to reconnect.'
                : 'All notes are saved and ready'
            }
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-cabinet font-semibold transition-all cursor-pointer border ${
              syncStatus === 'offline'
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/25 hover:bg-amber-500/20'
                : syncStatus === 'syncing'
                ? 'bg-[#2DD4BF]/10 text-[#2DD4BF] border-[#2DD4BF]/30'
                : 'bg-white/[0.04] text-slate-300 hover:text-white border-white/[0.08] hover:bg-white/[0.08]'
            }`}
          >
            {syncStatus === 'syncing' ? (
              <RefreshCw className="w-3.5 h-3.5 text-[#2DD4BF] animate-spin shrink-0" />
            ) : syncStatus === 'offline' ? (
              <CloudOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            ) : (
              <Cloud className="w-3.5 h-3.5 text-[#2DD4BF] shrink-0" />
            )}

            <span className="tracking-tight">
              {syncStatus === 'offline'
                ? 'Offline'
                : syncStatus === 'syncing'
                ? 'Saving...'
                : 'Device Synced'}
            </span>

            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400/20 text-amber-300 text-[9px] font-jetbrains">
                {pendingCount}
              </span>
            )}
          </div>
        </div>
      </footer>
    </main>
  );
};
