import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { Category, Todo } from '../types/todo';
import { getTodayDateString } from '../utils/storage';

interface CalendarViewProps {
  todos: Todo[];
  categories: Category[];
  onOpenDetail: (todo: Todo) => void;
  onToggleComplete: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  todos,
  categories,
  onOpenDetail,
  onToggleComplete,
}) => {
  const todayStr = getTodayDateString();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth(); // 0-indexed

  // Month navigation
  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };
  const goToday = () => {
    setCurrentDate(new Date());
  };

  // Days in month
  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const daysOfWeek = ['일', '월', '화', '수', '목', '금', '토'];

  // Cells array
  const calendarCells = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    calendarCells.push(null);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    calendarCells.push(d);
  }

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 p-4 shadow-2xs">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="text-base font-bold text-neutral-900 dark:text-white font-mono tabular-nums">
            {year}년 {month + 1}월
          </h3>
          <button
            onClick={goToday}
            className="px-2 py-0.5 text-xs font-medium rounded-md bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white"
          >
            오늘
          </button>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
            title="이전 달"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800 hover:text-neutral-900 dark:hover:text-white"
            title="다음 달"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-1 text-center mb-1">
        {daysOfWeek.map((day, idx) => (
          <div 
            key={day} 
            className={`py-1.5 text-xs font-semibold ${idx === 0 ? 'text-rose-500' : idx === 6 ? 'text-blue-500' : 'text-neutral-400'}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarCells.map((dayNum, index) => {
          if (dayNum === null) {
            return (
              <div 
                key={`empty-${index}`} 
                className="min-h-[90px] p-1 bg-neutral-50/50 dark:bg-neutral-900/30 rounded-lg border border-transparent" 
              />
            );
          }

          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
          const isToday = dateStr === todayStr;
          const dayTasks = todos.filter(t => t.dueDate === dateStr);

          return (
            <div
              key={dateStr}
              className={`min-h-[90px] p-1.5 rounded-lg border transition-all flex flex-col justify-between ${
                isToday 
                  ? 'bg-neutral-50 dark:bg-neutral-800/80 border-neutral-900 dark:border-neutral-100 ring-1 ring-neutral-900 dark:ring-neutral-100' 
                  : 'bg-white dark:bg-neutral-900 border-neutral-100 dark:border-neutral-800/70 hover:border-neutral-300 dark:hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={`text-xs font-mono tabular-nums font-semibold ${
                  isToday 
                    ? 'text-neutral-950 dark:text-white' 
                    : 'text-neutral-600 dark:text-neutral-400'
                }`}>
                  {dayNum}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] text-neutral-400 font-mono tabular-nums">
                    {dayTasks.filter(t => t.completed).length}/{dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks preview in cell */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[70px]">
                {dayTasks.map(task => {
                  const category = categories.find(c => c.id === task.categoryId);
                  return (
                    <div
                      key={task.id}
                      onClick={() => onOpenDetail(task)}
                      className={`group/item text-[11px] p-1 rounded cursor-pointer truncate flex items-center justify-between transition-colors ${
                        task.completed 
                          ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-400 line-through' 
                          : 'bg-neutral-50 dark:bg-neutral-800/60 text-neutral-800 dark:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <span className="flex items-center gap-1 truncate">
                        {category && (
                          <span 
                            className="w-1.5 h-1.5 rounded-full shrink-0" 
                            style={{ backgroundColor: category.color }} 
                          />
                        )}
                        <span className="truncate">{task.title}</span>
                      </span>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleComplete(task.id);
                        }}
                        className="opacity-0 group-hover/item:opacity-100 hover:text-emerald-600 ml-1 shrink-0"
                        title={task.completed ? '미완료' : '완료'}
                      >
                        <Check className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
