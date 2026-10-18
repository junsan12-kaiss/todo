import React from 'react';
import { Check, RotateCcw, Trash2, X } from 'lucide-react';

interface BatchActionBarProps {
  selectedCount: number;
  onCompleteSelected: () => void;
  onIncompleteSelected: () => void;
  onDeleteSelected: () => void;
  onClearSelection: () => void;
}

export const BatchActionBar: React.FC<BatchActionBarProps> = ({
  selectedCount,
  onCompleteSelected,
  onIncompleteSelected,
  onDeleteSelected,
  onClearSelection,
}) => {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-150 border border-neutral-800 dark:border-neutral-200">
      <div className="text-xs font-semibold pr-2 border-r border-neutral-700 dark:border-neutral-300">
        <span className="font-mono tabular-nums">{selectedCount}</span>개 선택됨
      </div>

      <button
        onClick={onCompleteSelected}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
        <span>완료</span>
      </button>

      <button
        onClick={onIncompleteSelected}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
      >
        <RotateCcw className="w-3.5 h-3.5 text-blue-400 dark:text-blue-600" />
        <span>미완료로</span>
      </button>

      <button
        onClick={onDeleteSelected}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-rose-900/60 dark:hover:bg-rose-100 text-rose-400 dark:text-rose-600 transition-colors"
      >
        <Trash2 className="w-3.5 h-3.5" />
        <span>삭제</span>
      </button>

      <button
        onClick={onClearSelection}
        className="p-1 rounded-md text-neutral-400 dark:text-neutral-600 hover:text-white dark:hover:text-neutral-900 transition-colors ml-1"
        title="선택 해제"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
