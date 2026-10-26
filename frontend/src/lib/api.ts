import { LevelSummary, LevelSolution, ValidateResponse, SyscallName } from '../types';

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API error ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// ── Level endpoints ───────────────────────────────────────────────────────────

export const api = {
  /** Fetch all level summaries */
  getLevels: (): Promise<{ levels: LevelSummary[] }> =>
    request('/levels'),

  /** Fetch a single level by id */
  getLevel: (id: string): Promise<LevelSummary> =>
    request(`/levels/${id}`),

  /** Submit the user's sequence for validation */
  validateSequence: (
    levelId: string,
    submittedSequence: SyscallName[]
  ): Promise<ValidateResponse> =>
    request(`/levels/${levelId}/validate`, {
      method: 'POST',
      body: JSON.stringify({ levelId, submittedSequence }),
    }),

  /** Reveal the correct solution (after failure or "show answer") */
  getSolution: (levelId: string): Promise<LevelSolution> =>
    request(`/levels/${levelId}/solution`),

  /** Health check */
  health: (): Promise<{ status: string; timestamp: string }> =>
    request('/health'),
};
