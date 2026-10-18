import React, { useState } from 'react';
import { Plus, Calendar, Flag, Folder, CornerDownLeft } from 'lucide-react';
import { Category, Priority, Todo } from '../types/todo';
import { getOffsetDateString, getTodayDateString } from '../utils/storage';

interface QuickAddTaskProps {
  categories: Category[];
  currentView: string;
  onAddTask: (task: Omit<Todo, 'id' | 'createdAt' | 'order'>) => void;
}

export const QuickAddTask: React.FC<QuickAddTaskProps> = ({
  categories,
  currentView,
  onAddTask,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  // Default values based on current view
  const defaultCategory = categories.find(c => c.id === currentView)?.id || (categories[0]?.id ?? 'work');
  const defaultDueDate = currentView === 'today' ? getTodayDateString() : '';

  const [categoryId, setCategoryId] = useState(defaultCategory);
  const [priority, setPriority] = useState<Priority>('medium');
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const [dueTime, setDueTime] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;

    const tags = tagsInput
      .split(',')
      .map(t => t.trim().replace(/^#/, ''))
      .filter(Boolean);

    onAddTask({
      title: trimmedTitle,
      description: description.trim() || undefined,
      completed: false,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      priority,
      categoryId,
      tags,
      isStarred: false,
      subtasks: [],
    });

    setTitle('');
    setDescription('');
    setTagsInput('');
    if (currentView !== 'today') {
      setDueDate('');
      setDueTime('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const setPresetDate = (days: number) => {
    setDueDate(getOffsetDateString(days));
  };

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs transition-all overflow-hidden">
      <form onSubmit={handleSubmit} className="p-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-7 h-7 rounded-lg bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white flex items-center justify-center shrink-0 transition-colors"
            title="상세 옵션 펼치기/접기"
          >
            <Plus className={`w-4 h-4 transition-transform duration-150 ${isExpanded ? 'rotate-45' : ''}`} />
          </button>
          
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            onKeyDown={handleKeyDown}
            placeholder="새 할 일을 입력하세요 (Enter를 누르면 즉시 추가)"
            className="flex-1 bg-transparent text-sm text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!title.trim()}
            className="px-3 py-1.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center gap-1.5 shrink-0"
          >
            <span>추가</span>
            <CornerDownLeft className="w-3 h-3" />
          </button>
        </div>

        {/* Expanded options */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800 space-y-3">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="상세 메모 또는 설명 (선택 사항)"
              rows={2}
              className="w-full bg-neutral-50 dark:bg-neutral-800/50 text-xs text-neutral-900 dark:text-white placeholder:text-neutral-400 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none"
            />

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Category picker */}
              <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/60 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800">
                <Folder className="w-3.5 h-3.5 text-neutral-500" />
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c.id} value={c.id} className="dark:bg-neutral-900 text-neutral-900 dark:text-white">
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority picker */}
              <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/60 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800">
                <Flag className="w-3.5 h-3.5 text-neutral-500" />
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Priority)}
                  className="bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer"
                >
                  <option value="urgent" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">긴급</option>
                  <option value="high" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">높음</option>
                  <option value="medium" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">보통</option>
                  <option value="low" className="dark:bg-neutral-900 text-neutral-900 dark:text-white">낮음</option>
                </select>
              </div>

              {/* Due Date Input & Quick Buttons */}
              <div className="flex items-center gap-1.5 bg-neutral-50 dark:bg-neutral-800/60 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800">
                <Calendar className="w-3.5 h-3.5 text-neutral-500" />
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="bg-transparent text-neutral-800 dark:text-neutral-200 focus:outline-none cursor-pointer text-xs"
                />
              </div>

              {/* Quick Date Presets */}
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setPresetDate(0)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    dueDate === getTodayDateString() 
                      ? 'bg-neutral-900 dark:bg-white text-white dark:text-neutral-900' 
                      : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                  }`}
                >
                  오늘
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(1)}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  내일
                </button>
                <button
                  type="button"
                  onClick={() => setPresetDate(7)}
                  className="px-2 py-1 rounded text-[11px] font-medium bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  다음 주
                </button>
              </div>

              {/* Tags Input */}
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                placeholder="태그 (쉼표로 구분: 기획, 회의)"
                className="flex-1 min-w-[140px] bg-neutral-50 dark:bg-neutral-800/60 text-xs text-neutral-800 dark:text-neutral-200 placeholder:text-neutral-400 px-2 py-1 rounded-md border border-neutral-200 dark:border-neutral-800 focus:outline-none"
              />
            </div>
          </div>
        )}
      </form>
    </div>
  );
};
