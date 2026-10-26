import { Router, Request, Response } from 'express';
import { levels } from '../data/levels';
import { ValidateRequest, ValidateResponse } from '../types';

const router = Router();

// GET /api/levels — return all levels (without correctSequence details to avoid spoilers)
router.get('/', (_req: Request, res: Response) => {
  const summary = levels.map((l) => ({
    id: l.id,
    title: l.title,
    appName: l.appName,
    appIcon: l.appIcon,
    difficulty: l.difficulty,
    scenario: l.scenario,
    description: l.description,
    availableSyscalls: l.availableSyscalls,
    hints: l.hints,
    stepCount: l.correctSequence.length,
  }));
  res.json({ levels: summary });
});

// GET /api/levels/:id — return a single level summary (no correct answers)
router.get('/:id', (req: Request, res: Response) => {
  const level = levels.find((l) => l.id === req.params.id);
  if (!level) {
    res.status(404).json({ error: 'Level not found' });
    return;
  }
  res.json({
    id: level.id,
    title: level.title,
    appName: level.appName,
    appIcon: level.appIcon,
    difficulty: level.difficulty,
    scenario: level.scenario,
    description: level.description,
    availableSyscalls: level.availableSyscalls,
    hints: level.hints,
    stepCount: level.correctSequence.length,
  });
});

// POST /api/levels/:id/validate — check the user's submitted sequence
router.post('/:id/validate', (req: Request, res: Response) => {
  const level = levels.find((l) => l.id === req.params.id);
  if (!level) {
    res.status(404).json({ error: 'Level not found' });
    return;
  }

  const body = req.body as ValidateRequest;
  if (!Array.isArray(body.submittedSequence)) {
    res.status(400).json({ error: 'submittedSequence must be an array of syscall names' });
    return;
  }

  const correct = level.correctSequence.map((s) => s.syscall);
  const submitted = body.submittedSequence;

  let firstErrorIndex: number | null = null;
  for (let i = 0; i < correct.length; i++) {
    if (submitted[i] !== correct[i]) {
      firstErrorIndex = i;
      break;
    }
  }

  // Also flag if the submitted sequence is longer than expected
  if (firstErrorIndex === null && submitted.length > correct.length) {
    firstErrorIndex = correct.length;
  }

  const isCorrect = firstErrorIndex === null && submitted.length === correct.length;

  // Score: each correctly placed syscall = (100 / total) points
  let matchedCount = 0;
  for (let i = 0; i < correct.length; i++) {
    if (submitted[i] === correct[i]) matchedCount++;
  }
  const score = Math.round((matchedCount / correct.length) * 100);

  let feedback: string;
  if (isCorrect) {
    feedback = level.successMessage;
  } else if (firstErrorIndex === 0) {
    feedback = `Wrong starting syscall! ${level.failureMessage}`;
  } else if (firstErrorIndex !== null) {
    const wrongSyscall = submitted[firstErrorIndex] ?? '(missing)';
    const expectedSyscall = correct[firstErrorIndex];
    feedback = `Step ${firstErrorIndex + 1} is wrong: you placed "${wrongSyscall}" but the correct syscall here is "${expectedSyscall}". ${level.failureMessage}`;
  } else {
    feedback = `Your sequence has ${submitted.length} steps but ${correct.length} are expected. ${level.failureMessage}`;
  }

  const response: ValidateResponse = {
    correct: isCorrect,
    firstErrorIndex,
    correctSequence: correct,
    feedback,
    score,
  };

  res.json(response);
});

// GET /api/levels/:id/solution — reveal the solution (used after failure or on "show answer")
router.get('/:id/solution', (req: Request, res: Response) => {
  const level = levels.find((l) => l.id === req.params.id);
  if (!level) {
    res.status(404).json({ error: 'Level not found' });
    return;
  }
  res.json({
    correctSequence: level.correctSequence,
    successMessage: level.successMessage,
  });
});

export default router;
