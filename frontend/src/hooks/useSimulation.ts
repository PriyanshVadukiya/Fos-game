import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../lib/socket';
import {
  SimulationStartedEvent,
  PipelineStepActiveEvent,
  KernelStateUpdatedEvent,
  PipelineStepCompleteEvent,
  SimulationCompleteEvent,
} from '../types';

export interface SimulationState {
  isRunning:         boolean;
  isComplete:        boolean;
  currentStepIndex:  number;
  totalSteps:        number;
  completedSteps:    Set<number>;
  /** All pipeline-step-active events received so far, keyed by stepIndex */
  stepLog:           Map<number, PipelineStepActiveEvent>;
  activeStep:        PipelineStepActiveEvent | null;
  kernelState:       KernelStateUpdatedEvent | null;
  completionMessage: string | null;
  error:             string | null;
}

const initialState: SimulationState = {
  isRunning:         false,
  isComplete:        false,
  currentStepIndex:  -1,
  totalSteps:        0,
  completedSteps:    new Set(),
  stepLog:           new Map(),
  activeStep:        null,
  kernelState:       null,
  completionMessage: null,
  error:             null,
};

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(initialState);
  const socket = useRef(getSocket());

  useEffect(() => {
    const s = socket.current;

    s.on('simulation-started', (_data: SimulationStartedEvent) => {
      setState({
        ...initialState,
        isRunning:  true,
        totalSteps: _data.totalSteps,
      });
    });

    s.on('pipeline-step-active', (data: PipelineStepActiveEvent) => {
      setState((prev) => {
        const newLog = new Map(prev.stepLog);
        newLog.set(data.stepIndex, data);
        return {
          ...prev,
          activeStep:       data,
          currentStepIndex: data.stepIndex,
          totalSteps:       data.totalSteps || prev.totalSteps,
          stepLog:          newLog,
        };
      });
    });

    s.on('kernel-state-updated', (data: KernelStateUpdatedEvent) => {
      setState((prev) => ({ ...prev, kernelState: data }));
    });

    s.on('pipeline-step-complete', (data: PipelineStepCompleteEvent) => {
      setState((prev) => ({
        ...prev,
        completedSteps: new Set([...prev.completedSteps, data.stepIndex]),
      }));
    });

    s.on('simulation-complete', (data: SimulationCompleteEvent) => {
      setState((prev) => ({
        ...prev,
        isRunning:         false,
        isComplete:        true,
        completionMessage: data.message,
        activeStep:        null,
      }));
    });

    s.on('simulation-cancelled', () => {
      setState((prev) => ({ ...prev, isRunning: false }));
    });

    s.on('simulation-error', (data: { message: string }) => {
      setState((prev) => ({ ...prev, isRunning: false, error: data.message }));
    });

    return () => {
      s.off('simulation-started');
      s.off('pipeline-step-active');
      s.off('kernel-state-updated');
      s.off('pipeline-step-complete');
      s.off('simulation-complete');
      s.off('simulation-cancelled');
      s.off('simulation-error');
    };
  }, []);

  const startSimulation = useCallback((levelId: string) => {
    socket.current.emit('start-simulation', { levelId });
  }, []);

  const cancelSimulation = useCallback(() => {
    socket.current.emit('cancel-simulation');
    setState((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resetSimulation = useCallback(() => {
    setState(initialState);
  }, []);

  return { state, startSimulation, cancelSimulation, resetSimulation };
}
