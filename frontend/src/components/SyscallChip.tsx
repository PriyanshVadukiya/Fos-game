import type { ElementType } from 'react';
import {
  FolderOpen, FileText, Pencil, X, GitFork, Play,
  Info, Trash2, Copy, ArrowRightLeft, Timer, LogOut, Layers,
} from 'lucide-react';
import { SyscallName } from '../types';
import { syscallMeta } from '../lib/syscallMeta';

const ICON_MAP: Record<string, ElementType> = {
  FolderOpen, FileText, Pencil, X, GitFork, Play,
  Info, Trash2, Copy, ArrowRightLeft, Timer, LogOut, Layers,
};

interface SyscallChipProps {
  syscall:    SyscallName;
  size?:      'sm' | 'md' | 'lg';
  active?:    boolean;   // currently executing in simulation
  completed?: boolean;   // already executed in simulation
  error?:     boolean;   // wrong placement
  dragging?:  boolean;   // being dragged
  index?:     number;    // position number to display
  className?: string;
}

export default function SyscallChip({
  syscall,
  size = 'md',
  active = false,
  completed = false,
  error = false,
  dragging = false,
  index,
  className = '',
}: SyscallChipProps) {
  const meta  = syscallMeta[syscall];
  const Icon  = ICON_MAP[meta.icon] ?? Play;

  const sizeClasses = {
    sm: 'px-2.5 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2   text-sm gap-2',
    lg: 'px-4 py-3   text-base gap-2.5',
  }[size];

  const iconSize = { sm: 12, md: 14, lg: 16 }[size];

  let stateClasses = `${meta.bgColor} ${meta.borderColor}/40 ${meta.color}`;
  let glowStyle    = '';

  if (active) {
    stateClasses = `${meta.bgColor} ${meta.borderColor} ${meta.color}`;
    glowStyle    = meta.glowClass;
  } else if (completed) {
    stateClasses = 'bg-neon-green/10 border-neon-green/50 text-neon-green';
  } else if (error) {
    stateClasses = 'bg-red-500/10 border-red-500/60 text-red-400';
  } else if (dragging) {
    stateClasses = `${meta.bgColor} ${meta.borderColor} ${meta.color} opacity-50`;
  }

  return (
    <div
      className={`
        inline-flex items-center font-mono font-semibold rounded-lg border
        select-none transition-all duration-200
        ${sizeClasses} ${stateClasses} ${glowStyle}
        ${active ? 'animate-pulse-neon scale-105' : ''}
        ${className}
      `}
      role="img"
      aria-label={`${meta.label} — ${meta.tagline}`}
    >
      {index !== undefined && (
        <span className="text-[10px] opacity-50 font-bold w-4 text-center shrink-0">
          {index + 1}
        </span>
      )}
      <Icon size={iconSize} className="shrink-0" />
      <span>{meta.label}</span>
      {active && (
        <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      )}
    </div>
  );
}
