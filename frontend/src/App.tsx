import { useState, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import GameBoard from './components/GameBoard';
import { LevelSummary, GameScreen } from './types';
import Header from './components/Header';

export default function App() {
  const [screen, setScreen] = useState<GameScreen>('dashboard');
  const [selectedLevel, setSelectedLevel] = useState<LevelSummary | null>(null);
  const [score, setScore] = useState(0);
  const [totalAttempts, setTotalAttempts] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const handleSelectLevel = useCallback((level: LevelSummary) => {
    setSelectedLevel(level);
    setScreen('game');
  }, []);

  const handleBackToDashboard = useCallback(() => {
    setSelectedLevel(null);
    setScreen('dashboard');
  }, []);

  const handleLevelComplete = useCallback((levelScore: number, correct: boolean) => {
    setScore((prev) => prev + levelScore);
    setTotalAttempts((prev) => prev + 1);
    if (correct) setCorrectAnswers((prev) => prev + 1);
  }, []);

  return (
    <div className="min-h-screen bg-terminal-bg flex flex-col">
      <Header
        score={score}
        totalAttempts={totalAttempts}
        correctAnswers={correctAnswers}
        onBackToDashboard={screen !== 'dashboard' ? handleBackToDashboard : undefined}
      />

      <main className="flex-1 flex flex-col">
        {screen === 'dashboard' && (
          <Dashboard onSelectLevel={handleSelectLevel} />
        )}
        {screen === 'game' && selectedLevel && (
          <GameBoard
            level={selectedLevel}
            onBack={handleBackToDashboard}
            onComplete={handleLevelComplete}
          />
        )}
      </main>
    </div>
  );
}
