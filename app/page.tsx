"use client";

import { useEffect, useState } from 'react';
import Dashboard from '@/components/Dashboard';
import { initialState } from '@/lib/engine';
import { loadGameState, saveGameState } from '@/lib/storage';
import type { GameState } from '@/lib/engine';

export default function Home() {
  const [gameState, setGameState] = useState<GameState>(initialState);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loaded = loadGameState();
    if (loaded) {
      setGameState(loaded);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!loading) {
      saveGameState(gameState);
    }
  }, [gameState, loading]);

  const updateGameState = (updates: Partial<GameState>) => {
    setGameState(prev => ({ ...prev, ...updates }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl animate-pulse">INITIALIZING WORLDLINE...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen crt-screen">
      <Dashboard gameState={gameState} updateGameState={updateGameState} />
    </main>
  );
}
