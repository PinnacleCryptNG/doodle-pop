import React from 'react';
import {
  Folder,
  Briefcase,
  BookOpen,
  Compass,
  Archive,
  Tag,
  Code,
  Layers,
  Star,
  Feather,
  Shield,
  Bookmark,
  FileText,
  Clock,
  Grid
} from 'lucide-react';

interface FolderIconProps {
  icon?: string;
  className?: string;
  size?: number;
  style?: React.CSSProperties;
}

export const FolderIcon: React.FC<FolderIconProps> = ({ icon = 'folder', className = 'w-4 h-4', size, style }) => {
  const normalized = (icon || '').toLowerCase().trim();

  switch (normalized) {
    case 'briefcase':
    case 'work':
    case 'project':
    case 'projects':
      return <Briefcase className={className} size={size} style={style} />;
    case 'book':
    case 'journal':
    case 'diary':
    case 'notes':
    case 'school':
      return <BookOpen className={className} size={size} style={style} />;
    case 'compass':
    case 'research':
    case 'explore':
    case 'ideas':
      return <Compass className={className} size={size} style={style} />;
    case 'archive':
    case 'box':
      return <Archive className={className} size={size} style={style} />;
    case 'tag':
    case 'tags':
      return <Tag className={className} size={size} style={style} />;
    case 'code':
    case 'dev':
      return <Code className={className} size={size} style={style} />;
    case 'layers':
    case 'stack':
      return <Layers className={className} size={size} style={style} />;
    case 'star':
    case 'starred':
      return <Star className={className} size={size} style={style} />;
    case 'feather':
    case 'pen':
    case 'writing':
      return <Feather className={className} size={size} style={style} />;
    case 'shield':
    case 'security':
    case 'private':
      return <Shield className={className} size={size} style={style} />;
    case 'bookmark':
      return <Bookmark className={className} size={size} style={style} />;
    case 'grid':
      return <Grid className={className} size={size} style={style} />;
    case 'file':
    case 'filetext':
      return <FileText className={className} size={size} style={style} />;
    case 'clock':
    case 'recent':
      return <Clock className={className} size={size} style={style} />;
    default:
      return <Folder className={className} size={size} style={style} />;
  }
};
