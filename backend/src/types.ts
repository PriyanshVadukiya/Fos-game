export type SyscallName = 'open' | 'read' | 'write' | 'close' | 'fork' | 'exec' | 'stat' | 'unlink' | 'dup2' | 'pipe' | 'wait' | 'exit' | 'mmap';

export interface SyscallStep {
  syscall: SyscallName;
  description: string;          // Plain-English what it does
  microDescription: string;     // "What is happening at this microsecond"
  kernelEffect: KernelEffect;
  durationMs: number;           // Animation duration hint for frontend
}

export interface KernelEffect {
  fileDescriptorTable?: { fd: number; file: string; mode: string }[];
  processTable?: { pid: number; state: string; name: string }[];
  diskActivity?: { path: string; operation: 'read' | 'write' | 'open' | 'close' | 'delete' } | null;
  memoryActivity?: { segment: string; operation: 'alloc' | 'free' | 'exec' } | null;
  pipeActivity?: { from: number; to: number };
}

export interface Level {
  id: string;
  title: string;
  appName: string;
  appIcon: string;           // lucide icon name string
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  scenario: string;          // What the user "clicked" or "did"
  description: string;       // Full explanation of the scenario
  availableSyscalls: SyscallName[];   // Pool to pick from (includes distractors)
  correctSequence: SyscallStep[];     // The one correct ordered sequence
  hints: string[];
  successMessage: string;
  failureMessage: string;
}

export interface ValidateRequest {
  levelId: string;
  submittedSequence: SyscallName[];
}

export interface ValidateResponse {
  correct: boolean;
  firstErrorIndex: number | null;   // index of first wrong step (-1 if all correct)
  correctSequence: SyscallName[];
  feedback: string;
  score: number;                    // 0-100 based on accuracy
}

export interface PipelineStepEvent {
  levelId: string;
  stepIndex: number;
  totalSteps: number;
  syscall: SyscallName;
  description: string;
  microDescription: string;
  kernelEffect: KernelEffect;
}

export interface KernelStateEvent {
  fileDescriptorTable: { fd: number; file: string; mode: string }[];
  processTable: { pid: number; state: string; name: string }[];
  diskActivity: { path: string; operation: string } | null;
  memoryActivity: { segment: string; operation: string } | null;
}
