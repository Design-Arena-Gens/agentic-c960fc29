"use client";

import { useState, useEffect } from 'react';
import { loadStudySessions, saveStudySession, type StudySession } from '@/lib/storage';
import { saveXPEvent } from '@/lib/storage';

interface StudyPanelProps {
  onXPChange: (delta: number, reason: string) => void;
}

export default function StudyPanel({ onXPChange }: StudyPanelProps) {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [subject, setSubject] = useState('');
  const [duration, setDuration] = useState(30);
  const [isStudying, setIsStudying] = useState(false);
  const [studyStartTime, setStudyStartTime] = useState<Date | null>(null);
  const [elapsedMinutes, setElapsedMinutes] = useState(0);

  useEffect(() => {
    setSessions(loadStudySessions());
  }, []);

  useEffect(() => {
    if (!isStudying || !studyStartTime) return;

    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - studyStartTime.getTime()) / 60000);
      setElapsedMinutes(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [isStudying, studyStartTime]);

  const startStudy = () => {
    if (!subject.trim()) return;
    setIsStudying(true);
    setStudyStartTime(new Date());
    setElapsedMinutes(0);
  };

  const endStudy = () => {
    if (!studyStartTime || !subject) return;

    const actualDuration = Math.max(1, elapsedMinutes);
    const xpGained = actualDuration * 2; // 2 XP per minute

    const session: StudySession = {
      id: Date.now().toString(),
      subject,
      duration: actualDuration,
      timestamp: new Date().toISOString(),
      xpGained,
    };

    saveStudySession(session);
    setSessions([session, ...sessions]);

    onXPChange(xpGained, `Study: ${subject}`);

    saveXPEvent({
      type: 'study',
      value: xpGained,
      reason: `${subject} (${actualDuration}m)`,
      timestamp: Date.now(),
    });

    setIsStudying(false);
    setStudyStartTime(null);
    setElapsedMinutes(0);
    setSubject('');
  };

  const logManualSession = () => {
    if (!subject.trim() || duration <= 0) return;

    const xpGained = duration * 2;

    const session: StudySession = {
      id: Date.now().toString(),
      subject,
      duration,
      timestamp: new Date().toISOString(),
      xpGained,
    };

    saveStudySession(session);
    setSessions([session, ...sessions]);

    onXPChange(xpGained, `Study: ${subject}`);

    saveXPEvent({
      type: 'study',
      value: xpGained,
      reason: `${subject} (${duration}m)`,
      timestamp: Date.now(),
    });

    setSubject('');
    setDuration(30);
  };

  const todaySessions = sessions.filter(s => {
    const today = new Date().toDateString();
    return new Date(s.timestamp).toDateString() === today;
  });

  const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);
  const todayXP = todaySessions.reduce((sum, s) => sum + s.xpGained, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-sg-green">📚 STUDY TRACKER (IISER)</h2>

      {/* Today's Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="border border-sg-green p-3 bg-black">
          <div className="text-xs text-gray-400">TODAY'S STUDY TIME</div>
          <div className="text-2xl font-bold">{todayMinutes} min</div>
        </div>
        <div className="border border-sg-green p-3 bg-black">
          <div className="text-xs text-gray-400">TODAY'S XP</div>
          <div className="text-2xl font-bold text-sg-amber">+{todayXP}</div>
        </div>
      </div>

      {/* Active Study Session */}
      {isStudying && (
        <div className="mb-6 p-4 border-2 border-sg-amber bg-sg-amber bg-opacity-10 animate-pulse-slow">
          <div className="text-center">
            <div className="text-sm text-sg-amber mb-2">STUDYING: {subject}</div>
            <div className="text-4xl font-bold mb-4">{elapsedMinutes} min</div>
            <div className="text-sm text-gray-400 mb-4">XP: +{elapsedMinutes * 2}</div>
            <button
              onClick={endStudy}
              className="px-6 py-3 bg-sg-green text-black font-bold hover:bg-sg-blue"
            >
              END SESSION
            </button>
          </div>
        </div>
      )}

      {/* Study Form */}
      {!isStudying && (
        <div className="mb-6 p-4 border border-sg-blue bg-black">
          <div className="text-sm text-sg-blue mb-2">LOG STUDY SESSION</div>

          <div className="space-y-2 mb-4">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject (e.g., Quantum Mechanics, Organic Chemistry)"
              className="w-full bg-sg-dark border border-sg-green p-2 text-sg-green"
            />

            <div className="flex gap-2">
              <button
                onClick={startStudy}
                className="flex-1 px-4 py-2 bg-sg-green text-black font-bold hover:bg-sg-blue"
              >
                START TIMER
              </button>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-4">
            <div className="text-xs text-gray-400 mb-2">OR LOG MANUALLY</div>
            <div className="flex gap-2">
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                placeholder="Minutes"
                className="w-24 bg-sg-dark border border-sg-green p-2 text-sg-green"
              />
              <button
                onClick={logManualSession}
                className="px-4 py-2 bg-sg-amber text-black font-bold hover:bg-sg-blue"
              >
                LOG {duration} MIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recent Sessions */}
      <div>
        <h3 className="text-lg font-bold mb-3">RECENT SESSIONS</h3>
        <div className="space-y-2">
          {sessions.slice(0, 10).map(session => (
            <div key={session.id} className="p-3 border border-sg-green bg-black">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold">{session.subject}</div>
                  <div className="text-xs text-gray-400">
                    {new Date(session.timestamp).toLocaleString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold">{session.duration} min</div>
                  <div className="text-xs text-sg-amber">+{session.xpGained} XP</div>
                </div>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No study sessions logged yet.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-3 border border-sg-amber bg-black text-xs">
        <div className="text-sg-amber mb-1">KURISU:</div>
        <div>
          Knowledge compounds across worldlines. 2 XP per minute.
          IISER demands precision. Track your progress scientifically.
        </div>
      </div>
    </div>
  );
}
