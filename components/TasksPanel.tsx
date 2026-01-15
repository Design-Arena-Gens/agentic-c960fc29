"use client";

import { useState, useEffect } from 'react';
import { loadTasks, saveTasks, type Task } from '@/lib/storage';
import { saveXPEvent } from '@/lib/storage';
import { format } from 'date-fns';

interface TasksPanelProps {
  onXPChange: (delta: number, reason: string) => void;
}

export default function TasksPanel({ onXPChange }: TasksPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState({
    title: '',
    deadline: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    category: 'general',
  });

  useEffect(() => {
    setTasks(loadTasks());
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const xpValues = { high: 50, medium: 30, low: 15 };

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      deadline: newTask.deadline,
      priority: newTask.priority,
      xpValue: xpValues[newTask.priority],
      completed: false,
      category: newTask.category,
    };

    setTasks([...tasks, task]);
    setNewTask({ title: '', deadline: '', priority: 'medium', category: 'general' });
  };

  const toggleTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;

    const completed = !task.completed;
    setTasks(tasks.map(t => t.id === id ? { ...t, completed } : t));

    const xpDelta = completed ? task.xpValue : -task.xpValue;
    onXPChange(xpDelta, `Task: ${task.title}`);

    saveXPEvent({
      type: 'task',
      value: xpDelta,
      reason: task.title,
      timestamp: Date.now(),
    });
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-sg-red border-sg-red';
      case 'medium': return 'text-sg-amber border-sg-amber';
      case 'low': return 'text-sg-blue border-sg-blue';
      default: return 'text-sg-green border-sg-green';
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-sg-green">📋 MISSION TASKS</h2>

      {/* Add Task Form */}
      <div className="mb-6 p-4 border border-sg-blue bg-black">
        <div className="text-sm text-sg-blue mb-2">NEW TASK</div>
        <div className="space-y-2">
          <input
            type="text"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            placeholder="Task description..."
            className="w-full bg-sg-dark border border-sg-green p-2 text-sg-green"
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />

          <div className="flex gap-2">
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="flex-1 bg-sg-dark border border-sg-green p-2 text-sg-green"
            />

            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
              className="bg-sg-dark border border-sg-green p-2 text-sg-green"
            >
              <option value="high">HIGH</option>
              <option value="medium">MEDIUM</option>
              <option value="low">LOW</option>
            </select>

            <input
              type="text"
              value={newTask.category}
              onChange={(e) => setNewTask({ ...newTask, category: e.target.value })}
              placeholder="Category"
              className="w-32 bg-sg-dark border border-sg-green p-2 text-sg-green"
            />

            <button
              onClick={addTask}
              className="px-4 py-2 bg-sg-green text-black font-bold hover:bg-sg-blue"
            >
              ADD
            </button>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="space-y-2">
        {sortedTasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            No tasks yet. Add one above.
          </div>
        )}

        {sortedTasks.map(task => {
          const isOverdue = task.deadline && new Date(task.deadline) < new Date() && !task.completed;

          return (
            <div
              key={task.id}
              className={`p-4 border-2 transition-all ${
                task.completed
                  ? 'border-sg-green bg-sg-green bg-opacity-10'
                  : isOverdue
                  ? 'border-sg-red bg-sg-red bg-opacity-10 animate-pulse-slow'
                  : getPriorityColor(task.priority)
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 border-2 flex items-center justify-center mt-1 ${
                      task.completed
                        ? 'border-sg-green bg-sg-green text-black'
                        : getPriorityColor(task.priority)
                    }`}
                  >
                    {task.completed && '✓'}
                  </button>

                  <div className="flex-1">
                    <div className={`font-bold ${task.completed ? 'line-through' : ''}`}>
                      {task.title}
                    </div>
                    <div className="text-xs text-gray-400 mt-1 flex gap-4">
                      <span className={getPriorityColor(task.priority)}>
                        {task.priority.toUpperCase()}
                      </span>
                      {task.deadline && (
                        <span className={isOverdue ? 'text-sg-red' : ''}>
                          {format(new Date(task.deadline), 'MMM dd, yyyy')}
                          {isOverdue && ' ⚠️ OVERDUE'}
                        </span>
                      )}
                      <span>XP: +{task.xpValue}</span>
                      <span className="text-sg-blue">{task.category}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteTask(task.id)}
                  className="px-2 py-1 text-sg-red hover:bg-sg-red hover:text-black border border-sg-red"
                >
                  DEL
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-3 border border-sg-amber bg-black text-xs">
        <div className="text-sg-amber mb-1">OKABE:</div>
        <div>
          Each task is a decision point in the worldline. Complete them before the deadline,
          or face divergence penalties. SERN is watching.
        </div>
      </div>
    </div>
  );
}
