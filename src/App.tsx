import React, { useState, useEffect, useMemo } from 'react';
import { 
  Menu, 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  LayoutList, 
  Kanban, 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Timer, 
  BarChart2, 
  Sparkles,
  Inbox
} from 'lucide-react';
import { Category, DisplayMode, FilterOptions, Priority, Todo, ViewType } from './types/todo';
import { 
  DEFAULT_CATEGORIES, 
  exportData, 
  getOffsetDateString, 
  getTodayDateString, 
  loadCategories, 
  loadTodos, 
  saveCategories, 
  saveTodos 
} from './utils/storage';
import { sounds } from './utils/sound';
import { Sidebar } from './components/Sidebar';
import { TaskItem } from './components/TaskItem';
import { QuickAddTask } from './components/QuickAddTask';
import { TaskDetailModal } from './components/TaskDetailModal';
import { BoardView } from './components/BoardView';
import { CalendarView } from './components/CalendarView';
import { PomodoroModal } from './components/PomodoroModal';
import { StatsModal } from './components/StatsModal';
import { CategoryModal } from './components/CategoryModal';
import { BatchActionBar } from './components/BatchActionBar';

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(() => loadTodos());
  const [categories, setCategories] = useState<Category[]>(() => loadCategories());
  const [currentView, setCurrentView] = useState<ViewType>('today');
  const [displayMode, setDisplayMode] = useState<DisplayMode>('list');
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  
  // Modals & Drawers
  const [isSidebarMobileOpen, setIsSidebarMobileOpen] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [isPomodoroOpen, setIsPomodoroOpen] = useState(false);
  const [pomodoroActiveTask, setPomodoroActiveTask] = useState<Todo | null>(null);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  // Sound & Dark mode settings
  const [soundEnabled, setSoundEnabled] = useState(() => sounds.isEnabled());
  const [isDark, setIsDark] = useState<boolean>(() => {
    return localStorage.getItem('taskflow_theme') === 'dark' || 
      (!localStorage.getItem('taskflow_theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'all'>('all');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'createdAt' | 'title'>('dueDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Sync Dark mode
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('taskflow_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('taskflow_theme', 'light');
    }
  }, [isDark]);

  // Persist todos & categories
  useEffect(() => {
    saveTodos(todos);
  }, [todos]);

  useEffect(() => {
    saveCategories(categories);
  }, [categories]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    sounds.setEnabled(next);
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  // Add Task Handler
  const handleAddTask = (newTaskData: Omit<Todo, 'id' | 'createdAt' | 'order'>) => {
    const newTask: Todo = {
      ...newTaskData,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
      order: todos.length + 1,
    };
    setTodos(prev => [newTask, ...prev]);
    sounds.playAdd();
  };

  // Toggle Task Completion
  const handleToggleComplete = (id: string) => {
    setTodos(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.completed;
        if (nextState) {
          sounds.playComplete();
        }
        return {
          ...t,
          completed: nextState,
          completedAt: nextState ? new Date().toISOString() : undefined,
        };
      }
      return t;
    }));
  };

  // Toggle Task Star
  const handleToggleStar = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, isStarred: !t.isStarred } : t));
  };

  // Delete Task
  const handleDeleteTask = (id: string) => {
    setTodos(prev => prev.filter(t => t.id !== id));
    setSelectedTaskIds(prev => prev.filter(selectedId => selectedId !== id));
    if (editingTodo?.id === id) {
      setEditingTodo(null);
    }
  };

  // Duplicate Task
  const handleDuplicateTask = (todo: Todo) => {
    const cloned: Todo = {
      ...todo,
      id: `task-${Date.now()}`,
      title: `${todo.title} (복사본)`,
      completed: false,
      completedAt: undefined,
      createdAt: new Date().toISOString(),
      order: todos.length + 1,
      subtasks: todo.subtasks?.map(s => ({ ...s, id: `sub-${Date.now()}-${Math.random()}`, completed: false })) || [],
    };
    setTodos(prev => [cloned, ...prev]);
    sounds.playAdd();
  };

  // Update Task
  const handleUpdateTask = (updated: Todo) => {
    setTodos(prev => prev.map(t => t.id === updated.id ? updated : t));
    setEditingTodo(updated);
  };

  // Start Focus Session on Task
  const handleStartFocus = (todo: Todo) => {
    setPomodoroActiveTask(todo);
    setIsPomodoroOpen(true);
  };

  // Batch Selection
  const handleToggleSelect = (id: string) => {
    setSelectedTaskIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const handleBatchComplete = () => {
    setTodos(prev => prev.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        return { ...t, completed: true, completedAt: new Date().toISOString() };
      }
      return t;
    }));
    sounds.playComplete();
    setSelectedTaskIds([]);
  };

  const handleBatchIncomplete = () => {
    setTodos(prev => prev.map(t => {
      if (selectedTaskIds.includes(t.id)) {
        return { ...t, completed: false, completedAt: undefined };
      }
      return t;
    }));
    setSelectedTaskIds([]);
  };

  const handleBatchDelete = () => {
    setTodos(prev => prev.filter(t => !selectedTaskIds.includes(t.id)));
    setSelectedTaskIds([]);
  };

  const handleClearSelection = () => {
    setSelectedTaskIds([]);
  };

  // Kanban moves
  const handleMoveToInProgress = (id: string) => {
    const today = getTodayDateString();
    setTodos(prev => prev.map(t => t.id === id ? { ...t, dueDate: today, completed: false } : t));
  };

  const handleMoveToTodo = (id: string) => {
    setTodos(prev => prev.map(t => t.id === id ? { ...t, dueDate: getOffsetDateString(2), completed: false } : t));
  };

  // Category handlers
  const handleAddCategory = (newCat: Category) => {
    setCategories(prev => [...prev, newCat]);
    setIsCategoryModalOpen(false);
  };

  const handleDeleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
    // Reassign affected tasks to first remaining category
    const fallbackId = categories.find(c => c.id !== catId)?.id || 'work';
    setTodos(prev => prev.map(t => t.categoryId === catId ? { ...t, categoryId: fallbackId } : t));
    if (currentView === catId) {
      setCurrentView('all');
    }
  };

  // Export / Import
  const handleExport = () => {
    exportData(todos, categories);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.todos && Array.isArray(parsed.todos)) {
          setTodos(parsed.todos);
        }
        if (parsed.categories && Array.isArray(parsed.categories)) {
          setCategories(parsed.categories);
        }
        alert('데이터를 성공적으로 복원했습니다.');
      } catch (err) {
        alert('올바른 백업 JSON 파일 형식이 아닙니다.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered Todos Computation
  const todayStr = getTodayDateString();

  const filteredTodos = useMemo(() => {
    return todos.filter(t => {
      // 1. View Filter
      if (currentView === 'today') {
        // Today view includes overdue items as well for urgency
        if (t.completed) return false;
        if (!t.dueDate) return false;
        if (t.dueDate > todayStr) return false;
      } else if (currentView === 'upcoming') {
        if (t.completed) return false;
        if (!t.dueDate || t.dueDate <= todayStr) return false;
      } else if (currentView === 'starred') {
        if (t.completed) return false;
        if (!t.isStarred) return false;
      } else if (currentView === 'all') {
        if (t.completed) return false;
      } else if (currentView === 'completed') {
        if (!t.completed) return false;
      } else {
        // Specific category view
        if (t.completed) return false;
        if (t.categoryId !== currentView) return false;
      }

      // 2. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q) ?? false;
        const matchTag = t.tags?.some(tag => tag.toLowerCase().includes(q)) ?? false;
        if (!matchTitle && !matchDesc && !matchTag) return false;
      }

      // 3. Priority Filter
      if (filterPriority !== 'all') {
        if (t.priority !== filterPriority) return false;
      }

      return true;
    }).sort((a, b) => {
      // Sorting
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return sortOrder === 'asc' 
          ? a.dueDate.localeCompare(b.dueDate) 
          : b.dueDate.localeCompare(a.dueDate);
      }
      if (sortBy === 'priority') {
        const order: Record<Priority, number> = { urgent: 4, high: 3, medium: 2, low: 1 };
        return sortOrder === 'asc' 
          ? order[b.priority] - order[a.priority] 
          : order[a.priority] - order[b.priority];
      }
      if (sortBy === 'createdAt') {
        return sortOrder === 'asc'
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      if (sortBy === 'title') {
        return sortOrder === 'asc'
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      }
      return 0;
    });
  }, [todos, currentView, searchQuery, filterPriority, sortBy, sortOrder, todayStr]);

  // Current view title & description
  const viewInfo = useMemo(() => {
    switch (currentView) {
      case 'today':
        return { title: '오늘 할 일', desc: '오늘 마감되거나 주의가 필요한 작업 목록' };
      case 'upcoming':
        return { title: '예정된 작업', desc: '앞으로 예정된 마감일별 할 일' };
      case 'starred':
        return { title: '중요 할 일', desc: '별표 표시된 핵심 우선순위 작업' };
      case 'all':
        return { title: '모든 할 일', desc: '전체 진행 중인 프로젝트 및 업무 목록' };
      case 'completed':
        return { title: '완료됨', desc: '성공적으로 완료한 작업 아카이브' };
      default: {
        const cat = categories.find(c => c.id === currentView);
        return { 
          title: cat ? `${cat.name} 프로젝트` : '프로젝트', 
          desc: `${cat?.name || ''} 카테고리에 속한 작업 모음` 
        };
      }
    }
  }, [currentView, categories]);

  return (
    <div className="flex h-screen w-full bg-neutral-50 dark:bg-neutral-950 overflow-hidden font-sans">
      {/* Sidebar Component */}
      <Sidebar
        currentView={currentView}
        onSelectView={setCurrentView}
        todos={todos}
        categories={categories}
        onOpenNewCategory={() => setIsCategoryModalOpen(true)}
        onOpenPomodoro={() => {
          setPomodoroActiveTask(null);
          setIsPomodoroOpen(true);
        }}
        onOpenStats={() => setIsStatsOpen(true)}
        onExport={handleExport}
        onImport={handleImport}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isOpenMobile={isSidebarMobileOpen}
        onCloseMobile={() => setIsSidebarMobileOpen(false)}
        soundEnabled={soundEnabled}
        onToggleSound={toggleSound}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
        {/* Top Bar Contract: 1-line Brand/Breadcrumb — Clean View Controls — 1 Primary Action */}
        <header className="h-16 px-6 bg-white dark:bg-neutral-900 border-b border-neutral-200 dark:border-neutral-800 flex items-center justify-between gap-8 shrink-0">
          {/* Zone 1: Mobile Hamburger + Breadcrumb Brand Wordmark */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setIsSidebarMobileOpen(true)}
              className="lg:hidden p-1.5 text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white rounded-md"
              aria-label="메뉴 열기"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 truncate">
              <span className="text-base font-bold tracking-tight text-neutral-900 dark:text-white whitespace-nowrap shrink-0">
                Taskflow
              </span>
              <span className="text-neutral-300 dark:text-neutral-700 font-light">/</span>
              <span className="text-sm font-semibold text-neutral-600 dark:text-neutral-400 truncate">
                {viewInfo.title}
              </span>
            </div>
          </div>

          {/* Zone 2: View Controls (Segmented View Mode Buttons) */}
          <div className="hidden sm:flex items-center gap-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-lg shrink-0">
            <button
              onClick={() => setDisplayMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                displayMode === 'list'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <LayoutList className="w-3.5 h-3.5" />
              <span>목록</span>
            </button>
            <button
              onClick={() => setDisplayMode('board')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                displayMode === 'board'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>보드</span>
            </button>
            <button
              onClick={() => setDisplayMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                displayMode === 'calendar'
                  ? 'bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white shadow-xs font-semibold'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              <span>달력</span>
            </button>
          </div>

          {/* Zone 3: Quick Action Launchers & Primary CTA */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setPomodoroActiveTask(null);
                setIsPomodoroOpen(true);
              }}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-rose-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="뽀모도로 집중 타이머"
            >
              <Timer className="w-4 h-4" />
            </button>

            <button
              onClick={() => setIsStatsOpen(true)}
              className="p-2 text-neutral-600 dark:text-neutral-400 hover:text-emerald-500 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
              title="생산성 통계"
            >
              <BarChart2 className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const titleInput = document.querySelector('input[placeholder*="새 할 일을 입력"]') as HTMLInputElement;
                if (titleInput) {
                  titleInput.focus();
                }
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-neutral-900 dark:bg-white dark:text-neutral-900 rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-100 transition-all whitespace-nowrap shrink-0 shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>할 일 추가</span>
            </button>
          </div>
        </header>

        {/* Workspace Scrollable Body */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-8 py-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* View Title & Description Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-neutral-200/80 dark:border-neutral-800/80">
              <div>
                <h1 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {viewInfo.title}
                </h1>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">
                  {viewInfo.desc}
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>총 <strong className="font-mono tabular-nums text-neutral-900 dark:text-white">{filteredTodos.length}</strong>개 작업</span>
              </div>
            </div>

            {/* Quick Add Input Bar */}
            {currentView !== 'completed' && (
              <QuickAddTask
                categories={categories}
                currentView={currentView}
                onAddTask={handleAddTask}
              />
            )}

            {/* Search & Filter Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-neutral-900 p-2.5 rounded-xl border border-neutral-200 dark:border-neutral-800 shadow-2xs">
              {/* Search input */}
              <div className="flex-1 min-w-[200px] flex items-center gap-2 px-2.5 py-1 bg-neutral-50 dark:bg-neutral-800/50 rounded-lg border border-neutral-200 dark:border-neutral-800 text-xs">
                <Search className="w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="작업 제목, 메모, #태그 검색..."
                  className="w-full bg-transparent text-neutral-900 dark:text-white placeholder:text-neutral-400 focus:outline-none"
                />
              </div>

              {/* Filters & Sorting */}
              <div className="flex items-center gap-2 text-xs">
                {/* Priority filter */}
                <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <SlidersHorizontal className="w-3 h-3 text-neutral-400" />
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value as Priority | 'all')}
                    className="bg-transparent text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="dark:bg-neutral-900">전체 우선순위</option>
                    <option value="urgent" className="dark:bg-neutral-900">긴급만</option>
                    <option value="high" className="dark:bg-neutral-900">높음만</option>
                    <option value="medium" className="dark:bg-neutral-900">보통만</option>
                    <option value="low" className="dark:bg-neutral-900">낮음만</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1 bg-neutral-50 dark:bg-neutral-800/50 px-2 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800">
                  <ArrowUpDown className="w-3 h-3 text-neutral-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-neutral-700 dark:text-neutral-300 focus:outline-none cursor-pointer"
                  >
                    <option value="dueDate" className="dark:bg-neutral-900">마감일순</option>
                    <option value="priority" className="dark:bg-neutral-900">우선순위순</option>
                    <option value="createdAt" className="dark:bg-neutral-900">최신 등록순</option>
                    <option value="title" className="dark:bg-neutral-900">이름순</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                    className="text-[10px] text-neutral-500 hover:text-neutral-900 dark:hover:text-white px-1"
                    title={sortOrder === 'asc' ? '오름차순' : '내림차순'}
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>
            </div>

            {/* View Mode Switching */}
            {displayMode === 'list' && (
              <div className="space-y-2">
                {filteredTodos.map(todo => {
                  const category = categories.find(c => c.id === todo.categoryId);
                  const isSelected = selectedTaskIds.includes(todo.id);

                  return (
                    <TaskItem
                      key={todo.id}
                      todo={todo}
                      category={category}
                      isSelected={isSelected}
                      onToggleSelect={handleToggleSelect}
                      onToggleComplete={handleToggleComplete}
                      onToggleStar={handleToggleStar}
                      onOpenDetail={setEditingTodo}
                      onDelete={handleDeleteTask}
                      onDuplicate={handleDuplicateTask}
                      onStartFocus={handleStartFocus}
                    />
                  );
                })}

                {/* Empty State */}
                {filteredTodos.length === 0 && (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 bg-white/50 dark:bg-neutral-900/40 p-8">
                    <div className="w-12 h-12 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center mx-auto text-neutral-400 mb-3">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
                      {searchQuery ? '일치하는 작업이 없습니다' : '현재 표시할 할 일이 없습니다'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                      {searchQuery 
                        ? '다른 검색어나 필터 조건을 사용해보세요.' 
                        : currentView === 'completed'
                          ? '완료된 작업이 아직 없습니다. 작업을 마무리하면 이곳에 보관됩니다.'
                          : '새로운 할 일을 추가하고 오늘 하루의 생산성을 시작해보세요.'}
                    </p>
                  </div>
                )}
              </div>
            )}

            {displayMode === 'board' && (
              <BoardView
                todos={todos}
                categories={categories}
                onToggleComplete={handleToggleComplete}
                onToggleStar={handleToggleStar}
                onOpenDetail={setEditingTodo}
                onMoveToInProgress={handleMoveToInProgress}
                onMoveToTodo={handleMoveToTodo}
                onOpenAddTask={() => {
                  const input = document.querySelector('input[placeholder*="새 할 일을 입력"]') as HTMLInputElement;
                  if (input) input.focus();
                }}
              />
            )}

            {displayMode === 'calendar' && (
              <CalendarView
                todos={todos}
                categories={categories}
                onOpenDetail={setEditingTodo}
                onToggleComplete={handleToggleComplete}
              />
            )}
          </div>
        </main>
      </div>

      {/* Floating Batch Action Bar */}
      <BatchActionBar
        selectedCount={selectedTaskIds.length}
        onCompleteSelected={handleBatchComplete}
        onIncompleteSelected={handleBatchIncomplete}
        onDeleteSelected={handleBatchDelete}
        onClearSelection={handleClearSelection}
      />

      {/* Task Detail Modal / Drawer */}
      <TaskDetailModal
        todo={editingTodo}
        categories={categories}
        isOpen={!!editingTodo}
        onClose={() => setEditingTodo(null)}
        onUpdate={handleUpdateTask}
        onDelete={handleDeleteTask}
        onStartFocus={handleStartFocus}
      />

      {/* Pomodoro Focus Timer Modal */}
      <PomodoroModal
        isOpen={isPomodoroOpen}
        onClose={() => setIsPomodoroOpen(false)}
        activeTask={pomodoroActiveTask}
        onCompleteTask={handleToggleComplete}
      />

      {/* Stats Modal */}
      <StatsModal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        todos={todos}
        categories={categories}
      />

      {/* Category Manager Modal */}
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        categories={categories}
        onAddCategory={handleAddCategory}
        onDeleteCategory={handleDeleteCategory}
      />
    </div>
  );
}
