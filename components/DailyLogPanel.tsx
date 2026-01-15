"use client";

import { useState, useEffect } from 'react';
import { loadDailyLogs, saveDailyLog, type DailyLog } from '@/lib/storage';
import { format } from 'date-fns';

export default function DailyLogPanel() {
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [currentLog, setCurrentLog] = useState<DailyLog>({
    date: format(new Date(), 'yyyy-MM-dd'),
    mood: '😐',
    productivity: 5,
    notes: '',
    xpGained: 0,
    divergence: 0,
  });

  useEffect(() => {
    const loadedLogs = loadDailyLogs();
    setLogs(loadedLogs);

    const today = format(new Date(), 'yyyy-MM-dd');
    const todayLog = loadedLogs.find(log => log.date === today);
    if (todayLog) {
      setCurrentLog(todayLog);
    }
  }, []);

  const saveLog = () => {
    saveDailyLog(currentLog);

    const updatedLogs = logs.filter(log => log.date !== currentLog.date);
    setLogs([currentLog, ...updatedLogs].sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  };

  const moods = ['😭', '😢', '😐', '🙂', '😊', '🤩'];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-sg-green">📝 DAILY LOG</h2>

      {/* Today's Log */}
      <div className="mb-6 p-4 border border-sg-blue bg-black">
        <div className="text-sm text-sg-blue mb-3">
          LOG: {format(new Date(currentLog.date), 'MMMM dd, yyyy')}
        </div>

        {/* Mood Selector */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">MOOD</div>
          <div className="flex gap-2">
            {moods.map(mood => (
              <button
                key={mood}
                onClick={() => setCurrentLog({ ...currentLog, mood })}
                className={`text-3xl p-2 border-2 transition-all ${
                  currentLog.mood === mood
                    ? 'border-sg-green bg-sg-green bg-opacity-20'
                    : 'border-gray-600 hover:border-sg-green'
                }`}
              >
                {mood}
              </button>
            ))}
          </div>
        </div>

        {/* Productivity Slider */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">
            PRODUCTIVITY: {currentLog.productivity}/10
          </div>
          <input
            type="range"
            min="0"
            max="10"
            value={currentLog.productivity}
            onChange={(e) => setCurrentLog({
              ...currentLog,
              productivity: Number(e.target.value)
            })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>0</span>
            <span>5</span>
            <span>10</span>
          </div>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 mb-2">NOTES</div>
          <textarea
            value={currentLog.notes}
            onChange={(e) => setCurrentLog({ ...currentLog, notes: e.target.value })}
            placeholder="What happened today? Experiments? Discoveries? Failures?"
            className="w-full h-32 bg-sg-dark border border-sg-green p-2 text-sg-green resize-none"
          />
        </div>

        <button
          onClick={saveLog}
          className="w-full px-4 py-3 bg-sg-green text-black font-bold hover:bg-sg-blue"
        >
          SAVE LOG
        </button>
      </div>

      {/* Previous Logs */}
      <div>
        <h3 className="text-lg font-bold mb-3">WORLDLINE HISTORY</h3>
        <div className="space-y-2">
          {logs.slice(0, 7).map(log => (
            <div key={log.date} className="p-3 border border-sg-green bg-black">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold">{format(new Date(log.date), 'MMM dd, yyyy')}</div>
                  <div className="text-xs text-gray-400">
                    Productivity: {log.productivity}/10
                  </div>
                </div>
                <div className="text-3xl">{log.mood}</div>
              </div>
              {log.notes && (
                <div className="text-sm text-gray-300 mt-2 border-t border-gray-700 pt-2">
                  {log.notes}
                </div>
              )}
            </div>
          ))}

          {logs.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No logs yet. Start logging above.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-3 border border-sg-amber bg-black text-xs">
        <div className="text-sg-amber mb-1">MAYURI:</div>
        <div>
          Tuturu~! Writing down your day helps you remember!
          Even Okabe forgets things sometimes! (*´▽`*)
        </div>
      </div>
    </div>
  );
}
