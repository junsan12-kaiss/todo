import React, { useState, useEffect } from 'react';
import { X, Play, Pause, RotateCcw, CheckCircle2, Flame, Bell } from 'lucide-react';
import { Todo } from '../types/todo';
import { sounds } from '../utils/sound';

interface PomodoroModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTask?: Todo | null;
  onCompleteTask?: (id: string) => void;
}

type Mode = 'focus' | 'shortBreak' | 'longBreak';

const MODE_DURATIONS: Record<Mode, number> = {
  focus: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export const PomodoroModal: React.FC<PomodoroModalProps> = ({
  isOpen,
  onClose,
  activeTask,
  onCompleteTask,
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<Mode>('focus');
  const [timeLeft, setTimeLeft] = useState<number>(MODE_DURATIONS.focus);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [completedSessions, setCompletedSessions] = useState<number>(() => {
    return parseInt(localStorage.getItem('taskflow_pomodoro_sessions') || '0', 10);
  });

  const totalTime = MODE_DURATIONS[mode];
  const progressPercent = Math.round(((totalTime - timeLeft) / totalTime) * 100);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      sounds.playTimerBell();
      setIsRunning(false);
      if (mode === 'focus') {
        const nextSessions = completedSessions + 1;
        setCompletedSessions(nextSessions);
        localStorage.setItem('taskflow_pomodoro_sessions', String(nextSessions));
        setMode('shortBreak');
        setTimeLeft(MODE_DURATIONS.shortBreak);
      } else {
        setMode('focus');
        setTimeLeft(MODE_DURATIONS.focus);
      }
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isRunning, timeLeft, mode, completedSessions]);

  const switchMode = (newMode: Mode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(MODE_DURATIONS[newMode]);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(MODE_DURATIONS[mode]);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-rose-500" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              뽀모도로 집중 모드
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 flex items-center justify-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
          <button
            onClick={() => switchMode('focus')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'focus' 
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            집중 (25분)
          </button>
          <button
            onClick={() => switchMode('shortBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'shortBreak' 
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            짧은 휴식 (5분)
          </button>
          <button
            onClick={() => switchMode('longBreak')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${
              mode === 'longBreak' 
                ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs' 
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            긴 휴식 (15분)
          </button>
        </div>

        {/* Linked Task Context */}
        {activeTask && (
          <div className="mt-4 p-3 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] uppercase font-semibold text-neutral-400 block tracking-wider">
                현재 집중 대상
              </span>
              <p className="text-xs font-semibold text-neutral-900 dark:text-white truncate">
                {activeTask.title}
              </p>
            </div>
            {onCompleteTask && (
              <button
                onClick={() => onCompleteTask(activeTask.id)}
                className="px-2.5 py-1 text-xs rounded bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 text-neutral-700 dark:text-neutral-200 hover:text-emerald-600 flex items-center gap-1 shrink-0"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>완료</span>
              </button>
            )}
          </div>
        )}

        {/* Large Timer Display */}
        <div className="my-8 flex flex-col items-center justify-center">
          <div className="relative w-48 h-48 flex items-center justify-center">
            {/* SVG Progress Circle */}
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="44"
                className="stroke-neutral-200 dark:stroke-neutral-800"
                strokeWidth="5"
                fill="none"
              />
              <circle
                cx="50"
                cy="50"
                r="44"
                className={`${mode === 'focus' ? 'stroke-rose-600' : 'stroke-emerald-600'} transition-all duration-300`}
                strokeWidth="5"
                strokeDasharray="276.46"
                strokeDashoffset={276.46 - (276.46 * progressPercent) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Digits */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold font-mono tabular-nums text-neutral-900 dark:text-white tracking-tight">
                {timeFormatted}
              </span>
              <span className="text-xs font-medium text-neutral-500 mt-1">
                {mode === 'focus' ? '집중 중' : '휴식 중'}
              </span>
            </div>
          </div>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
            title="초기화"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-8 py-3 rounded-full font-bold text-sm shadow-md flex items-center gap-2 transition-all ${
              isRunning 
                ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90' 
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-4 h-4" />
                <span>일시정지</span>
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                <span>시작하기</span>
              </>
            )}
          </button>
        </div>

        {/* Sessions Count Footer */}
        <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between text-xs text-neutral-500">
          <span>오늘 완료한 뽀모도로 세션</span>
          <span className="font-mono tabular-nums font-bold text-neutral-900 dark:text-white">
            {completedSessions}회 ({completedSessions * 25}분)
          </span>
        </div>
      </div>
    </div>
  );
};
