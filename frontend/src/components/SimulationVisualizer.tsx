import { useEffect, useRef } from 'react';
import type { ElementType } from 'react';
import { Terminal, HardDrive, ArrowRight, Zap } from 'lucide-react';
import {
  FolderOpen, FileText, Pencil, X, GitFork, Play,
  Info, Trash2, Copy, ArrowRightLeft, Timer, LogOut, Layers, Cpu,
} from 'lucide-react';
import { SyscallName, PipelineStepActiveEvent, LevelSummary } from '../types';
import { syscallMeta } from '../lib/syscallMeta';
import SyscallChip from './SyscallChip';

const ICON_MAP: Record<string, ElementType> = {
  FolderOpen, FileText, Pencil, X, GitFork, Play,
  Info, Trash2, Copy, ArrowRightLeft, Timer, LogOut, Layers,
  Terminal, Cpu,
};

interface SimulationVisualizerProps {
  level:            LevelSummary;
  /** All steps emitted so far, keyed by stepIndex */
  stepLog:          Map<number, PipelineStepActiveEvent>;
  activeStep:       PipelineStepActiveEvent | null;
  completedSteps:   Set<number>;
  currentStepIndex: number;
  totalSteps:       number;
  isRunning:        boolean;
  isComplete:       boolean;
}

export default function SimulationVisualizer({
  level,
  stepLog,
  activeStep,
  completedSteps,
  currentStepIndex,
  totalSteps,
  isRunning,
  isComplete,
}: SimulationVisualizerProps) {
  const logRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log to bottom as steps complete
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [completedSteps.size]);

  const AppIcon = ICON_MAP[level.appIcon] ?? Terminal;

  // Build an ordered array of pipeline nodes.
  // During simulation the server emits the correct sequence, so we use stepLog
  // for already-seen steps; for unseen future steps we show placeholders.
  const pipelineNodes: Array<{ syscall: SyscallName | null; index: number }> =
    Array.from({ length: totalSteps || level.stepCount }, (_, i) => ({
      syscall: (stepLog.get(i)?.syscall ?? null) as SyscallName | null,
      index:   i,
    }));

  return (
    <div className="flex flex-col gap-4 h-full">

      {/* ── Pipeline flow diagram ──────────────────────────────────── */}
      <div className="panel p-4">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={14} className="text-neon-yellow" />
          <h3 className="font-mono font-semibold text-sm text-white">Pipeline</h3>
          {isRunning && (
            <span className="ml-auto text-[10px] font-mono text-neon-yellow animate-pulse">
              EXECUTING...
            </span>
          )}
          {isComplete && (
            <span className="ml-auto text-[10px] font-mono text-neon-green">
              ✓ COMPLETE
            </span>
          )}
        </div>

        {/* Three-layer flow: App → Syscall Pipeline → Kernel */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">

          {/* App layer */}
          <div className={`
            flex flex-col items-center justify-center gap-1.5
            min-w-[80px] p-3 rounded-xl border font-mono text-center shrink-0
            ${isRunning || isComplete
              ? 'bg-neon-blue/10 border-neon-blue/50 shadow-neon-blue'
              : 'bg-terminal-panel border-terminal-border'}
          `}>
            <AppIcon size={20} className={isRunning || isComplete ? 'text-neon-blue' : 'text-gray-500'} />
            <span className="text-[10px] text-gray-400">App Layer</span>
            <span className="text-[9px] text-gray-600 truncate max-w-[70px]">{level.appName}</span>
          </div>

          {/* Arrow */}
          <ArrowRight size={14} className={`shrink-0 ${isRunning ? 'text-neon-blue animate-pulse' : 'text-gray-700'}`} />

          {/* Syscall pipeline nodes */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            {pipelineNodes.map(({ syscall, index }) => (
              <PipelineNode
                key={index}
                syscall={syscall}
                index={index}
                active={index === currentStepIndex && isRunning}
                completed={completedSteps.has(index)}
              />
            ))}
          </div>

          {/* Arrow */}
          <ArrowRight size={14} className={`shrink-0 ${isRunning ? 'text-neon-purple animate-pulse' : 'text-gray-700'}`} />

          {/* Kernel layer */}
          <div className={`
            flex flex-col items-center justify-center gap-1.5
            min-w-[80px] p-3 rounded-xl border font-mono text-center shrink-0
            ${isRunning
              ? 'bg-neon-purple/10 border-neon-purple/50 shadow-neon-purple'
              : 'bg-terminal-panel border-terminal-border'}
          `}>
            <HardDrive size={20} className={isRunning ? 'text-neon-purple' : 'text-gray-500'} />
            <span className="text-[10px] text-gray-400">Kernel</span>
            <span className="text-[9px] text-gray-600">Hardware</span>
          </div>
        </div>

        {/* Step progress bar */}
        {(isRunning || isComplete) && pipelineNodes.length > 0 && (
          <div className="mt-3 flex gap-1">
            {pipelineNodes.map(({ index }) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-full transition-all duration-500 ${
                  completedSteps.has(index)  ? 'bg-neon-green' :
                  index === currentStepIndex ? 'bg-neon-yellow animate-pulse' :
                  'bg-terminal-muted'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Active step microsecond explanation ───────────────────── */}
      {activeStep && (
        <div className="panel p-4 animate-slide-in border-l-2 border-neon-blue/50">
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <SyscallChip syscall={activeStep.syscall} size="sm" active />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium mb-2">{activeStep.description}</p>
              <div className="bg-terminal-bg rounded-lg p-2.5 border border-terminal-border">
                <p className="font-mono text-xs text-neon-green leading-relaxed">
                  {activeStep.microDescription}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Execution log ─────────────────────────────────────────── */}
      <div className="panel p-4 flex flex-col gap-2 flex-1 min-h-0">
        <div className="flex items-center gap-2 mb-1">
          <Terminal size={13} className="text-neon-green" />
          <h3 className="font-mono font-semibold text-xs text-gray-400 uppercase tracking-widest">
            Execution Log
          </h3>
        </div>
        <div
          ref={logRef}
          className="flex-1 overflow-y-auto space-y-1 min-h-[80px] max-h-[200px]"
        >
          {[...completedSteps].sort((a, b) => a - b).map((i) => {
            const loggedStep = stepLog.get(i);
            const syscall    = (loggedStep?.syscall ?? 'open') as SyscallName;
            const meta       = syscallMeta[syscall] ?? syscallMeta['open'];
            const n          = pipelineNodes.length || level.stepCount;
            return (
              <div key={i} className="flex items-center gap-2 font-mono text-xs animate-slide-in">
                <span className="text-gray-600 w-16 shrink-0">
                  [{String(i + 1).padStart(2, '0')}/{String(n).padStart(2, '0')}]
                </span>
                <span className={`${meta.color} shrink-0`}>{meta.label}</span>
                <span className="text-gray-600">→</span>
                <span className="text-neon-green text-[10px]">OK</span>
                {loggedStep && (
                  <span className="text-gray-600 text-[10px] truncate hidden sm:block">
                    {loggedStep.description}
                  </span>
                )}
              </div>
            );
          })}
          {!isRunning && completedSteps.size === 0 && (
            <p className="text-gray-600 text-xs font-mono italic">
              Simulation output will appear here...
            </p>
          )}
          {isComplete && (
            <div className="text-neon-green font-mono text-xs animate-slide-in mt-1">
              ✓ Process exited with code 0
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Pipeline node ─────────────────────────────────────────────────────────────

function PipelineNode({
  syscall,
  index,
  active,
  completed,
}: {
  syscall:   SyscallName | null;
  index:     number;
  active:    boolean;
  completed: boolean;
}) {
  // Placeholder node if syscall not yet known (future steps)
  if (!syscall) {
    return (
      <div className="flex flex-col items-center gap-1 p-2 rounded-lg border
                      min-w-[56px] font-mono bg-terminal-panel border-terminal-border text-gray-700">
        <span className="text-[10px]">#{index + 1}</span>
        <span className="text-[11px]">···</span>
      </div>
    );
  }

  const meta = syscallMeta[syscall];

  return (
    <div className={`
      flex flex-col items-center gap-1 p-2 rounded-lg border min-w-[56px] font-mono
      transition-all duration-300
      ${active
        ? `${meta.bgColor} ${meta.borderColor} ${meta.glowClass} scale-110`
        : completed
        ? 'bg-neon-green/10 border-neon-green/50'
        : 'bg-terminal-panel border-terminal-border text-gray-600'}
    `}>
      <span className={`text-[10px] ${active ? meta.color : completed ? 'text-neon-green' : 'text-gray-600'}`}>
        #{index + 1}
      </span>
      <span className={`text-[11px] font-bold ${active ? meta.color : completed ? 'text-neon-green' : 'text-gray-500'}`}>
        {syscall}()
      </span>
      {active    && <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />}
      {completed && !active && <span className="text-neon-green text-[10px]">✓</span>}
    </div>
  );
}
