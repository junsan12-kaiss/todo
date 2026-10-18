import React, { useState } from 'react';
import { X, Plus, Trash2, Folder } from 'lucide-react';
import { Category } from '../types/todo';

interface CategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAddCategory: (category: Category) => void;
  onDeleteCategory: (id: string) => void;
}

const PRESET_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Emerald
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#F97316', // Orange
  '#6366F1', // Indigo
  '#64748B', // Slate
];

export const CategoryModal: React.FC<CategoryModalProps> = ({
  isOpen,
  onClose,
  categories,
  onAddCategory,
  onDeleteCategory,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: name.trim(),
      color: selectedColor,
    };

    onAddCategory(newCat);
    setName('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-10 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100 dark:border-neutral-800">
          <div className="flex items-center gap-2">
            <Folder className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            <h3 className="font-bold text-base text-neutral-900 dark:text-white">
              카테고리 & 프로젝트 관리
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Categories List */}
        <div className="my-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            현재 등록된 카테고리
          </label>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
            {categories.map(cat => (
              <div 
                key={cat.id}
                className="flex items-center justify-between p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                  <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                    {cat.name}
                  </span>
                </div>
                {/* Don't allow deleting if only 1 remains */}
                {categories.length > 1 && (
                  <button
                    onClick={() => onDeleteCategory(cat.id)}
                    className="p-1 text-neutral-400 hover:text-rose-500 rounded"
                    title="카테고리 삭제"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Add New Category Form */}
        <form onSubmit={handleSubmit} className="pt-4 border-t border-neutral-100 dark:border-neutral-800">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">
            새 카테고리 추가
          </label>
          <div className="space-y-3">
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="카테고리명 (예: 사이드 프로젝트, 독서)"
              className="w-full text-xs bg-neutral-50 dark:bg-neutral-800/50 p-2.5 rounded-lg border border-neutral-200 dark:border-neutral-800 text-neutral-900 dark:text-white focus:outline-none"
            />

            <div>
              <span className="block text-[11px] text-neutral-500 mb-1.5">테마 색상 선택</span>
              <div className="flex items-center gap-2">
                {PRESET_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-6 h-6 rounded-full transition-transform ${
                      selectedColor === color ? 'ring-2 ring-offset-2 ring-neutral-900 dark:ring-white scale-110' : 'hover:scale-105'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!name.trim()}
              className="w-full py-2 bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-xs font-semibold rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 disabled:opacity-40 transition-colors flex items-center justify-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>카테고리 생성</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
