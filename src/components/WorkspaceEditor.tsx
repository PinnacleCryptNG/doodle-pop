import React, { useState, useEffect, useRef } from 'react';
import { Note, NoteColor, NOTE_COLORS, THEME_PALETTES, SyncStatus, FolderItem, DEFAULT_FOLDERS, getThemeConfig } from '../types';
import { FolderIcon } from './FolderIcon';
import Markdown from 'react-markdown';
import {
  Pin,
  Trash2,
  Copy,
  Check,
  Maximize2,
  Minimize2,
  FileDown,
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
  Palette,
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
  pageTheme?: NoteColor;
  onThemeChange?: (theme: NoteColor) => void;
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
  pageTheme = 'obsidian',
  onThemeChange,
}) => {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [colorTag, setColorTag] = useState<NoteColor>(pageTheme);
  const [folder, setFolder] = useState<string>('Personal');
  const [copied, setCopied] = useState(false);
  const [isZenMode, setIsZenMode] = useState(false);
  const [editorMode, setEditorMode] = useState<'write' | 'preview' | 'split'>('write');
  const [showFolderDropdown, setShowFolderDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const folderDropdownRef = useRef<HTMLDivElement>(null);
  const themeDropdownRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  // Sync state with selected note
  useEffect(() => {
    if (note) {
      setTitle(note.title || '');
      setBody(note.body || '');
      setTags(Array.isArray(note.tags) ? note.tags : []);
      setColorTag((note.color_tag as NoteColor) || pageTheme || 'obsidian');
      setFolder(note.folder || 'Personal');
    } else {
      setTitle('');
      setBody('');
      setTags([]);
      setColorTag(pageTheme || 'obsidian');
      setFolder('Personal');
    }
  }, [note?.id, pageTheme]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (folderDropdownRef.current && !folderDropdownRef.current.contains(e.target as Node)) {
        setShowFolderDropdown(false);
      }
      if (themeDropdownRef.current && !themeDropdownRef.current.contains(e.target as Node)) {
        setShowThemeDropdown(false);
      }
      if (moreMenuRef.current && !moreMenuRef.current.contains(e.target as Node)) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  // Debounced auto-save
  const triggerAutoSave = (updatedFields: Partial<Note>) => {
    if (!note) return;
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate({
        ...note,
        ...updatedFields,
        updated_at: new Date().toISOString(),
      });
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

  const handleFolderChange = (newFolder: string) => {
    setFolder(newFolder);
    setShowFolderDropdown(false);
    triggerAutoSave({ folder: newFolder });
  };

  const handleThemeChange = (newColor: NoteColor) => {
    setColorTag(newColor);
    setShowThemeDropdown(false);
    triggerAutoSave({ color_tag: newColor });
    if (onThemeChange) {
      onThemeChange(newColor);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '').toLowerCase();
      if (clean && !tags.includes(clean)) {
        const nextTags = [...tags, clean];
        setTags(nextTags);
        setTagInput('');
        triggerAutoSave({ tags: nextTags });
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const nextTags = tags.filter((t) => t !== tagToRemove);
    setTags(nextTags);
    triggerAutoSave({ tags: nextTags });
  };

  const handleCopyMarkdown = () => {
    const content = `# ${title}\n\n${body}`;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportFile = () => {
    const content = `# ${title || 'Untitled Note'}\n\n${body}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${(title || 'note').toLowerCase().replace(/\s+/g, '-')}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Markdown formatting toolbar helper
  const insertMarkdown = (prefix: string, suffix: string = '', defaultText: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const currentText = textarea.value;
    const selectedText = currentText.substring(start, end) || defaultText;

    const replacement = `${prefix}${selectedText}${suffix}`;
    const newText = currentText.substring(0, start) + replacement + currentText.substring(end);

    setBody(newText);
    triggerAutoSave({ body: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selectedText.length
      );
    }, 0);
  };

  const wordCount = body.trim() ? body.trim().split(/\s+/).filter(Boolean).length : 0;
  const charCount = body.length;
  const readTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  const currentFolderObj = folders.find((f) => f.id === folder);
  const themeConfig = getThemeConfig(colorTag || pageTheme);

  if (!note) {
    return (
      <main
        id="workspace-editor"
        className="flex-1 h-full bg-[#0F1117] flex flex-col items-center justify-center text-center p-6 select-none"
      >
        <div
          className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-4"
          style={{ color: themeConfig.primaryHover }}
        >
          <FolderIcon icon="folder" className="w-8 h-8" />
        </div>
        <h2 className="font-fredoka text-xl font-bold text-white mb-1">
          No Note Selected
        </h2>
        <p className="font-quicksand text-sm text-slate-400 max-w-sm">
          Select a note from the list on the left, or create a new note to start writing.
        </p>
      </main>
    );
  }

  return (
    <main
      id="workspace-editor"
      className={`relative flex-1 h-full bg-[#0F1117] flex flex-col justify-between overflow-hidden select-text ${
        isZenMode ? 'fixed inset-0 z-50 bg-[#0F1117]' : ''
      }`}
    >
      {/* TOP WORKSPACE HEADER */}
      <header className="h-14 px-4 sm:px-6 bg-[#141620] border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 z-20">
        {/* Left: Back (on mobile) + Folder & Theme Selector */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onBackToList && (
            <button
              onClick={onBackToList}
              title="Back to notes list"
              className="md:hidden p-2 -ml-2 rounded-xl text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center gap-1.5 text-xs font-quicksand font-bold shrink-0"
            >
              <ArrowLeft className="w-4 h-4" style={{ color: themeConfig.primaryHover }} />
              <span>Notes</span>
            </button>
          )}

          {/* Folder Selector Dropdown (Personal, School, Work, Archive) */}
          <div className="relative" ref={folderDropdownRef}>
            <button
              onClick={() => setShowFolderDropdown(!showFolderDropdown)}
              title="Change note folder"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-quicksand font-bold transition-colors cursor-pointer min-h-[36px]"
            >
              <FolderIcon icon={currentFolderObj?.icon} className="w-3.5 h-3.5" style={{ color: themeConfig.primaryHover }} />
              <span className="truncate max-w-[100px] sm:max-w-[140px]">{folder || 'Personal'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showFolderDropdown && (
              <div className="absolute left-0 mt-1.5 w-48 bg-[#1a1d2e] border border-slate-700 rounded-xl shadow-xl p-1 z-50 space-y-0.5 animate-in fade-in">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Select Folder
                </div>
                {folders.map((f) => (
                  <button
                    key={f.id}
                    onClick={() => handleFolderChange(f.id)}
                    className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                      folder === f.id
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <FolderIcon icon={f.icon} className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{f.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme / Color Selector Dropdown */}
          <div className="relative" ref={themeDropdownRef}>
            <button
              onClick={() => setShowThemeDropdown(!showThemeDropdown)}
              title="Change note & workspace theme color"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 text-xs font-quicksand font-bold transition-colors cursor-pointer min-h-[36px]"
            >
              <div
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: themeConfig.primary }}
              />
              <span className="hidden sm:inline font-medium text-slate-300">{themeConfig.label}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showThemeDropdown && (
              <div className="absolute left-0 mt-1.5 w-48 bg-[#1a1d2e] border border-slate-700 rounded-xl shadow-xl p-1.5 z-50 space-y-1 animate-in fade-in">
                <div className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                  Workspace Theme
                </div>
                {THEME_PALETTES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => handleThemeChange(t.id)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer ${
                      colorTag === t.id
                        ? 'bg-slate-800 text-white font-bold'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: t.primary }} />
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Pin Toggle */}
          <button
            onClick={() => onTogglePin(note.id, note.is_pinned)}
            title={note.is_pinned ? 'Unstar note' : 'Star note'}
            className={`p-2 rounded-xl transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center border ${
              note.is_pinned
                ? 'bg-amber-500/15 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border-slate-700/80'
            }`}
          >
            <Pin className={`w-3.5 h-3.5 ${note.is_pinned ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Right: View Modes & Action Tools */}
        <div className="flex items-center gap-2">
          {/* Mode Switcher (Write / Split / Preview) */}
          <div className="flex items-center bg-slate-800/90 p-0.5 rounded-xl border border-slate-700/80 shrink-0">
            <button
              onClick={() => setEditorMode('write')}
              title="Write mode"
              className={`px-2.5 py-1 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[28px] ${
                editorMode === 'write'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Write</span>
            </button>
            <button
              onClick={() => setEditorMode('split')}
              title="Split view (Desktop only)"
              className={`hidden md:inline-flex px-2.5 py-1 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[28px] ${
                editorMode === 'split'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3.5 h-3.5" />
              <span>Split</span>
            </button>
            <button
              onClick={() => setEditorMode('preview')}
              title="Preview mode"
              className={`px-2.5 py-1 rounded-lg text-xs font-quicksand font-semibold transition-colors cursor-pointer inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 min-h-[28px] ${
                editorMode === 'preview'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          </div>

          {/* Desktop Direct Quick Actions */}
          <div className="hidden lg:flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleCopyMarkdown}
              title="Copy markdown content"
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-300" />}
            </button>

            <button
              onClick={handleExportFile}
              title="Export as Markdown file"
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <FileDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsZenMode(!isZenMode)}
              title={isZenMode ? 'Exit Zen Mode' : 'Zen Focus Mode'}
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              {isZenMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => onDelete(note)}
              title="Delete note"
              className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 border border-rose-500/20 transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Compact More Menu for Mobile & Tablet */}
          <div className="relative lg:hidden shrink-0" ref={moreMenuRef}>
            <button
              onClick={() => setShowMoreMenu(!showMoreMenu)}
              title="More options"
              className="w-8 h-8 rounded-lg bg-slate-800 text-slate-300 hover:text-white border border-slate-700 hover:bg-slate-700 transition-colors cursor-pointer flex items-center justify-center shrink-0 min-h-[36px] min-w-[36px]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {showMoreMenu && (
              <div className="absolute right-0 mt-1.5 w-48 bg-[#1a1d2e] border border-slate-700 rounded-xl shadow-xl p-1 z-50 space-y-0.5 animate-in fade-in">
                <button
                  onClick={() => {
                    handleCopyMarkdown();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
                </button>

                <button
                  onClick={() => {
                    handleExportFile();
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  <FileDown className="w-3.5 h-3.5 text-slate-400" />
                  <span>Download .md</span>
                </button>

                <button
                  onClick={() => {
                    setIsZenMode(!isZenMode);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold text-slate-200 hover:bg-slate-800 hover:text-white rounded-lg cursor-pointer transition-colors"
                >
                  {isZenMode ? <Minimize2 className="w-3.5 h-3.5 text-slate-400" /> : <Maximize2 className="w-3.5 h-3.5 text-slate-400" />}
                  <span>{isZenMode ? 'Exit Zen Mode' : 'Zen Focus'}</span>
                </button>

                <div className="border-t border-slate-800 my-1"></div>

                <button
                  onClick={() => {
                    onDelete(note);
                    setShowMoreMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-quicksand font-semibold text-rose-400 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
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
        <div className="px-4 py-1.5 bg-[#12131C] border-b border-slate-800/80 flex items-center gap-1 overflow-x-auto scrollbar-none shrink-0 z-10">
          <button
            onClick={() => insertMarkdown('**', '**', 'bold text')}
            title="Bold (Cmd+B)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Bold className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('*', '*', 'italic text')}
            title="Italic (Cmd+I)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Italic className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('~~', '~~', 'strikethrough')}
            title="Strikethrough"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Strikethrough className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1 shrink-0"></div>

          <button
            onClick={() => insertMarkdown('### ', '', 'Heading 3')}
            title="Heading"
            className="px-2 py-1 rounded-lg text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0 font-mono"
          >
            H3
          </button>
          <button
            onClick={() => insertMarkdown('- ', '', 'List item')}
            title="Bullet list"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <List className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('1. ', '', 'Numbered item')}
            title="Numbered list"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <ListOrdered className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('- [ ] ', '', 'Task item')}
            title="Task checkbox"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <CheckSquare className="w-3.5 h-3.5" />
          </button>

          <div className="w-px h-4 bg-slate-800 mx-1 shrink-0"></div>

          <button
            onClick={() => insertMarkdown('> ', '', 'Quote text')}
            title="Blockquote"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Quote className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('`', '`', 'code')}
            title="Inline code"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <Code className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('[', '](https://example.com)', 'link title')}
            title="Insert Link"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <LinkIcon className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => insertMarkdown('\n---\n', '', '')}
            title="Horizontal divider"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
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
              editorMode === 'split' ? 'border-r border-slate-800' : ''
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
                className="w-full bg-transparent border-none font-fredoka text-2xl sm:text-3xl font-bold text-white placeholder-slate-600 focus:outline-hidden tracking-tight"
              />

              {/* Tag Chips Input Section */}
              <div className="flex flex-wrap items-center gap-1.5 pb-2">
                {tags.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-quicksand font-semibold bg-slate-800 text-slate-300 border border-slate-700"
                  >
                    <span>#{t}</span>
                    <button
                      onClick={() => handleRemoveTag(t)}
                      className="hover:text-rose-400 ml-0.5 cursor-pointer"
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
                  className="bg-transparent border-none text-xs font-quicksand text-slate-400 placeholder-slate-600 focus:outline-hidden py-1 px-2 min-w-[90px]"
                />
              </div>

              {/* Note Body Textarea */}
              <textarea
                id="note-body-input"
                ref={textareaRef}
                value={body}
                onChange={(e) => handleBodyChange(e.target.value)}
                placeholder="Write your note in Markdown here..."
                className="flex-1 w-full bg-transparent border-none text-slate-200 placeholder-slate-600 focus:outline-hidden resize-none font-nunito text-base leading-relaxed"
              />
            </div>
          </div>
        )}

        {/* MARKDOWN LIVE PREVIEW PANE */}
        {(editorMode === 'preview' || editorMode === 'split') && (
          <div className="flex-1 h-full p-4 sm:p-8 overflow-y-auto bg-[#0C0D13]">
            <div className="max-w-3xl w-full mx-auto markdown-preview">
              <h1 className="border-b border-slate-800 pb-3 mb-4">
                {title || 'Untitled Note'}
              </h1>
              {body.trim() ? (
                <Markdown>{body}</Markdown>
              ) : (
                <p className="text-slate-600 italic">No content to preview yet. Start typing on the left!</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM WORKSPACE STATUS BAR */}
      <footer className="h-9 px-4 sm:px-6 bg-[#141620] border-t border-slate-800 flex items-center justify-between text-[11px] font-quicksand text-slate-400 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium">
            {syncStatus === 'syncing' ? (
              <>
                <RefreshCw className="w-3 h-3 text-sky-400 animate-spin" />
                <span>Syncing note...</span>
              </>
            ) : syncStatus === 'offline' ? (
              <>
                <CloudOff className="w-3 h-3 text-amber-400" />
                <span>Offline mode</span>
              </>
            ) : (
              <>
                <Cloud className="w-3 h-3 text-emerald-400" />
                <span>Saved locally & cloud</span>
              </>
            )}
          </span>

          {pendingCount > 0 && (
            <button
              onClick={onForceSync}
              className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>({pendingCount} pending)</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 font-mono text-[10px]">
          <span>{wordCount} words</span>
          <span className="hidden sm:inline">{charCount} chars</span>
          <span className="hidden sm:inline">{readTimeMinutes} min read</span>
        </div>
      </footer>
    </main>
  );
};
