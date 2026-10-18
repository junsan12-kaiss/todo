import React from 'react';
import { 
  Calendar, 
  CalendarDays, 
  Star, 
  Inbox, 
  CheckCircle2, 
  Plus, 
  Folder, 
  Flame, 
  Timer, 
  BarChart2, 
  Download, 
  Upload, 
  Volume2, 
  VolumeX,
  Moon,
  Sun,
  X
} from 'lucide-react';
import { Category, Todo, ViewType } from '../types/todo';
import { getTodayDateString } from '../utils/storage';
import { sounds } from '../utils/sound';

interface SidebarProps {
  currentView: ViewType;
  onSelectView: (view: ViewType) => void;
  todos: Todo[];
  categories: Category[];
  onOpenNewCategory: () => void;
  onOpenPomodoro: () => void;
  onOpenStats: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  todos,
  categories,
  onOpenNewCategory,
  onOpenPomodoro,
  onOpenStats,
  onExport,
  onImport,
  isDark,
  onToggleTheme,
  isOpenMobile,
  onCloseMobile,
  soundEnabled,
  onToggleSound,
}) => {
  const today = getTodayDateString();

  // Counts
  const todayCount = todos.filter(t => !t.completed && (t.dueDate === today || (t.dueDate && t.dueDate < today))).length;
  const upcomingCount = todos.filter(t => !t.completed && t.dueDate && t.dueDate > today).length;
  const starredCount = todos.filter(t => !t.completed && t.isStarred).length;
  const allActiveCount = todos.filter(t => !t.completed).length;
  const completedCount = todos.filter(t => t.completed).length;

  // Today's completion rate
  const todayAllTasks = todos.filter(t => t.dueDate === today);
  const todayCompletedTasks = todayAllTasks.filter(t => t.completed);
  const todayProgressRate = todayAllTasks.length > 0 
    ? Math.round((todayCompletedTasks.length / todayAllTasks.length) * 100) 
    : 0;

  const navItems = [
    { id: 'today', label: '오늘 할 일', icon: Calendar, count: todayCount, colorClass: 'text-amber-500' },
    { id: 'upcoming', label: '예정된 작업', icon: CalendarDays, count: upcomingCount, colorClass: 'text-blue-500' },
    { id: 'starred', label: '중요 할 일', icon: Star, count: starredCount, colorClass: 'text-yellow-500' },
    { id: 'all', label: '모든 할 일', icon: Inbox, count: allActiveCount, colorClass: 'text-neutral-500' },
    { id: 'completed', label: '완료됨', icon: CheckCircle2, count: completedCount, colorClass: 'text-emerald-500' },
  ];

  const handleNavClick = (id: string) => {
    onSelectView(id);
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpenMobile && (
        <div 
          className="fixed inset-0 bg-neutral-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside className={`
        fixed top-0 bottom-0 left-0 z-40 w-72 bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800
        flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0
        ${isOpenMobile ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-neutral-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900 flex items-center justify-center font-bold text-base shadow-xs">
              ✓
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-neutral-900 dark:text-white block leading-tight">
                Taskflow
              </span>
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                스마트 생산성 워크스페이스
              </span>
            </div>
          </div>
          <button 
            onClick={onCloseMobile}
            className="lg:hidden p-1.5 text-neutral-500 hover:text-neutral-900 dark:hover:text-white rounded-md"
            aria-label="사이드바 닫기"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Main Views */}
          <div className="space-y-1">
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              보기 필터
            </div>
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors
                    ${isActive 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${item.colorClass}`} />
                    <span>{item.label}</span>
                  </div>
                  <span className={`text-[11px] font-mono tabular-nums ${isActive ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400'}`}>
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Categories / Projects */}
          <div className="space-y-1">
            <div className="flex items-center justify-between px-3 pb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
                프로젝트 카테고리
              </span>
              <button
                onClick={onOpenNewCategory}
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-0.5 rounded transition-colors"
                title="새 카테고리 추가"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
            {categories.map(cat => {
              const isActive = currentView === cat.id;
              const count = todos.filter(t => !t.completed && t.categoryId === cat.id).length;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleNavClick(cat.id)}
                  className={`
                    w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors
                    ${isActive 
                      ? 'bg-neutral-100 dark:bg-neutral-800 text-neutral-950 dark:text-white font-semibold' 
                      : 'text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white'}
                  `}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </div>
                  <span className={`text-[11px] font-mono tabular-nums ${isActive ? 'text-neutral-900 dark:text-white font-medium' : 'text-neutral-600 dark:text-neutral-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Quick Tools */}
          <div className="space-y-1 pt-2 border-t border-neutral-100 dark:border-neutral-800/80">
            <div className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">
              생산성 도구
            </div>
            <button
              onClick={() => { onOpenPomodoro(); onCloseMobile(); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <Timer className="w-4 h-4 text-rose-500" />
                <span>뽀모도로 집중 타이머</span>
              </div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400">25m</span>
            </button>
            <button
              onClick={() => { onOpenStats(); onCloseMobile(); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800/60 hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
                <span>생산성 통계 및 분석</span>
              </div>
              <span className="text-[11px] text-neutral-600 dark:text-neutral-400">요약</span>
            </button>
          </div>

          {/* Today's Progress Card */}
          <div className="p-3.5 rounded-xl bg-neutral-50 dark:bg-neutral-800/50 border border-neutral-200 dark:border-neutral-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-neutral-700 dark:text-neutral-300 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-amber-500" />
                오늘의 달성률
              </span>
              <span className="text-xs font-mono tabular-nums font-semibold text-neutral-900 dark:text-white">
                {todayProgressRate}%
              </span>
            </div>
            <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${todayProgressRate}%` }}
              />
            </div>
            <div className="mt-2 text-[11px] text-neutral-600 dark:text-neutral-400 flex justify-between">
              <span>완료 {todayCompletedTasks.length}개</span>
              <span>총 {todayAllTasks.length}개</span>
            </div>
          </div>
        </div>

        {/* Bottom Utility Bar */}
        <div className="p-3 border-t border-neutral-200 dark:border-neutral-800 shrink-0 flex items-center justify-between text-neutral-500">
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleTheme}
              className="p-1.5 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={isDark ? '라이트 모드로 전환' : '다크 모드로 전환'}
            >
              {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleSound}
              className="p-1.5 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title={soundEnabled ? '효과음 끄기' : '효과음 켜기'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onExport}
              className="p-1.5 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="데이터 백업 다운로드 (JSON)"
            >
              <Download className="w-4 h-4" />
            </button>
            <label 
              className="p-1.5 hover:text-neutral-900 dark:hover:text-white rounded-md hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
              title="데이터 복원 불러오기 (JSON)"
            >
              <Upload className="w-4 h-4" />
              <input type="file" accept=".json" onChange={onImport} className="hidden" />
            </label>
          </div>
        </div>
      </aside>
    </>
  );
};
