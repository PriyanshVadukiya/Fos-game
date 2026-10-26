import { Terminal, Trophy, ArrowLeft, Cpu, Wifi } from 'lucide-react';

interface HeaderProps {
  score:            number;
  totalAttempts:    number;
  correctAnswers:   number;
  onBackToDashboard?: () => void;
}

export default function Header({ score, totalAttempts, correctAnswers, onBackToDashboard }: HeaderProps) {
  const accuracy = totalAttempts > 0
    ? Math.round((correctAnswers / totalAttempts) * 100)
    : 0;

  return (
    <header className="sticky top-0 z-50 border-b border-terminal-border bg-terminal-surface/95 backdrop-blur-sm">
      <div className="max-w-screen-xl mx-auto px-4 h-14 flex items-center justify-between gap-4">

        {/* Left — logo / back */}
        <div className="flex items-center gap-3 min-w-0">
          {onBackToDashboard ? (
            <button
              onClick={onBackToDashboard}
              className="flex items-center gap-2 text-gray-400 hover:text-neon-cyan transition-colors duration-150 font-mono text-sm"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={16} />
              <span className="hidden sm:inline">Dashboard</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-neon-green/10 border border-neon-green/30">
                <Terminal size={16} className="text-neon-green" />
              </div>
              <span className="font-mono font-bold text-white text-sm tracking-tight hidden sm:inline">
                sys<span className="text-neon-green">call</span>.game
              </span>
            </div>
          )}
        </div>

        {/* Center — decorative status bar */}
        <div className="hidden md:flex items-center gap-1.5 font-mono text-xs text-terminal-muted/80">
          <Cpu size={12} className="text-neon-blue/60" />
          <span className="text-neon-blue/60">kernel</span>
          <span className="text-terminal-border mx-1">│</span>
          <Wifi size={12} className="text-neon-green/60" />
          <span className="text-neon-green/60">connected</span>
        </div>

        {/* Right — score strip */}
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-terminal-panel border border-terminal-border">
            <Trophy size={13} className="text-neon-yellow" />
            <span className="text-gray-400">Score:</span>
            <span className="text-neon-yellow font-bold">{score}</span>
          </div>

          {totalAttempts > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-terminal-panel border border-terminal-border">
              <span className="text-gray-400">Acc:</span>
              <span className={accuracy >= 70 ? 'text-neon-green font-bold' : 'text-neon-pink font-bold'}>
                {accuracy}%
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
