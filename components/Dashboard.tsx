"use client";

import { useState, useEffect } from 'react';
import type { GameState } from '@/lib/engine';
import { calculateLevel, xpForNextLevel, generateWorldline, addXP } from '@/lib/engine';
import { selectAgent, generateAgentMessage, getAgentColor, getAgentEmoji } from '@/lib/agents';
import { getQuoteByContext } from '@/lib/quotes';
import { format } from 'date-fns';
import HabitsPanel from './HabitsPanel';
import TasksPanel from './TasksPanel';
import StudyPanel from './StudyPanel';
import DailyLogPanel from './DailyLogPanel';
import XPEventsPanel from './XPEventsPanel';
import WorldlinePanel from './WorldlinePanel';

interface DashboardProps {
  gameState: GameState;
  updateGameState: (updates: Partial<GameState>) => void;
}

export default function Dashboard({ gameState, updateGameState }: DashboardProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activePanel, setActivePanel] = useState<'habits' | 'tasks' | 'study' | 'log' | 'xp' | 'worldline'>('habits');
  const [agentMessage, setAgentMessage] = useState('');
  const [agentName, setAgentName] = useState<'okabe' | 'kurisu' | 'daru' | 'mayuri'>('okabe');

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const agent = selectAgent('greeting');
    const message = generateAgentMessage(agent, 'greeting');
    setAgentName(agent);
    setAgentMessage(message);
  }, []);

  const level = calculateLevel(gameState.xp);
  const nextLevelXP = xpForNextLevel(level);
  const currentLevelXP = level > 1 ? xpForNextLevel(level - 1) : 0;
  const xpProgress = ((gameState.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;

  const handleXPChange = (delta: number, reason: string) => {
    const newXP = addXP(gameState.xp, delta);
    updateGameState({
      xp: newXP,
      lastActive: new Date().toISOString()
    });

    // Trigger agent response
    const context = delta > 0 ? 'success' : 'failure';
    const agent = selectAgent(context);
    setAgentName(agent);
    setAgentMessage(generateAgentMessage(agent, context));
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      {/* Header */}
      <div className="mb-8 border-2 border-sg-green p-4 bg-sg-panel">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2 glitch">STEINS;GATE LIFE OS</h1>
            <p className="text-sm text-sg-amber">Future Gadget Lab — Time Management Division</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{format(currentTime, 'HH:mm:ss')}</div>
            <div className="text-sm">{format(currentTime, 'yyyy-MM-dd')}</div>
          </div>
        </div>

        {/* Worldline Display */}
        <div className="mb-4 p-3 bg-black border border-sg-green">
          <div className="flex justify-between items-center">
            <span className="text-sm">WORLDLINE DIVERGENCE:</span>
            <span className="text-2xl font-bold text-sg-amber animate-pulse">
              {generateWorldline(gameState.divergence)}%
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="border border-sg-green p-2">
            <div className="text-xs text-gray-400">LEVEL</div>
            <div className="text-2xl font-bold">{level}</div>
          </div>
          <div className="border border-sg-green p-2">
            <div className="text-xs text-gray-400">XP</div>
            <div className="text-xl">{gameState.xp.toLocaleString()}</div>
          </div>
          <div className="border border-sg-green p-2">
            <div className="text-xs text-gray-400">STREAK</div>
            <div className="text-2xl font-bold">{gameState.streak} 🔥</div>
          </div>
          <div className="border border-sg-green p-2">
            <div className="text-xs text-gray-400">DIVERGENCE</div>
            <div className="text-xl">{gameState.divergence}</div>
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>NEXT LEVEL: {nextLevelXP.toLocaleString()} XP</span>
            <span>{xpProgress.toFixed(1)}%</span>
          </div>
          <div className="h-4 bg-black border border-sg-green relative overflow-hidden">
            <div
              className="h-full bg-sg-green transition-all duration-300"
              style={{ width: `${xpProgress}%` }}
            />
            <div className="scanline" />
          </div>
        </div>

        {/* Agent Message */}
        <div className="border border-sg-blue p-3 bg-black">
          <div className="flex items-start gap-2">
            <span className="text-2xl">{getAgentEmoji(agentName)}</span>
            <div className="flex-1">
              <div className={`font-bold ${getAgentColor(agentName)} mb-1`}>
                {agentName.toUpperCase()}
              </div>
              <div className="text-sm">{agentMessage}</div>
            </div>
          </div>
        </div>

        {/* Quote of the Day */}
        <div className="mt-4 p-3 border border-sg-amber bg-black">
          <div className="text-xs text-sg-amber mb-1">QUOTE:</div>
          <div className="text-sm italic">{getQuoteByContext('morning')}</div>
        </div>
      </div>

      {/* Navigation */}
      <div className="mb-4 flex flex-wrap gap-2">
        {(['habits', 'tasks', 'study', 'log', 'xp', 'worldline'] as const).map(panel => (
          <button
            key={panel}
            onClick={() => setActivePanel(panel)}
            className={`px-4 py-2 border-2 transition-all ${
              activePanel === panel
                ? 'border-sg-green bg-sg-green text-black'
                : 'border-sg-green bg-black text-sg-green hover:bg-sg-green hover:text-black'
            }`}
          >
            {panel.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Active Panel */}
      <div className="border-2 border-sg-green p-4 bg-sg-panel min-h-[400px]">
        {activePanel === 'habits' && <HabitsPanel onXPChange={handleXPChange} />}
        {activePanel === 'tasks' && <TasksPanel onXPChange={handleXPChange} />}
        {activePanel === 'study' && <StudyPanel onXPChange={handleXPChange} />}
        {activePanel === 'log' && <DailyLogPanel />}
        {activePanel === 'xp' && <XPEventsPanel />}
        {activePanel === 'worldline' && <WorldlinePanel divergence={gameState.divergence} />}
      </div>

      {/* Footer */}
      <div className="mt-8 text-center text-xs text-gray-500">
        <p>El. Psy. Kongroo.</p>
        <p>SERN Backend v1.048596</p>
      </div>
    </div>
  );
}
