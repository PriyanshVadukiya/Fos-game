import { useEffect, useRef } from 'react';
import {
  CheckCircle2, XCircle, Trophy, RotateCcw,
  Play, Eye, ChevronRight, Lightbulb,
} from 'lucide-react';
import { ValidateResponse, SyscallName } from '../types';
import SyscallChip from './SyscallChip';

interface ResultModalProps {
  result:          ValidateResponse;
  onRunSimulation: () => void;
  onRetry:         () => void;
  onShowAnswer:    () => void;
  onNext:          () => void;
}

export default function ResultModal({
  result,
  onRunSimulation,
  onRetry,
  onShowAnswer,
  onNext,
}: ResultModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  // Trap focus inside modal
  useEffect(() => {
    dialogRef.current?.focus();
  }, []);

  const isSuccess = result.correct;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={isSuccess ? 'Success' : 'Try again'}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className={`
          w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-5
          bg-terminal-panel shadow-[0_20px_60px_rgba(0,0,0,0.7)]
          animate-bounce-in outline-none
          ${isSuccess ? 'border-neon-green/40' : 'border-red-500/40'}
        `}
      >
        {/* ── Header ─────────────────────────────────────────────── */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl ${isSuccess ? 'bg-neon-green/10' : 'bg-red-500/10'}`}>
            {isSuccess
              ? <CheckCircle2 size={28} className="text-neon-green" />
              : <XCircle     size={28} className="text-red-400" />
            }
          </div>
          <div className="flex-1">
            <h2 className={`font-mono font-bold text-lg mb-1 ${isSuccess ? 'text-neon-green' : 'text-red-400'}`}>
              {isSuccess ? 'Correct Sequence!' : 'Wrong Order'}
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">{result.feedback}</p>
          </div>
        </div>

        {/* ── Score ──────────────────────────────────────────────── */}
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
          isSuccess ? 'bg-neon-green/5 border-neon-green/20' : 'bg-red-500/5 border-red-500/20'
        }`}>
          <Trophy size={18} className={isSuccess ? 'text-neon-yellow' : 'text-gray-500'} />
          <span className="font-mono text-sm text-gray-400">Score earned:</span>
          <span className={`font-mono font-bold text-xl ml-auto ${
            result.score >= 80 ? 'text-neon-green' :
            result.score >= 50 ? 'text-neon-yellow' :
            'text-red-400'
          }`}>
            {result.score}<span className="text-sm font-normal text-gray-500">/100</span>
          </span>
        </div>

        {/* ── Correct sequence (shown on failure) ──────────────── */}
        {!isSuccess && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb size={13} className="text-neon-yellow" />
              <p className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">
                Correct sequence
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {result.correctSequence.map((s, i) => (
                <div key={i} className="flex items-center gap-1">
                  <SyscallChip
                    syscall={s as SyscallName}
                    size="sm"
                    completed
                  />
                  {i < result.correctSequence.length - 1 && (
                    <ChevronRight size={12} className="text-gray-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Diff view (failure only) ──────────────────────────── */}
        {!isSuccess && result.firstErrorIndex !== null && (
          <div className="bg-terminal-bg rounded-xl border border-terminal-border p-3">
            <p className="text-[11px] font-mono text-gray-500 mb-2">
              First error at step {result.firstErrorIndex + 1}:
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-red-400 px-2 py-1 rounded bg-red-500/10 border border-red-500/20">
                ✗ your step {result.firstErrorIndex + 1}
              </span>
              <ChevronRight size={12} className="text-gray-600" />
              <SyscallChip
                syscall={result.correctSequence[result.firstErrorIndex] as SyscallName}
                size="sm"
                completed
              />
              <span className="text-[10px] font-mono text-neon-green ml-1">← expected</span>
            </div>
          </div>
        )}

        {/* ── Actions ────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          {isSuccess ? (
            <>
              <button onClick={onRunSimulation} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <Play size={14} />
                Run Simulation
              </button>
              <button onClick={onNext} className="btn-secondary flex items-center justify-center gap-2">
                Next Level <ChevronRight size={14} />
              </button>
            </>
          ) : (
            <>
              <button onClick={onRetry} className="btn-primary flex-1 flex items-center justify-center gap-2">
                <RotateCcw size={14} />
                Try Again
              </button>
              <button onClick={onShowAnswer} className="btn-secondary flex items-center justify-center gap-2">
                <Eye size={14} />
                Show Answer
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
