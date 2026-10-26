// ── Syscall types ────────────────────────────────────────────────────────────

export type SyscallName =
  | 'open' | 'read' | 'write' | 'close'
  | 'fork' | 'exec' | 'stat'  | 'unlink'
  | 'dup2' | 'pipe' | 'wait'  | 'exit'
  | 'mmap';

export interface KernelEffect {
  fileDescriptorTable?: { fd: number; file: string; mode: string }[];
  processTable?:        { pid: number; state: string; name: string }[];
  diskActivity?:        { path: string; operation: string } | null;
  memoryActivity?:      { segment: string; operation: string } | null;
  pipeActivity?:        { from: number; to: number };
}

export interface SyscallStep {
  syscall:          SyscallName;
  description:      string;
  microDescription: string;
  kernelEffect:     KernelEffect;
  durationMs:       number;
}

// ── Level types (as returned by the API) ────────────────────────────────────

export type Difficulty = 'beginner' | 'intermediate' | 'advanced';

export interface LevelSummary {
  id:               string;
  title:            string;
  appName:          string;
  appIcon:          string;
  difficulty:       Difficulty;
  scenario:         string;
  description:      string;
  availableSyscalls: SyscallName[];
  hints:            string[];
  stepCount:        number;
}

export interface LevelSolution {
  correctSequence: SyscallStep[];
  successMessage:  string;
}

// ── API response types ────────────────────────────────────────────────────────

export interface ValidateResponse {
  correct:          boolean;
  firstErrorIndex:  number | null;
  correctSequence:  SyscallName[];
  feedback:         string;
  score:            number;
}

// ── WebSocket event payloads ──────────────────────────────────────────────────

export interface SimulationStartedEvent {
  levelId:    string;
  totalSteps: number;
  appName:    string;
}

export interface PipelineStepActiveEvent {
  levelId:          string;
  stepIndex:        number;
  totalSteps:       number;
  syscall:          SyscallName;
  description:      string;
  microDescription: string;
  kernelEffect:     KernelEffect;
}

export interface KernelStateUpdatedEvent {
  fileDescriptorTable: { fd: number; file: string; mode: string }[];
  processTable:        { pid: number; state: string; name: string }[];
  diskActivity:        { path: string; operation: string } | null;
  memoryActivity:      { segment: string; operation: string } | null;
}

export interface PipelineStepCompleteEvent {
  stepIndex: number;
  syscall:   SyscallName;
}

export interface SimulationCompleteEvent {
  levelId: string;
  message: string;
}

// ── Game state ────────────────────────────────────────────────────────────────

export type GameScreen = 'dashboard' | 'game' | 'simulation';

export interface GameState {
  screen:           GameScreen;
  selectedLevel:    LevelSummary | null;
  userSequence:     SyscallName[];
  score:            number;
  totalAttempts:    number;
  correctAnswers:   number;
}

// ── UI helpers ────────────────────────────────────────────────────────────────

export type ModalType = 'success' | 'failure' | 'hint' | null;

export interface SyscallMeta {
  color:       string;           // Tailwind text-* class
  bgColor:     string;           // Tailwind bg-* class
  borderColor: string;           // Tailwind border-* class
  glowClass:   string;           // custom shadow class
  label:       string;           // short human-readable name
  icon:        string;           // lucide icon name
  tagline:     string;           // one-liner description
}
