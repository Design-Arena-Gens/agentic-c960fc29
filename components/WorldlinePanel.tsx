"use client";

import { useState, useEffect } from 'react';
import { loadWorldlineHistory, type WorldlineEntry } from '@/lib/storage';
import { generateWorldline } from '@/lib/engine';
import { format } from 'date-fns';

interface WorldlinePanelProps {
  divergence: number;
}

export default function WorldlinePanel({ divergence }: WorldlinePanelProps) {
  const [history, setHistory] = useState<WorldlineEntry[]>([]);
  const currentWorldline = generateWorldline(divergence);

  useEffect(() => {
    setHistory(loadWorldlineHistory());
  }, []);

  const targetWorldline = "1.048596"; // Steins Gate
  const difference = Math.abs(parseFloat(currentWorldline) - parseFloat(targetWorldline));
  const proximity = Math.max(0, 100 - (difference * 1000000));

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-sg-green">🌐 WORLDLINE DIVERGENCE</h2>

      {/* Current Worldline */}
      <div className="mb-6 p-6 border-2 border-sg-amber bg-black text-center">
        <div className="text-sm text-gray-400 mb-2">CURRENT WORLDLINE</div>
        <div className="text-5xl font-bold text-sg-amber animate-pulse mb-4 glitch">
          {currentWorldline}%
        </div>
        <div className="text-sm text-gray-400">
          Divergence Value: {divergence}
        </div>
      </div>

      {/* Target Analysis */}
      <div className="mb-6 p-4 border border-sg-green bg-black">
        <div className="text-sm mb-2">TARGET: STEINS GATE</div>
        <div className="text-2xl font-bold mb-2">{targetWorldline}%</div>

        <div className="mt-4">
          <div className="text-xs text-gray-400 mb-1">
            PROXIMITY: {proximity.toFixed(2)}%
          </div>
          <div className="h-4 bg-sg-dark border border-sg-green relative overflow-hidden">
            <div
              className="h-full bg-sg-green transition-all duration-500"
              style={{ width: `${proximity}%` }}
            />
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-400">
          Difference: {(difference * 1000000).toFixed(0)} micro-units
        </div>
      </div>

      {/* Worldline Visualization */}
      <div className="mb-6 p-4 border border-sg-blue bg-black">
        <div className="text-sm text-sg-blue mb-3">DIVERGENCE MAP</div>

        <div className="space-y-1">
          {[
            { value: "1.130205", label: "α Worldline (SERN Dystopia)", color: "text-red-500" },
            { value: currentWorldline, label: "CURRENT POSITION", color: "text-sg-amber" },
            { value: "1.048596", label: "β Worldline (Steins Gate)", color: "text-sg-green" },
            { value: "0.523307", label: "γ Worldline", color: "text-blue-400" },
          ].map((wl, idx) => (
            <div
              key={idx}
              className={`p-2 text-sm ${
                wl.value === currentWorldline
                  ? 'border-2 border-sg-amber bg-sg-amber bg-opacity-10'
                  : 'border border-gray-700'
              }`}
            >
              <div className="flex justify-between">
                <span className={wl.color}>{wl.label}</span>
                <span className="font-mono">{wl.value}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-lg font-bold mb-3">DIVERGENCE HISTORY</h3>
        <div className="space-y-2">
          {history.slice(0, 10).map((entry, idx) => (
            <div key={idx} className="p-3 border border-sg-green bg-black">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-sg-amber">{entry.value}%</div>
                  <div className="text-xs text-gray-400">
                    {format(new Date(entry.timestamp), 'MMM dd, HH:mm')}
                  </div>
                  <div className="text-xs text-gray-300 mt-1">{entry.event}</div>
                </div>
                <div className="text-sm text-gray-400">
                  Δ{entry.divergence}
                </div>
              </div>
            </div>
          ))}

          {history.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              No worldline history yet.
            </div>
          )}
        </div>
      </div>

      <div className="mt-6 p-3 border border-sg-amber bg-black text-xs">
        <div className="text-sg-amber mb-1">OKABE:</div>
        <div>
          Every action shifts the worldline. Our goal: reach 1.048596% —
          the Steins Gate worldline where everyone survives. El Psy Kongroo.
        </div>
      </div>
    </div>
  );
}
