import { HardDrive, Cpu, Database, ArrowRightLeft } from 'lucide-react';
import { KernelStateUpdatedEvent } from '../types';

interface KernelStatePanelProps {
  kernelState: KernelStateUpdatedEvent | null;
  isSimulating: boolean;
}

export default function KernelStatePanel({ kernelState, isSimulating }: KernelStatePanelProps) {
  const fdt      = kernelState?.fileDescriptorTable ?? [];
  const procs    = kernelState?.processTable ?? [];
  const disk     = kernelState?.diskActivity;
  const mem      = kernelState?.memoryActivity;

  const diskColor: Record<string, string> = {
    open:  'text-neon-blue',
    read:  'text-neon-green',
    write: 'text-neon-yellow',
    close: 'text-neon-orange',
  };

  const memColor: Record<string, string> = {
    alloc: 'text-neon-purple',
    free:  'text-red-400',
    exec:  'text-neon-pink',
  };

  return (
    <div className="panel p-4 flex flex-col gap-4 h-full">
      <div className="flex items-center gap-2">
        <Cpu size={14} className="text-neon-cyan" />
        <h3 className="font-mono font-semibold text-sm text-white">Kernel State</h3>
        {isSimulating && (
          <span className="ml-auto inline-flex items-center gap-1.5 text-[10px] font-mono text-neon-green">
            <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
            LIVE
          </span>
        )}
      </div>

      {/* ── File Descriptor Table ──────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-1.5 mb-2">
          <Database size={11} className="text-neon-blue/70" />
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            FD Table
          </p>
        </div>

        {fdt.length === 0 ? (
          <p className="text-[11px] font-mono text-gray-600 italic">
            {isSimulating ? 'Waiting...' : 'No open file descriptors'}
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {fdt.map(({ fd, file, mode }) => (
              <div
                key={fd}
                className="flex items-center gap-2 px-2 py-1 rounded bg-terminal-muted/40
                           border border-terminal-border font-mono text-xs animate-slide-in"
              >
                <span className="text-neon-blue w-6 text-right shrink-0">fd{fd}</span>
                <span className="text-gray-400 flex-1 truncate">{file}</span>
                <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] border ${
                  mode === 'r'
                    ? 'text-neon-green border-neon-green/30 bg-neon-green/10'
                    : 'text-neon-yellow border-neon-yellow/30 bg-neon-yellow/10'
                }`}>
                  {mode}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Process Table ─────────────────────────────────────────── */}
      {procs.length > 0 && (
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <Cpu size={11} className="text-neon-purple/70" />
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Process Table
            </p>
          </div>
          <div className="flex flex-col gap-1">
            {procs.map(({ pid, state, name }) => (
              <div
                key={pid}
                className="flex items-center gap-2 px-2 py-1 rounded bg-terminal-muted/40
                           border border-terminal-border font-mono text-xs animate-slide-in"
              >
                <span className="text-neon-purple w-10 shrink-0">PID {pid}</span>
                <span className="text-gray-400 flex-1 truncate">{name}</span>
                <span className={`shrink-0 text-[9px] px-1.5 py-0.5 rounded border ${
                  state.includes('running')
                    ? 'text-neon-green border-neon-green/30 bg-neon-green/10'
                    : state.includes('waiting') || state.includes('sleep')
                    ? 'text-neon-yellow border-neon-yellow/30 bg-neon-yellow/10'
                    : 'text-gray-500 border-gray-700 bg-gray-800/40'
                }`}>
                  {state.split(' ')[0]}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Disk Activity ─────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-1.5 mb-2">
          <HardDrive size={11} className="text-neon-orange/70" />
          <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
            Disk I/O
          </p>
        </div>
        {disk ? (
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-terminal-muted/40
                          border border-terminal-border font-mono text-xs animate-slide-in">
            <HardDrive size={11} className={diskColor[disk.operation] ?? 'text-gray-400'} />
            <span className={`uppercase text-[10px] shrink-0 ${diskColor[disk.operation] ?? 'text-gray-400'}`}>
              {disk.operation}
            </span>
            <span className="text-gray-400 truncate">{disk.path}</span>
          </div>
        ) : (
          <p className="text-[11px] font-mono text-gray-600 italic">
            {isSimulating ? 'No disk activity' : 'Idle'}
          </p>
        )}
      </section>

      {/* ── Memory Activity ───────────────────────────────────────── */}
      {mem && (
        <section>
          <div className="flex items-center gap-1.5 mb-2">
            <ArrowRightLeft size={11} className="text-neon-purple/70" />
            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">
              Memory
            </p>
          </div>
          <div className="flex items-center gap-2 px-2 py-1.5 rounded bg-terminal-muted/40
                          border border-terminal-border font-mono text-xs animate-slide-in">
            <span className={`uppercase text-[10px] shrink-0 ${memColor[mem.operation] ?? 'text-neon-purple'}`}>
              {mem.operation}
            </span>
            <span className="text-gray-400">{mem.segment}</span>
          </div>
        </section>
      )}

      {/* Empty state */}
      {!isSimulating && !kernelState && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xs font-mono text-gray-600 text-center leading-relaxed">
            Kernel state will<br />update during simulation
          </p>
        </div>
      )}
    </div>
  );
}
