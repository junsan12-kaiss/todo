import React from 'react';
import { X, CheckCircle2, Flame, Award, Clock, Calendar } from 'lucide-react';
import { Category, Priority, Todo } from '../types/todo';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  todos: Todo[];
  categories: Category[];
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  todos,
  categories,
}) => {
  if (!isOpen) return null;

  const total = todos.length;
  const completed = todos.filter(t => t.completed).length;
  const active = total - completed;
  const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Priority breakdown
  const priorities: Priority[] = ['urgent', 'high', 'medium', 'low'];
  const priorityLabels: Record<Priority, string> = {
    urgent: '긴급',
    high: '높음',
    medium: '보통',
    low: '낮음',
  };

  // Last 7 days activity
  const now = new Date();
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(now.getDate() - (6 - i));
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const dateStr = `${year}-${month}-${day}`;
    const dayName = ['일', '월', '화', '수', '목', '금', '토'][d.getDay()];

    const count = todos.filter(t => {
      if (!t.completed || !t.completedAt) return false;
      return t.completedAt.startsWith(dateStr);
    }).length;

    return { dateStr, dayName, count };
  });

  const maxDailyCount = Math.max(...last7Days.map(d => d.count), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="fixed inset-0 bg-neutral-900/60 dark:bg-black/80 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl border border-neutral-200 dark:border-neutral-800 p-6 z-10 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-100 dark:border-neutral-800">
          <div>
            <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" />
              생산성 통계 및 분석
            </h3>
            <p className="text-xs text-neutral-500 mt-0.5">
              나의 작업 완수 패턴과 카테고리별 진행 상황
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-3 my-5">
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-500 block">전체 할 일</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white mt-1 block">
              {total}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">진행 중 {active}개</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-500 block">완료된 할 일</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400 mt-1 block">
              {completed}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">성공적으로 마무리</span>
          </div>

          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-800">
            <span className="text-[11px] font-medium text-neutral-500 block">전체 완수율</span>
            <span className="text-2xl font-bold font-mono tabular-nums text-neutral-900 dark:text-white mt-1 block">
              {completionRate}%
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block">목표 달성 지수</span>
          </div>
        </div>

        {/* 7-Day Completion Histogram */}
        <div className="mb-6 p-4 rounded-xl border border-neutral-200 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-800/30">
          <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-3 flex items-center justify-between">
            <span>최근 7일간 완료한 작업 추이</span>
            <span className="text-[11px] text-neutral-400 font-mono tabular-nums">
              총 {last7Days.reduce((a, b) => a + b.count, 0)}건 완료
            </span>
          </h4>

          <div className="flex items-end justify-between h-28 pt-4 px-2">
            {last7Days.map(item => {
              const heightPercent = item.count > 0 ? Math.round((item.count / maxDailyCount) * 100) : 8;
              return (
                <div key={item.dateStr} className="flex flex-col items-center gap-1.5 flex-1">
                  <span className="text-[10px] font-mono tabular-nums text-neutral-500">
                    {item.count > 0 ? item.count : ''}
                  </span>
                  <div className="w-6 bg-neutral-200 dark:bg-neutral-700 rounded-t-sm flex items-end justify-center overflow-hidden h-20">
                    <div 
                      className="w-full bg-neutral-900 dark:bg-neutral-100 rounded-t-sm transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-neutral-500">
                    {item.dayName}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="mb-6 space-y-3">
          <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200">
            프로젝트 & 카테고리별 진행 상황
          </h4>

          <div className="space-y-2">
            {categories.map(cat => {
              const catTasks = todos.filter(t => t.categoryId === cat.id);
              const catCompleted = catTasks.filter(t => t.completed).length;
              const rate = catTasks.length > 0 ? Math.round((catCompleted / catTasks.length) * 100) : 0;

              return (
                <div key={cat.id} className="p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="flex items-center gap-1.5 font-medium text-neutral-800 dark:text-neutral-200">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                      {cat.name}
                    </span>
                    <span className="text-neutral-500 font-mono tabular-nums text-[11px]">
                      {catCompleted}/{catTasks.length} ({rate}%)
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{ 
                        width: `${rate}%`, 
                        backgroundColor: cat.color 
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Distribution */}
        <div>
          <h4 className="text-xs font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
            우선순위 분포
          </h4>
          <div className="grid grid-cols-4 gap-2">
            {priorities.map(p => {
              const pTasks = todos.filter(t => t.priority === p);
              const pComp = pTasks.filter(t => t.completed).length;
              return (
                <div key={p} className="p-2 rounded-lg bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800 text-center">
                  <span className="text-[11px] font-medium text-neutral-500 block">
                    {priorityLabels[p]}
                  </span>
                  <span className="text-sm font-bold font-mono tabular-nums text-neutral-900 dark:text-white mt-0.5 block">
                    {pTasks.length}건
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono tabular-nums block">
                    {pComp}건 완료
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
