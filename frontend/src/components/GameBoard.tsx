import { useState, useCallback, useEffect } from 'react';
import type { ElementType } from 'react';
import {
  Terminal, Code2, Globe, GitBranch,
  Lightbulb, ChevronDown, ChevronUp,
  Play, StopCircle, Loader2,
} from 'lucide-react';
import { LevelSummary, SyscallName, ValidateResponse } from '../types';
import { api } from '../lib/api';
import { useSimulation } from '../hooks/useSimulation';
import SyscallSequencer from './SyscallSequencer';
import SimulationVisualizer from './SimulationVisualizer';
import KernelStatePanel from './KernelStatePanel';
import ResultModal from './ResultModal';

const ICON_MAP: Record<string, ElementType> = {
  Terminal, Code2, Globe, GitBranch,
};

interface GameBoardProps {
  level:      LevelSummary;
  onBack:     () => void;
  onComplete: (score: number, correct: boolean) => void;
}

type GamePhase = 'build' | 'validating' | 'result' | 'simulation';

export default function GameBoard({ level, onBack, onComplete }: GameBoardProps) {
  const [sequence,      setSequence]      = useState<SyscallName[]>([]);
  const [phase,         setPhase]         = useState<GamePhase>('build');
  const [result,        setResult]        = useState<ValidateResponse | null>(null);
  const [errorIndex,    setErrorIndex]    = useState<number | null>(null);
  const [hintsOpen,     setHintsOpen]     = useState(false);
  const [submitError,   setSubmitError]   = useState<string | null>(null);

  const { state: sim, startSimulation, cancelSimulation, resetSimulation } = useSimulation();

  const AppIcon = ICON_MAP[level.appIcon] ?? Terminal;

  // Reset everything when level changes
  useEffect(() => {
    setSequence([]);
    setPhase('build');
    setResult(null);
    setErrorIndex(null);
    setSubmitError(null);
    resetSimulation();
  }, [level.id, resetSimulation]);

  // ── Submit sequence for validation ───────────────────────────────────────
  const handleSubmit = useCallback(async () => {
    if (sequence.length === 0) return;
    setPhase('validating');
    setSubmitError(null);
    try {
      const res = await api.validateSequence(level.id, sequence);
      setResult(res);
      setErrorIndex(res.firstErrorIndex);
      setPhase('result');
      onComplete(res.score, res.correct);
    } catch (e) {
      setSubmitError((e as Error).message);
      setPhase('build');
    }
  }, [level.id, sequence, onComplete]);

  // ── Start simulation (after successful validation) ────────────────────────
  const handleRunSimulation = useCallback(() => {
    setPhase('simulation');
    resetSimulation();
    startSimulation(level.id);
  }, [level.id, startSimulation, resetSimulation]);

  // ── Retry ────────────────────────────────────────────────────────────────
  const handleRetry = useCallback(() => {
    setSequence([]);
    setResult(null);
    setErrorIndex(null);
    setPhase('build');
  }, []);

  // ── Show answer (fetch solution and pre-fill) ────────────────────────────
  const handleShowAnswer = useCallback(async () => {
    try {
      const sol = await api.getSolution(level.id);
      setSequence(sol.correctSequence.map((s) => s.syscall));
      setErrorIndex(null);
      setPhase('build');
      setResult(null);
    } catch {
      // ignore
    }
  }, [level.id]);

  // ── Stop simulation ──────────────────────────────────────────────────────
  const handleStopSimulation = useCallback(() => {
    cancelSimulation();
    setPhase('result');
  }, [cancelSimulation]);

  // ── Back to sequencer from simulation ────────────────────────────────────
  const handleBackFromSim = useCallback(() => {
    cancelSimulation();
    resetSimulation();
    setPhase('build');
  }, [cancelSimulation, resetSimulation]);

  const isSimulating = phase === 'simulation';

  return (
    <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-6 flex flex-col gap-5">

      {/* ── Level header ─────────────────────────────────────────────── */}
      <div className="panel p-4 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="p-2 rounded-lg bg-neon-blue/10 border border-neon-blue/30 shrink-0">
            <AppIcon size={22} className="text-neon-blue" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono font-bold text-white text-base">{level.title}</h1>
              <span className={`badge ${
                level.difficulty === 'beginner'     ? 'badge-beginner' :
                level.difficulty === 'intermediate' ? 'badge-intermediate' :
                                                      'badge-advanced'
              }`}>
                {level.difficulty}
              </span>
            </div>
            <p className="text-gray-400 text-xs mt-0.5 font-mono truncate">{level.scenario}</p>
          </div>
        </div>

        {/* Step counter */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-terminal-bg border border-terminal-border font-mono text-xs text-gray-400">
            <span className="text-white font-bold">{sequence.length}</span>/{level.stepCount} steps
          </div>
        </div>
      </div>

      {/* ── Scenario description ──────────────────────────────────────── */}
      <div className="panel-surface p-4 border-l-2 border-neon-blue/50">
        <p className="text-gray-300 text-sm leading-relaxed">{level.description}</p>
      </div>

      {/* ── Hints accordion ──────────────────────────────────────────── */}
      <div className="panel overflow-hidden">
        <button
          onClick={() => setHintsOpen(!hintsOpen)}
          className="w-full flex items-center justify-between px-4 py-3 hover:bg-terminal-muted/20 transition-colors"
          aria-expanded={hintsOpen}
        >
          <div className="flex items-center gap-2">
            <Lightbulb size={14} className="text-neon-yellow" />
            <span className="font-mono text-sm text-gray-300 font-medium">Hints</span>
            <span className="text-xs text-gray-600 font-mono">({level.hints.length})</span>
          </div>
          {hintsOpen ? <ChevronUp size={14} className="text-gray-500" /> : <ChevronDown size={14} className="text-gray-500" />}
        </button>
        {hintsOpen && (
          <div className="border-t border-terminal-border px-4 py-3 flex flex-col gap-2">
            {level.hints.map((hint, i) => (
              <div key={i} className="flex gap-2 text-sm">
                <span className="text-neon-yellow font-mono shrink-0">{i + 1}.</span>
                <span className="text-gray-400">{hint}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main game area ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 flex-1">

        {/* Left: Sequencer (hidden during simulation) */}
        {!isSimulating && (
          <div className="xl:col-span-2 panel p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="font-mono font-semibold text-sm text-white">
                Build Your Sequence
              </h2>
              <span className="text-[10px] font-mono text-gray-600 uppercase tracking-widest">
                Drag to reorder
              </span>
            </div>

            <SyscallSequencer
              availableSyscalls={level.availableSyscalls}
              sequence={sequence}
              expectedCount={level.stepCount}
              errorIndex={errorIndex}
              disabled={phase === 'validating'}
              onChange={setSequence}
            />

            {submitError && (
              <p className="text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
                Error: {submitError}
              </p>
            )}

            {/* Submit button */}
            <div className="pt-2 border-t border-terminal-border">
              <button
                onClick={handleSubmit}
                disabled={sequence.length === 0 || phase === 'validating'}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {phase === 'validating' ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Play size={14} />
                    Submit Sequence
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Simulation view */}
        {isSimulating && (
          <div className="xl:col-span-2 flex flex-col gap-4">
            <SimulationVisualizer
              level={level}
              stepLog={sim.stepLog}
              activeStep={sim.activeStep}
              completedSteps={sim.completedSteps}
              currentStepIndex={sim.currentStepIndex}
              totalSteps={sim.totalSteps || level.stepCount}
              isRunning={sim.isRunning}
              isComplete={sim.isComplete}
            />

            <div className="flex gap-2">
              {sim.isRunning ? (
                <button onClick={handleStopSimulation} className="btn-danger flex items-center gap-2">
                  <StopCircle size={14} />
                  Stop
                </button>
              ) : (
                <button onClick={handleBackFromSim} className="btn-secondary flex items-center gap-2">
                  Back to Sequence
                </button>
              )}
            </div>
          </div>
        )}

        {/* Right: Kernel state panel (always visible) */}
        <div className="xl:col-span-1">
          <KernelStatePanel
            kernelState={sim.kernelState}
            isSimulating={sim.isRunning}
          />
        </div>
      </div>

      {/* ── Result modal ─────────────────────────────────────────────── */}
      {phase === 'result' && result && (
        <ResultModal
          result={result}
          onRunSimulation={handleRunSimulation}
          onRetry={handleRetry}
          onShowAnswer={handleShowAnswer}
          onNext={onBack}
        />
      )}
    </div>
  );
}
