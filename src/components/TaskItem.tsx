import React from 'react';
import { 
  Check, 
  Star, 
  Calendar, 
  Clock, 
  ListChecks, 
  Timer, 
  Trash2, 
  MoreHorizontal,
  Copy
} from 'lucide-react';
import { Category, Priority, Todo } from '../types/todo';
import { getTodayDateString } from '../utils/storage';

interface TaskItemProps {
  todo: Todo;
  category?: Category;
  isSelected: boolean;
  onToggleSelect: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onToggleStar: (id: string) => void;
  onOpenDetail: (todo: Todo) => void;
  onDelete: (id: string) => void;
  onDuplicate: (todo: Todo) => void;
  onStartFocus: (todo: Todo) => void;
}

const PRIORITY_LABELS: Record<Priority, { label: string; textClass: string }> = {
  urgent: { label: '긴급', textClass: 'text-rose-600 dark:text-rose-400 font-semibold' },
  high: { label: '높음', textClass: 'text-amber-600 dark:text-amber-400 font-medium' },
  medium: { label: '보통', textClass: 'text-blue-600 dark:text-blue-400' },
  low: { label: '낮음', textClass: 'text-neutral-500 dark:text-neutral-400' },
};

export const TaskItem: React.FC<TaskItemProps> = ({
  todo,
  category,
  isSelected,
  onToggleSelect,
  onToggleComplete,
  onToggleStar,
  onOpenDetail,
  onDelete,
  onDuplicate,
  onStartFocus,
}) => {
  const today = getTodayDateString();
  const priorityInfo = PRIORITY_LABELS[todo.priority];

  // Due date formatting & status
  let dueStatusText = '';
  let dueColorClass = 'text-neutral-500 dark:text-neutral-400';

  if (todo.dueDate) {
    if (todo.dueDate < today && !todo.completed) {
      dueStatusText = '지연됨';
      dueColorClass = 'text-rose-600 dark:text-rose-400 font-medium';
    } else if (todo.dueDate === today) {
      dueStatusText = '오늘 마감';
      dueColorClass = 'text-amber-600 dark:text-amber-400 font-medium';
    } else {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      if (todo.dueDate === tomorrowStr) {
        dueStatusText = '내일';
      } else {
        const [, m, d] = todo.dueDate.split('-');
        dueStatusText = `${parseInt(m, 10)}월 ${parseInt(d, 10)}일`;
      }
    }
  }

  // Subtask progress
  const totalSubtasks = todo.subtasks?.length || 0;
  const completedSubtasks = todo.subtasks?.filter(s => s.completed).length || 0;

  return (
    <div className={`
      group relative flex items-start gap-3 p-3.5 rounded-xl border transition-all duration-150
      ${todo.completed 
        ? 'bg-neutral-50/50 dark:bg-neutral-900/30 border-neutral-200/60 dark:border-neutral-800/60 opacity-70' 
        : 'bg-white dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 hover:border-neutral-300 dark:hover:border-neutral-700 shadow-2xs'}
      ${isSelected ? 'ring-2 ring-neutral-900 dark:ring-neutral-100' : ''}
    `}>
      {/* Selection checkbox for batch actions */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(todo.id)}
        className="mt-1 w-3.5 h-3.5 rounded text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 focus:ring-0 cursor-pointer shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="작업 일괄 선택"
      />

      {/* Main Complete Button */}
      <button
        onClick={() => onToggleComplete(todo.id)}
        className={`
          mt-0.5 w-5 h-5 rounded-md border flex items-center justify-center shrink-0 transition-colors
          ${todo.completed
            ? 'bg-emerald-600 border-emerald-600 text-white'
            : 'border-neutral-300 dark:border-neutral-700 hover:border-neutral-500 dark:hover:border-neutral-400 bg-white dark:bg-neutral-800'}
        `}
        aria-label={todo.completed ? '미완료로 변경' : '완료로 표시'}
      >
        {todo.completed && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      </button>

      {/* Content Area */}
      <div 
        onClick={() => onOpenDetail(todo)}
        className="flex-1 min-w-0 cursor-pointer"
      >
        <div className="flex items-center gap-2">
          <span className={`text-sm tracking-tight break-words ${
            todo.completed 
              ? 'line-through text-neutral-400 dark:text-neutral-500' 
              : 'text-neutral-900 dark:text-neutral-100 font-medium'
          }`}>
            {todo.title}
          </span>
        </div>

        {/* Quiet Description preview if present */}
        {todo.description && (
          <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1">
            {todo.description}
          </p>
        )}

        {/* Zero-Pill Quiet Metadata with · separator */}
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400">
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

          {todo.dueDate && (
            <>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className={`flex items-center gap-1 ${dueColorClass}`}>
                <Calendar className="w-3 h-3" />
                <span>{dueStatusText}</span>
                {todo.dueTime && <span>{todo.dueTime}</span>}
              </span>
            </>
          )}

          {totalSubtasks > 0 && (
            <>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="flex items-center gap-1 text-neutral-500 dark:text-neutral-400 font-mono text-[11px] tabular-nums">
                <ListChecks className="w-3 h-3" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
              </span>
            </>
          )}

          {todo.tags && todo.tags.length > 0 && (
            <>
              <span aria-hidden="true" className="text-neutral-300 dark:text-neutral-700">·</span>
              <span className="text-neutral-400 dark:text-neutral-500 text-[11px]">
                {todo.tags.map(t => `#${t}`).join(' ')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Action buttons (hover or always accessible) */}
      <div className="flex items-center gap-1 shrink-0 pt-0.5">
        {/* Star Button */}
        <button
          onClick={() => onToggleStar(todo.id)}
          className={`p-1 rounded-md transition-colors ${
            todo.isStarred 
              ? 'text-amber-500 hover:text-amber-600' 
              : 'text-neutral-300 dark:text-neutral-700 hover:text-neutral-500 dark:hover:text-neutral-400'
          }`}
          title={todo.isStarred ? '중요 표시 해제' : '중요 할 일로 표시'}
        >
          <Star className={`w-4 h-4 ${todo.isStarred ? 'fill-amber-500' : ''}`} />
        </button>

        {/* Start Focus Timer */}
        {!todo.completed && (
          <button
            onClick={() => onStartFocus(todo)}
            className="p-1 text-neutral-400 hover:text-rose-500 rounded-md transition-colors opacity-0 group-hover:opacity-100"
            title="이 작업으로 뽀모도로 집중 시작"
          >
            <Timer className="w-4 h-4" />
          </button>
        )}

        {/* Duplicate */}
        <button
          onClick={() => onDuplicate(todo)}
          className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="작업 복제"
        >
          <Copy className="w-4 h-4" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(todo.id)}
          className="p-1 text-neutral-400 hover:text-rose-600 rounded-md transition-colors opacity-0 group-hover:opacity-100"
          title="작업 삭제"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
