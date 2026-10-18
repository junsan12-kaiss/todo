export type Priority = 'urgent' | 'high' | 'medium' | 'low';

export interface SubTask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  completedAt?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:mm
  priority: Priority;
  categoryId: string;
  tags: string[];
  isStarred: boolean;
  subtasks: SubTask[];
  createdAt: string;
  order: number;
  focusMinutes?: number;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  icon?: string;
}

export type ViewType = 'today' | 'upcoming' | 'starred' | 'all' | 'completed' | string;
export type DisplayMode = 'list' | 'board' | 'calendar';

export interface FilterOptions {
  search: string;
  priority: Priority | 'all';
  tag: string | 'all';
  sortBy: 'dueDate' | 'priority' | 'createdAt' | 'title';
  sortOrder: 'asc' | 'desc';
}
