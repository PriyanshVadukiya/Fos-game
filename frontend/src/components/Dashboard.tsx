import type { ElementType } from 'react';
import { useEffect, useState } from 'react';
import {
  Terminal, Code2, Globe, GitBranch,
  Loader2, AlertCircle, ChevronRight,
  Zap, BookOpen, Star
} from 'lucide-react';
import { LevelSummary, Difficulty } from '../types';
import { api } from '../lib/api';

const ICON_MAP: Record<string, ElementType> = {
  Terminal,
  Code2,
  Globe,
  GitBranch,
};

const DIFFICULTY_ORDER: Difficulty[] = ['beginner', 'intermediate', 'advanced'];

interface DashboardProps {
  onSelectLevel: (level: LevelSummary) => void;
}

export default function Dashboard({ onSelectLevel }: DashboardProps) {
  const [levels, setLevels]   = useState<LevelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [filter, setFilter]   = useState<Difficulty | 'all'>('all');

  useEffect(() => {
    api.getLevels()
      .then(({ levels }) => setLevels(levels))
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all'
    ? levels
    : levels.filter((l) => l.difficulty === filter);

  const grouped = DIFFICULTY_ORDER.reduce<Record<Difficulty, LevelSummary[]>>(
    (acc, d) => {
      acc[d] = filtered.filter((l) => l.difficulty === d);
      return acc;
    },
    { beginner: [], intermediate: [], advanced: [] }
  );

  return (
    <div className="flex-1 max-w-screen-xl mx-auto w-full px-4 py-8">

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10
                        border border-neon-green/30 text-neon-green font-mono text-xs mb-4">
          <Zap size={12} />
          Interactive OS Learning Game
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold font-mono mb-3 tracking-tight">
          <span className="text-white">System Call</span>{' '}
          <span className="text-neon-green">Telephone Game</span>
        </h1>
        <p className="text-gray-400 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
          Arrange system calls in the exact order real applications use them.
          Watch the kernel execute your sequence in real time.
        </p>
      </div>

      {/* ── How to play ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
        {[
          {
            icon: <BookOpen size={18} className="text-neon-cyan" />,
            title: '1. Pick a Scenario',
            desc: 'Choose an app action — saving a file, launching a program, piping commands.',
          },
          {
            icon: <GitBranch size={18} className="text-neon-purple" />,
            title: '2. Arrange the Syscalls',
            desc: 'Drag and drop system calls into the correct chronological order.',
          },
          {
            icon: <Zap size={18} className="text-neon-green" />,
            title: '3. Run the Simulation',
            desc: 'See your sequence animate through the kernel in real time, step by step.',
          },
        ].map((step) => (
          <div key={step.title} className="panel p-4 flex gap-3 items-start">
            <div className="mt-0.5 shrink-0">{step.icon}</div>
            <div>
              <p className="font-mono font-semibold text-white text-sm mb-1">{step.title}</p>
              <p className="text-gray-400 text-xs leading-relaxed">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter tabs ───────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 mb-6 flex-wrap">
        <span className="text-gray-500 text-xs font-mono mr-1">Filter:</span>
        {(['all', ...DIFFICULTY_ORDER] as const).map((d) => (
          <button
            key={d}
            onClick={() => setFilter(d)}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium border transition-all duration-150 ${
              filter === d
                ? d === 'all'
                  ? 'bg-neon-blue/20 text-neon-blue border-neon-blue/60'
                  : d === 'beginner'
                  ? 'bg-neon-green/20 text-neon-green border-neon-green/60'
                  : d === 'intermediate'
                  ? 'bg-neon-yellow/20 text-neon-yellow border-neon-yellow/60'
                  : 'bg-neon-pink/20 text-neon-pink border-neon-pink/60'
                : 'bg-terminal-panel text-gray-400 border-terminal-border hover:border-gray-500 hover:text-gray-300'
            }`}
          >
            {d.charAt(0).toUpperCase() + d.slice(1)}
          </button>
        ))}
      </div>

      {/* ── Content ──────────────────────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
          <Loader2 size={20} className="animate-spin text-neon-green" />
          <span className="font-mono text-sm">Loading levels...</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-sm">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {DIFFICULTY_ORDER.map((difficulty) => {
            const group = grouped[difficulty];
            if (group.length === 0) return null;
            return (
              <section key={difficulty}>
                <div className="flex items-center gap-2 mb-3">
                  <Star size={14} className={
                    difficulty === 'beginner'     ? 'text-neon-green' :
                    difficulty === 'intermediate' ? 'text-neon-yellow' :
                                                    'text-neon-pink'
                  } />
                  <h2 className="font-mono font-semibold text-sm text-gray-300 capitalize">
                    {difficulty}
                  </h2>
                  <div className="flex-1 h-px bg-terminal-border ml-1" />
                  <span className="text-xs text-gray-600 font-mono">{group.length} level{group.length !== 1 ? 's' : ''}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {group.map((level) => (
                    <LevelCard key={level.id} level={level} onSelect={onSelectLevel} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Level Card ────────────────────────────────────────────────────────────────

function LevelCard({ level, onSelect }: { level: LevelSummary; onSelect: (l: LevelSummary) => void }) {
  const Icon = ICON_MAP[level.appIcon] ?? Terminal;

  const difficultyClass =
    level.difficulty === 'beginner'     ? 'badge-beginner' :
    level.difficulty === 'intermediate' ? 'badge-intermediate' :
                                          'badge-advanced';

  const borderAccent =
    level.difficulty === 'beginner'     ? 'hover:border-neon-green/50 hover:shadow-neon-green' :
    level.difficulty === 'intermediate' ? 'hover:border-neon-yellow/50' :
                                          'hover:border-neon-pink/50 hover:shadow-neon-pink';

  return (
    <button
      onClick={() => onSelect(level)}
      className={`panel p-5 text-left flex flex-col gap-3 group
                  cursor-pointer transition-all duration-200 hover:-translate-y-0.5
                  ${borderAccent}`}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-3">
        <div className="p-2 rounded-lg bg-terminal-muted/60 border border-terminal-border
                        group-hover:border-neon-blue/40 transition-colors duration-150">
          <Icon size={20} className="text-neon-blue" />
        </div>
        <span className={difficultyClass}>{level.difficulty}</span>
      </div>

      {/* Title + app */}
      <div>
        <p className="font-mono font-bold text-white text-sm mb-1 group-hover:text-neon-green transition-colors">
          {level.title}
        </p>
        <p className="text-gray-500 text-xs font-mono">{level.appName}</p>
      </div>

      {/* Scenario */}
      <p className="text-gray-400 text-xs leading-relaxed line-clamp-2">
        {level.scenario}
      </p>

      {/* Syscall pills */}
      <div className="flex flex-wrap gap-1.5 mt-auto">
        {level.availableSyscalls.slice(0, 5).map((s) => (
          <span key={s} className="px-2 py-0.5 rounded bg-terminal-muted/60 text-gray-400 font-mono text-[10px] border border-terminal-border">
            {s}()
          </span>
        ))}
        {level.availableSyscalls.length > 5 && (
          <span className="px-2 py-0.5 rounded bg-terminal-muted/60 text-gray-500 font-mono text-[10px] border border-terminal-border">
            +{level.availableSyscalls.length - 5} more
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-terminal-border">
        <span className="text-gray-500 text-xs font-mono">{level.stepCount} steps</span>
        <div className="flex items-center gap-1 text-neon-blue/70 text-xs font-mono
                        group-hover:text-neon-green transition-colors">
          Play <ChevronRight size={13} />
        </div>
      </div>
    </button>
  );
}
