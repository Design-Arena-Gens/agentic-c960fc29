"use client";

import { useState, useEffect } from 'react';
import { loadXPEvents, type XPEvent } from '@/lib/storage';
import { format } from 'date-fns';

export default function XPEventsPanel() {
  const [events, setEvents] = useState<XPEvent[]>([]);

  useEffect(() => {
    setEvents(loadXPEvents().reverse());
  }, []);

  const getEventColor = (type: XPEvent['type']) => {
    switch (type) {
      case 'habit': return 'text-sg-blue';
      case 'task': return 'text-sg-green';
      case 'study': return 'text-sg-amber';
      case 'penalty': return 'text-sg-red';
      case 'bonus': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };

  const getEventEmoji = (type: XPEvent['type']) => {
    switch (type) {
      case 'habit': return '⚡';
      case 'task': return '✓';
      case 'study': return '📚';
      case 'penalty': return '⚠️';
      case 'bonus': return '🎁';
      default: return '•';
    }
  };

  const todayEvents = events.filter(e => {
    const today = new Date().toDateString();
    return new Date(e.timestamp).toDateString() === today;
  });

  const todayXP = todayEvents.reduce((sum, e) => sum + e.value, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-sg-green">📊 XP EVENT LOG</h2>

      {/* Today's Summary */}
      <div className="mb-6 p-4 border border-sg-green bg-black">
        <div className="text-sm text-gray-400 mb-2">TODAY'S XP CHANGE</div>
        <div className={`text-3xl font-bold ${todayXP >= 0 ? 'text-sg-green' : 'text-sg-red'}`}>
          {todayXP >= 0 ? '+' : ''}{todayXP}
        </div>
        <div className="text-xs text-gray-400 mt-1">
          {todayEvents.length} events
        </div>
      </div>

      {/* Event Stream */}
      <div className="space-y-1">
        {events.slice(0, 50).map((event, idx) => (
          <div
            key={idx}
            className="p-2 border-l-4 bg-black hover:bg-sg-panel transition-all"
            style={{
              borderLeftColor: event.value >= 0 ? '#00ff00' : '#ff0000'
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex items-start gap-2 flex-1">
                <span className="text-lg">{getEventEmoji(event.type)}</span>
                <div className="flex-1">
                  <div className={`text-sm font-bold ${getEventColor(event.type)}`}>
                    {event.type.toUpperCase()}
                  </div>
                  <div className="text-xs text-gray-300">{event.reason}</div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(event.timestamp), 'MMM dd, HH:mm:ss')}
                  </div>
                </div>
              </div>
              <div className={`font-bold ${event.value >= 0 ? 'text-sg-green' : 'text-sg-red'}`}>
                {event.value >= 0 ? '+' : ''}{event.value}
              </div>
            </div>
          </div>
        ))}

        {events.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No XP events yet. Start completing tasks!
          </div>
        )}
      </div>

      {events.length > 50 && (
        <div className="mt-4 text-center text-xs text-gray-500">
          Showing 50 most recent events
        </div>
      )}

      <div className="mt-6 p-3 border border-sg-amber bg-black text-xs">
        <div className="text-sg-amber mb-1">DARU:</div>
        <div>
          Full event log with timestamps. Every action tracked.
          Perfect for debugging your life's source code.
        </div>
      </div>
    </div>
  );
}
