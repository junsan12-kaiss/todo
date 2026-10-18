import React from 'react';
import { Check, Star, ArrowRight, ArrowLeft, Plus } from 'lucide-react';
import { Category, Priority, Todo } from '../types/todo';
import { getTodayDateString } from '../utils/storage';

interface BoardViewProps {
  todos: Todo[];
  categories: Category[];
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onOpenDetail: (todo: Todo) => void;
  onMoveToInProgress: (id: string) => void;
  onMoveToTodo: (id: string) => void;
  onOpenAddTask: () => void;
}

const PRIORITY_LABELS: Record<Priority, { label: string; textClass: string }> = {
  urgent: { label: '긴급', textClass: 'text-rose-600 dark:text-rose-400 font-semibold' },
  high: { label: '높음', textClass: 'text-amber-600 dark:text-amber-400 font-medium' },
  medium: { label: '보통', textClass: 'text-blue-600 dark:text-blue-400' },
  low: { label: '낮음', textClass: 'text-neutral-500 dark:text-neutral-400' },
};

export const BoardView: React.FC<BoardViewProps> = ({
  todos,
  categories,
  onToggleComplete,
  onToggleStar,
  onOpenDetail,
  onMoveToInProgress,
  onMoveToTodo,
  onOpenAddTask,
}) => {
  const today = getTodayDateString();

  // Columns:
  // 1. Backlog / To Do: not completed, not today
  // 2. In Progress / Today: not completed, today or flagged
  // 3. Completed: completed
  const todoCol = todos.filter(t => !t.completed && t.dueDate !== today);
  const inProgressCol = todos.filter(t => !t.completed && (t.dueDate === today || (t.dueDate && t.dueDate < today)));
  const doneCol = todos.filter(t => t.completed);

  const columns = [
    { id: 'todo', title: '할 일 (대기 목록)', items: todoCol, count: todoCol.length },
    { id: 'progress', title: '오늘 / 진행 중', items: inProgressCol, count: inProgressCol.length },
    { id: 'done', title: '완료됨', items: doneCol, count: doneCol.length },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-8">
      {columns.map(col => (
        <div 
          key={col.id}
          className="flex flex-col bg-neutral-100/60 dark:bg-neutral-900/60 rounded-xl p-3 border border-neutral-200 dark:border-neutral-800 min-h-[500px]"
        >
          {/* Column Header */}
          <div className="flex items-center justify-between px-1 py-1.5 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                {col.title}
              </span>
              <span className="text-[11px] font-mono tabular-nums text-neutral-500 dark:text-neutral-400">
                {col.count}
              </span>
            </div>
            {col.id === 'todo' && (
              <button
                onClick={onOpenAddTask}
                className="p-1 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded"
                title="빠른 작업 추가"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Column Items */}
          <div className="flex-1 space-y-2 overflow-y-auto">
            {col.items.map(task => {
              const category = categories.find(c => c.id === task.categoryId);
              const priorityInfo = PRIORITY_LABELS[task.priority];
              const totalSubs = task.subtasks?.length || 0;
              const completedSubs = task.subtasks?.filter(s => s.completed).length || 0;

              return (
                <div
                  key={task.id}
                  className="group bg-white dark:bg-neutral-900 rounded-lg p-3 border border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div 
                      onClick={() => onOpenDetail(task)}
                      className="flex-1 cursor-pointer"
                    >
                      <h4 className={`text-xs font-medium tracking-tight ${task.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-900 dark:text-white'}`}>
                        {task.title}
                      </h4>
                      {task.description && (
                        <p className="mt-1 text-[11px] text-neutral-500 line-clamp-2">
                          {task.description}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => onToggleStar(task.id)}
                      className={`p-0.5 shrink-0 ${task.isStarred ? 'text-amber-500' : 'text-neutral-300 dark:text-neutral-700 hover:text-neutral-500'}`}
                    >
                      <Star className={`w-3.5 h-3.5 ${task.isStarred ? 'fill-amber-500' : ''}`} />
                    </button>
                  </div>

                  {/* Metadata line */}
                  <div className="mt-2.5 flex items-center gap-1.5 text-[11px] text-neutral-500 dark:text-neutral-400">
                    {category && (
                      <span className="flex items-center gap-1 text-neutral-700 dark:text-neutral-300">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: category.color }} />
                        <span>{category.name}</span>
                      </span>
                    )}

                    {category && priorityInfo && <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>}

                    {priorityInfo && (
                      <span className={priorityInfo.textClass}>
                        {priorityInfo.label}
                      </span>
                    )}

                    {totalSubs > 0 && (
                      <>
                        <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
                        <span className="font-mono tabular-nums">{completedSubs}/{totalSubs}</span>
                      </>
                    )}
                  </div>

                  {/* Column Action Buttons */}
                  <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <button
                      onClick={() => onToggleComplete(task.id)}
                      className={`text-[11px] flex items-center gap-1 font-medium transition-colors ${
                        task.completed 
                          ? 'text-neutral-400 hover:text-neutral-600' 
                          : 'text-emerald-600 hover:text-emerald-700 dark:text-emerald-400'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{task.completed ? '미완료로' : '완료'}</span>
                    </button>

                    <div className="flex items-center gap-1">
                      {col.id === 'todo' && (
                        <button
                          onClick={() => onMoveToInProgress(task.id)}
                          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded"
                          title="오늘 진행 중으로 이동"
                        >
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      {col.id === 'progress' && (
                        <button
                          onClick={() => onMoveToTodo(task.id)}
                          className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded"
                          title="대기 목록으로 이동"
                        >
                          <ArrowLeft className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {col.items.length === 0 && (
              <div className="py-8 text-center text-xs text-neutral-400 dark:text-neutral-600">
                작업이 없습니다
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
