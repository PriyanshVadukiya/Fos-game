import { useCallback, useState } from 'react';
import type { ElementType } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical, Plus, Trash2, RotateCcw,
  FolderOpen, FileText, Pencil, X, GitFork, Play,
  Info, Copy, ArrowRightLeft, Timer, LogOut, Layers,
} from 'lucide-react';
import { SyscallName } from '../types';
import { syscallMeta } from '../lib/syscallMeta';
import SyscallChip from './SyscallChip';

const ICON_MAP: Record<string, ElementType> = {
  FolderOpen, FileText, Pencil, X, GitFork, Play,
  Info, Trash2, Copy, ArrowRightLeft, Timer, LogOut, Layers,
};

// ── Sortable item in the user's sequence ─────────────────────────────────────

interface SortableItemProps {
  id:         string;   // "syscall-{index}"
  syscall:    SyscallName;
  index:      number;
  errorIndex: number | null;
  onRemove:   (index: number) => void;
}

function SortableItem({ id, syscall, index, errorIndex, onRemove }: SortableItemProps) {
  const {
    attributes, listeners,
    setNodeRef, transform, transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform:  CSS.Transform.toString(transform),
    transition,
    opacity:    isDragging ? 0.4 : 1,
  };

  const isError = errorIndex !== null && index >= errorIndex;
  const meta    = syscallMeta[syscall];

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        flex items-center gap-2 p-2 rounded-lg border
        ${isError
          ? 'bg-red-500/5 border-red-500/40'
          : `${meta.bgColor} ${meta.borderColor}/30`}
        group transition-all duration-150
      `}
    >
      {/* Drag handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing text-gray-600 hover:text-gray-400 transition-colors p-0.5"
        aria-label="Drag to reorder"
      >
        <GripVertical size={14} />
      </button>

      {/* Step number */}
      <span className="text-[10px] font-mono text-gray-600 w-5 text-center shrink-0">
        {index + 1}
      </span>

      {/* Chip */}
      <SyscallChip syscall={syscall} size="sm" error={isError} className="flex-1" />

      {/* Error marker */}
      {isError && (
        <span className="text-red-400 text-[10px] font-mono shrink-0">✗ wrong</span>
      )}

      {/* Remove button */}
      <button
        onClick={() => onRemove(index)}
        className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400
                   transition-all duration-150 p-0.5 shrink-0"
        aria-label={`Remove ${syscall}()`}
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ── Available syscall pool ───────────────────────────────────────────────────

interface PoolChipProps {
  syscall:  SyscallName;
  onAdd:    (s: SyscallName) => void;
  count:    number;   // how many times already in sequence
}

function PoolChip({ syscall, onAdd, count }: PoolChipProps) {
  const meta = syscallMeta[syscall];
  const Icon = ICON_MAP[meta.icon] ?? Play;

  return (
    <button
      onClick={() => onAdd(syscall)}
      className={`
        flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border font-mono text-xs
        ${meta.bgColor} ${meta.borderColor}/40 ${meta.color}
        hover:${meta.borderColor} hover:scale-105
        active:scale-95 transition-all duration-150 cursor-pointer relative
      `}
      aria-label={`Add ${meta.label} to sequence`}
    >
      <Icon size={12} className="shrink-0" />
      {meta.label}
      {count > 0 && (
        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-terminal-surface
                         border border-terminal-border text-[9px] font-bold text-gray-400
                         flex items-center justify-center">
          {count}
        </span>
      )}
    </button>
  );
}

// ── Main Sequencer ────────────────────────────────────────────────────────────

interface SyscallSequencerProps {
  availableSyscalls: SyscallName[];
  sequence:          SyscallName[];
  expectedCount:     number;
  errorIndex:        number | null;
  disabled:          boolean;
  onChange:          (seq: SyscallName[]) => void;
}

export default function SyscallSequencer({
  availableSyscalls,
  sequence,
  expectedCount,
  errorIndex,
  disabled,
  onChange,
}: SyscallSequencerProps) {
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  // Unique id per position to satisfy dnd-kit
  const items = sequence.map((s, i) => ({ id: `${s}-${i}`, syscall: s }));

  const handleDragStart = useCallback((e: DragStartEvent) => {
    setActiveId(e.active.id as string);
  }, []);

  const handleDragEnd = useCallback((e: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = e;
    if (over && active.id !== over.id) {
      const oldIdx = items.findIndex((x) => x.id === active.id);
      const newIdx = items.findIndex((x) => x.id === over.id);
      onChange(arrayMove(sequence, oldIdx, newIdx));
    }
  }, [items, sequence, onChange]);

  const addSyscall = useCallback((s: SyscallName) => {
    onChange([...sequence, s]);
  }, [sequence, onChange]);

  const removeSyscall = useCallback((idx: number) => {
    onChange(sequence.filter((_, i) => i !== idx));
  }, [sequence, onChange]);

  const reset = useCallback(() => onChange([]), [onChange]);

  const activeSyscall = activeId
    ? items.find((x) => x.id === activeId)?.syscall
    : null;

  // Count occurrences in sequence
  const countMap = sequence.reduce<Record<string, number>>((acc, s) => {
    acc[s] = (acc[s] ?? 0) + 1;
    return acc;
  }, {});

  const isFull    = sequence.length >= expectedCount + 2; // allow small over-fill
  const isCorrect = errorIndex === null && sequence.length === expectedCount;

  return (
    <div className={`flex flex-col gap-4 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>

      {/* ── Available syscall pool ─────────────────────────────────── */}
      <div>
        <p className="text-[11px] font-mono text-gray-500 mb-2 uppercase tracking-widest">
          Available syscalls — click to add
        </p>
        <div className="flex flex-wrap gap-2">
          {availableSyscalls.map((s) => (
            <PoolChip
              key={s}
              syscall={s}
              onAdd={isFull ? () => {} : addSyscall}
              count={countMap[s] ?? 0}
            />
          ))}
        </div>
      </div>

      {/* ── Sequence drop zone ────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">
            Your sequence
            <span className={`ml-2 font-bold ${sequence.length === expectedCount ? 'text-neon-green' : 'text-gray-500'}`}>
              ({sequence.length}/{expectedCount} steps)
            </span>
          </p>
          {sequence.length > 0 && (
            <button
              onClick={reset}
              className="flex items-center gap-1 text-gray-500 hover:text-red-400 text-[11px] font-mono transition-colors"
            >
              <RotateCcw size={11} />
              Clear
            </button>
          )}
        </div>

        {sequence.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-xl
                          border-2 border-dashed border-terminal-muted/50 text-gray-600">
            <Plus size={20} className="mb-2 opacity-40" />
            <p className="text-xs font-mono">Click syscalls above to build your sequence</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={items.map((x) => x.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col gap-1.5">
                {items.map((item, index) => (
                  <SortableItem
                    key={item.id}
                    id={item.id}
                    syscall={item.syscall}
                    index={index}
                    errorIndex={errorIndex}
                    onRemove={removeSyscall}
                  />
                ))}
              </div>
            </SortableContext>

            <DragOverlay>
              {activeSyscall && (
                <SyscallChip syscall={activeSyscall} size="sm" className="shadow-lg" />
              )}
            </DragOverlay>
          </DndContext>
        )}

        {/* Visual progress bar */}
        {sequence.length > 0 && (
          <div className="mt-2 h-1 rounded-full bg-terminal-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                isCorrect       ? 'bg-neon-green' :
                errorIndex !== null ? 'bg-red-500' :
                'bg-neon-blue'
              }`}
              style={{ width: `${Math.min((sequence.length / expectedCount) * 100, 100)}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
