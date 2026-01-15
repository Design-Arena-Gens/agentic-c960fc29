"use client";

import { useState, useEffect } from 'react';
import { loadHabits, saveHabits, type Habit } from '@/lib/storage';
import { saveXPEvent } from '@/lib/storage';

interface HabitsPanelProps {
  onXPChange: (delta: number, reason: string) => void;
}

export default function HabitsPanel({ onXPChange }: HabitsPanelProps) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitXP, setNewHabitXP] = useState(10);

  useEffect(() => {
    setHabits(loadHabits());
  }, []);

  useEffect(() => {
    saveHabits(habits);
  }, [habits]);

  const addHabit = () => {
    if (!newHabitName.trim()) return;

    const habit: Habit = {
      id: Date.now().toString(),
      name: newHabitName,
      xpValue: newHabitXP,
      streak: 0,
      completedToday: false,
      lastCompleted: '',
    };

    setHabits([...habits, habit]);
    setNewHabitName('');
    setNewHabitXP(10);
  };

  const toggleHabit = (id: string) => {
    const habit = habits.find(h => h.id === id);
    if (!habit) return;

    const now = new Date().toISOString();
    const completed = !habit.completedToday;

    setHabits(habits.map(h =>
      h.id === id
        ? {
            ...h,
            completedToday: completed,
            lastCompleted: completed ? now : h.lastCompleted,
            streak: completed ? h.streak + 1 : Math.max(0, h.streak - 1)
          }
        : h
    ));

    const xpDelta = completed ? habit.xpValue : -habit.xpValue;
    onXPChange(xpDelta, `Habit: ${habit.name}`);

    saveXPEvent({
      type: 'habit',
      value: xpDelta,
      reason: habit.name,
      timestamp: Date.now(),
    });
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-sg-green">⚡ DAILY HABITS</h2>

      {/* Add Habit Form */}
      <div className="mb-6 p-4 border border-sg-blue bg-black">
        <div className="text-sm text-sg-blue mb-2">NEW HABIT</div>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Habit name..."
            className="flex-1 bg-sg-dark border border-sg-green p-2 text-sg-green"
            onKeyPress={(e) => e.key === 'Enter' && addHabit()}
          />
          <input
            type="number"
            value={newHabitXP}
            onChange={(e) => setNewHabitXP(Number(e.target.value))}
            className="w-20 bg-sg-dark border border-sg-green p-2 text-sg-green"
          />
          <button
            onClick={addHabit}
            className="px-4 py-2 bg-sg-green text-black font-bold hover:bg-sg-blue"
          >
            ADD
          </button>
        </div>
      </div>

      {/* Habits List */}
      <div className="space-y-2">
        {habits.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No habits yet. Create one above.
          </div>
        )}

        {habits.map(habit => (
          <div
            key={habit.id}
            className={`p-4 border-2 transition-all ${
              habit.completedToday
                ? 'border-sg-green bg-sg-green bg-opacity-10'
                : 'border-gray-600 bg-black'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => toggleHabit(habit.id)}
                  className={`w-6 h-6 border-2 flex items-center justify-center ${
                    habit.completedToday
                      ? 'border-sg-green bg-sg-green text-black'
                      : 'border-sg-green'
                  }`}
                >
                  {habit.completedToday && '✓'}
                </button>

                <div className="flex-1">
                  <div className={`font-bold ${habit.completedToday ? 'line-through' : ''}`}>
                    {habit.name}
                  </div>
                  <div className="text-xs text-gray-400">
                    Streak: {habit.streak} | XP: +{habit.xpValue}
                  </div>
                </div>
              </div>

              <button
                onClick={() => deleteHabit(habit.id)}
                className="px-2 py-1 text-sg-red hover:bg-sg-red hover:text-black border border-sg-red"
              >
                DEL
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-3 border border-sg-amber bg-black text-xs">
        <div className="text-sg-amber mb-1">KURISU:</div>
        <div>
          Habits shape the worldline. Consistency creates causality.
          Complete them daily to maintain temporal stability.
        </div>
      </div>
    </div>
  );
}
