import { Server as SocketIOServer, Socket } from 'socket.io';
import { levels } from '../data/levels';
import { PipelineStepEvent, KernelStateEvent, KernelEffect } from '../types';

// Tracks any running simulation per socket so it can be cancelled
const activeSimulations = new Map<string, NodeJS.Timeout[]>();

function cancelSimulation(socketId: string) {
  const timers = activeSimulations.get(socketId);
  if (timers) {
    timers.forEach(clearTimeout);
    activeSimulations.delete(socketId);
  }
}

function buildKernelState(effect: KernelEffect): KernelStateEvent {
  return {
    fileDescriptorTable: effect.fileDescriptorTable ?? [],
    processTable: effect.processTable ?? [],
    diskActivity: effect.diskActivity ?? null,
    memoryActivity: effect.memoryActivity ?? null,
  };
}

export function registerSimulationHandlers(io: SocketIOServer, socket: Socket) {
  /**
   * Event: 'start-simulation'
   * Payload: { levelId: string; sequence: SyscallName[] }
   *
   * The client sends the levelId and the CORRECT sequence (obtained after
   * successful validation). The server streams back animated step events
   * with realistic timing so the frontend can drive the visualization.
   */
  socket.on('start-simulation', (data: { levelId: string; sequence?: string[] }) => {
    const level = levels.find((l) => l.id === data.levelId);
    if (!level) {
      socket.emit('simulation-error', { message: `Level "${data.levelId}" not found.` });
      return;
    }

    // Cancel any existing simulation on this socket
    cancelSimulation(socket.id);

    const steps = level.correctSequence;
    const timers: NodeJS.Timeout[] = [];
    let cumulativeDelay = 0;

    // Emit a "simulation-started" event so the UI can reset its state
    socket.emit('simulation-started', {
      levelId: level.id,
      totalSteps: steps.length,
      appName: level.appName,
    });

    steps.forEach((step, index) => {
      // Small stagger between steps so animations don't overlap
      const stepDelay = cumulativeDelay + 400; // 400ms lead-in
      cumulativeDelay += step.durationMs + 300;  // step duration + inter-step gap

      const pipelineTimer = setTimeout(() => {
        // ── pipeline-step-active ────────────────────────────────────────
        const pipelineEvent: PipelineStepEvent = {
          levelId: level.id,
          stepIndex: index,
          totalSteps: steps.length,
          syscall: step.syscall,
          description: step.description,
          microDescription: step.microDescription,
          kernelEffect: step.kernelEffect,
        };
        socket.emit('pipeline-step-active', pipelineEvent);

        // ── kernel-state-updated ────────────────────────────────────────
        const kernelEvent: KernelStateEvent = buildKernelState(step.kernelEffect);
        socket.emit('kernel-state-updated', kernelEvent);
      }, stepDelay);

      timers.push(pipelineTimer);

      // After step completes, emit a "step-complete" so the UI can animate completion
      const completeTimer = setTimeout(() => {
        socket.emit('pipeline-step-complete', { stepIndex: index, syscall: step.syscall });
      }, stepDelay + step.durationMs);

      timers.push(completeTimer);
    });

    // Final "simulation-complete" event after all steps
    const finalTimer = setTimeout(() => {
      socket.emit('simulation-complete', {
        levelId: level.id,
        message: level.successMessage,
      });
      activeSimulations.delete(socket.id);
    }, cumulativeDelay + 600);

    timers.push(finalTimer);
    activeSimulations.set(socket.id, timers);
  });

  /**
   * Event: 'cancel-simulation'
   * Allows the client to abort a running simulation mid-stream.
   */
  socket.on('cancel-simulation', () => {
    cancelSimulation(socket.id);
    socket.emit('simulation-cancelled', { message: 'Simulation cancelled.' });
  });

  /**
   * Cleanup when the client disconnects
   */
  socket.on('disconnect', () => {
    cancelSimulation(socket.id);
  });
}
