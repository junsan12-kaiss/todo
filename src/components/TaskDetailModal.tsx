import React, { useState, useEffect } from 'react';
import { 
  X, 
  Trash2, 
  Calendar, 
  Clock, 
  Flag, 
  Folder, 
  Check, 
  Plus, 
  Timer, 
  Tag, 
  Star,
  CheckCircle2
} from 'lucide-react';
import { Category, Priority, SubTask, Todo } from '../types/todo';

interface TaskDetailModalProps {
  todo: Todo | null;
  categories: Category[];
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updated: Todo) => void;
  onDelete: (id: string) => void;
  onStartFocus: (todo: Todo) => void;
}

export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  todo,
  categories,
  isOpen,
  onClose,
  onUpdate,
  onDelete,
  onStartFocus,
}) => {
  if (!isOpen || !todo) return null;

  const [title, setTitle] = useState(todo.title);
  const [description, setDescription] = useState(todo.description || '');
  const [categoryId, setCategoryId] = useState(todo.categoryId);
  const [priority, setPriority] = useState<Priority>(todo.priority);
  const [dueDate, setDueDate] = useState(todo.dueDate || '');
  const [dueTime, setDueTime] = useState(todo.dueTime || '');
  const [isStarred, setIsStarred] = useState(todo.isStarred);
  const [subtasks, setSubtasks] = useState<SubTask[]>(todo.subtasks || []);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(todo.tags || []);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title);
      setDescription(todo.description || '');
      setCategoryId(todo.categoryId);
      setPriority(todo.priority);
      setDueDate(todo.dueDate || '');
      setDueTime(todo.dueTime || '');
      setIsStarred(todo.isStarred);
      setSubtasks(todo.subtasks || []);
      setTags(todo.tags || []);
    }
  }, [todo]);

  const handleSave = () => {
    onUpdate({
      ...todo,
      title: title.trim() || todo.title,
      description: description.trim() || undefined,
      categoryId,
      priority,
      dueDate: dueDate || undefined,
      dueTime: dueTime || undefined,
      isStarred,
      subtasks,
      tags,
    });
    onClose();
  };

  const handleAddSubtask = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    const newSub: SubTask = {
      id: `sub-${Date.now()}`,
      title: newSubtaskTitle.trim(),
      completed: false,
    };
    const updated = [...subtasks, newSub];
    setSubtasks(updated);
    setNewSubtaskTitle('');
  };

  const handleToggleSubtask = (subId: string) => {
    setSubtasks(prev => prev.map(s => s.id === subId ? { ...s, completed: !s.completed } : s));
  };

  const handleDeleteSubtask = (subId: string) => {
    setSubtasks(prev => prev.filter(s => s.id !== subId));
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const totalSubs = subtasks.length;
  const completedSubs = subtasks.filter(s => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-neutral-900/40 dark:bg-black/60 backdrop-blur-xs transition-opacity" 
        onClick={handleSave} 
      />

      {/* Slide-in Drawer */}
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 h-full shadow-2xl flex flex-col z-10 border-l border-neutral-200 dark:border-neutral-800 animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const nextState = !todo.completed;
                onUpdate({
                  ...todo,
                  completed: nextState,
                  completedAt: nextState ? new Date().toISOString() : undefined,
                });
              }}
              className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                todo.completed
                  ? 'bg-emerald-600 border-emerald-600 text-white'
                  : 'border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 hover:border-neutral-400'
              }`}
              title={todo.completed ? '미완료로 변경' : '완료로 표시'}
            >
              {todo.completed && <Check className="w-4 h-4 stroke-[2.5]" />}
            </button>
            <span className="text-xs text-neutral-500 font-medium">
              {todo.completed ? '완료된 할 일' : '진행 중인 할 일'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsStarred(!isStarred)}
              className={`p-1.5 rounded-lg transition-colors ${
                isStarred ? 'text-amber-500' : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
              }`}
              title={isStarred ? '중요 해제' : '중요 할 일로 등록'}
            >
              <Star className={`w-5 h-5 ${isStarred ? 'fill-amber-500' : ''}`} />
            </button>
            <button
              onClick={() => {
                onDelete(todo.id);
                onClose();
              }}
              className="p-1.5 text-neutral-400 hover:text-rose-600 rounded-lg transition-colors"
              title="작업 삭제"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <button
              onClick={handleSave}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
              title="닫기"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              할 일 제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="할 일을 입력하세요"
              className="w-full text-base font-semibold text-neutral-900 dark:text-white bg-transparent border-b border-neutral-200 dark:border-neutral-800 pb-2 focus:outline-none focus:border-neutral-900 dark:focus:border-white transition-colors"
            />
          </div>

          {/* Description / Notes */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1">
              상세 메모 & 노트
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="세부 내용이나 필요한 링크, 메모를 자유롭게 적어보세요"
              rows={4}
              className="w-full bg-neutral-50 dark:bg-neutral-800/50 text-sm text-neutral-800 dark:text-neutral-200 p-3 rounded-xl border border-neutral-200 dark:border-neutral-800 focus:outline-none focus:ring-1 focus:ring-neutral-400 resize-none leading-relaxed"
            />
          </div>

          {/* Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                <Folder className="w-3.5 h-3.5" />
                카테고리 / 프로젝트
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id} className="dark:bg-neutral-900">
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                <Flag className="w-3.5 h-3.5" />
                우선순위
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800/60 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              >
                <option value="urgent" className="dark:bg-neutral-900">긴급</option>
                <option value="high" className="dark:bg-neutral-900">높음</option>
                <option value="medium" className="dark:bg-neutral-900">보통</option>
                <option value="low" className="dark:bg-neutral-900">낮음</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                <Calendar className="w-3.5 h-3.5" />
                마감일
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>

            {/* Due Time */}
            <div>
              <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
                <Clock className="w-3.5 h-3.5" />
                마감 시간
              </label>
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full text-xs font-medium bg-neutral-50 dark:bg-neutral-800/60 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
            </div>
          </div>

          {/* Subtasks (하위 할 일 체크리스트) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
                하위 작업 ({completedSubs}/{totalSubs})
              </label>
              {totalSubs > 0 && (
                <span className="text-[11px] font-mono tabular-nums text-neutral-500">
                  {Math.round((completedSubs / totalSubs) * 100)}%
                </span>
              )}
            </div>

            {totalSubs > 0 && (
              <div className="w-full h-1 bg-neutral-100 dark:bg-neutral-800 rounded-full mb-3 overflow-hidden">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-200"
                  style={{ width: `${(completedSubs / totalSubs) * 100}%` }}
                />
              </div>
            )}

            <div className="space-y-1.5 mb-3">
              {subtasks.map(sub => (
                <div 
                  key={sub.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                >
                  <label className="flex items-center gap-2.5 flex-1 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sub.completed}
                      onChange={() => handleToggleSubtask(sub.id)}
                      className="w-4 h-4 rounded text-neutral-900 dark:text-white border-neutral-300 dark:border-neutral-700 cursor-pointer"
                    />
                    <span className={`text-xs ${sub.completed ? 'line-through text-neutral-400 dark:text-neutral-500' : 'text-neutral-800 dark:text-neutral-200'}`}>
                      {sub.title}
                    </span>
                  </label>
                  <button
                    onClick={() => handleDeleteSubtask(sub.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtaskTitle}
                onChange={(e) => setNewSubtaskTitle(e.target.value)}
                placeholder="새 하위 항목 추가..."
                className="flex-1 text-xs bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
              />
              <button
                type="submit"
                disabled={!newSubtaskTitle.trim()}
                className="px-3 py-2 bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-medium rounded-lg text-neutral-800 dark:text-neutral-200 disabled:opacity-40"
              >
                추가
              </button>
            </form>
          </div>

          {/* Tags */}
          <div>
            <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-1.5">
              <Tag className="w-3.5 h-3.5" />
              태그 관리
            </label>
            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              {tags.map(t => (
                <span 
                  key={t}
                  className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                >
                  #{t}
                  <button onClick={() => handleRemoveTag(t)} className="hover:text-rose-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="태그 입력 후 Enter (예: 프론트엔드)"
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-800/50 p-2 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />
          </div>

          {/* Focus Timer Trigger */}
          <div className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-neutral-900 dark:text-white block">
                뽀모도로 집중 모드
              </span>
              <span className="text-[11px] text-neutral-500">
                25분간 이 작업에 온전히 몰입하세요
              </span>
            </div>
            <button
              onClick={() => {
                handleSave();
                onStartFocus(todo);
              }}
              className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Timer className="w-3.5 h-3.5" />
              <span>집중 시작</span>
            </button>
          </div>

          {/* Metadata Footer */}
          <div className="text-[11px] text-neutral-400 dark:text-neutral-600 space-y-1 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div>생성일시: {new Date(todo.createdAt).toLocaleString('ko-KR')}</div>
            {todo.completedAt && (
              <div>완료일시: {new Date(todo.completedAt).toLocaleString('ko-KR')}</div>
            )}
          </div>
        </div>

        {/* Drawer Footer Actions */}
        <div className="p-4 px-6 border-t border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-end gap-2 bg-neutral-50/60 dark:bg-neutral-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-lg transition-colors"
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="px-5 py-2 text-xs font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-colors"
          >
            변경사항 저장
          </button>
        </div>
      </div>
    </div>
  );
};
