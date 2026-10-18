import { Category, Todo } from '../types/todo';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'work', name: '업무', color: '#3B82F6' },
  { id: 'personal', name: '개인', color: '#10B981' },
  { id: 'study', name: '학습', color: '#8B5CF6' },
  { id: 'health', name: '건강 & 운동', color: '#F59E0B' },
  { id: 'finance', name: '재정 & 생활', color: '#EC4899' },
];

export const getTodayDateString = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getOffsetDateString = (offsetDays: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getInitialTodos = (): Todo[] => {
  const today = getTodayDateString();
  const tomorrow = getOffsetDateString(1);
  const in3Days = getOffsetDateString(3);
  const yesterday = getOffsetDateString(-1);

  return [
    {
      id: 'task-1',
      title: '주간 업무 보고서 작성 및 프로젝트 로드맵 검토',
      description: '주요 마일스톤 달성 현황 및 차주 배포 일정 정리하여 팀 공유',
      completed: false,
      dueDate: today,
      dueTime: '15:00',
      priority: 'urgent',
      categoryId: 'work',
      tags: ['업무', '보고서', '로드맵'],
      isStarred: true,
      subtasks: [
        { id: 'sub-1', title: 'Q3 스프린트 결과 정리', completed: true },
        { id: 'sub-2', title: '버그 리포트 우선순위 업데이트', completed: false },
        { id: 'sub-3', title: '슬랙 공유 및 피드백 취합', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
      order: 1,
      focusMinutes: 25,
    },
    {
      id: 'task-2',
      title: '저녁 조깅 5km 및 스트레칭 20분',
      description: '가벼운 유산소 러닝 및 폼롤러 스트레칭 루틴 완료하기',
      completed: false,
      dueDate: today,
      dueTime: '19:30',
      priority: 'medium',
      categoryId: 'health',
      tags: ['러닝', '체력관리'],
      isStarred: false,
      subtasks: [
        { id: 'sub-4', title: '러닝화 준비 및 수분 섭취', completed: true },
        { id: 'sub-5', title: '5km 달리기', completed: false },
        { id: 'sub-6', title: '쿨다운 스트레칭', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
      order: 2,
    },
    {
      id: 'task-3',
      title: 'TypeScript 고급 타입 패턴 스터디 3장 읽기',
      description: '조건부 타입 (Conditional Types) 및 템플릿 리터럴 타입 예제 실습',
      completed: false,
      dueDate: tomorrow,
      dueTime: '21:00',
      priority: 'high',
      categoryId: 'study',
      tags: ['개발', 'TypeScript', '스터디'],
      isStarred: true,
      subtasks: [
        { id: 'sub-7', title: '공식 문서 튜토리얼 확인', completed: true },
        { id: 'sub-8', title: '핸즈온 코드 작성', completed: false },
      ],
      createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
      order: 3,
    },
    {
      id: 'task-4',
      title: '월간 가계부 결산 및 정기 구독 서비스 점검',
      description: '미사용 OTT 및 서비스 구독 해지, 비상금 통장 입금',
      completed: false,
      dueDate: in3Days,
      dueTime: '18:00',
      priority: 'low',
      categoryId: 'finance',
      tags: ['가계부', '절약'],
      isStarred: false,
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      order: 4,
    },
    {
      id: 'task-5',
      title: '아침 영양제 챙겨 먹기 & 미온수 500ml 마시기',
      description: '비타민 D, 오메가3, 유산균 복용',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
      dueDate: today,
      priority: 'medium',
      categoryId: 'health',
      tags: ['루틴', '건강'],
      isStarred: false,
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      order: 5,
    },
    {
      id: 'task-6',
      title: '집 청소 및 분리수거',
      description: '재활용 분리수거함 배출 및 로봇청소기 먼지통 비우기',
      completed: true,
      completedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
      dueDate: yesterday,
      priority: 'low',
      categoryId: 'personal',
      tags: ['청소', '일상'],
      isStarred: false,
      subtasks: [],
      createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
      order: 6,
    },
  ];
};

const STORAGE_KEY_TODOS = 'taskflow_todos_v1';
const STORAGE_KEY_CATEGORIES = 'taskflow_categories_v1';

export const loadTodos = (): Todo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_TODOS);
    if (!raw) return getInitialTodos();
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : getInitialTodos();
  } catch {
    return getInitialTodos();
  }
};

export const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_TODOS, JSON.stringify(todos));
  } catch (err) {
    console.error('Failed to save todos:', err);
  }
};

export const loadCategories = (): Category[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) return DEFAULT_CATEGORIES;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_CATEGORIES;
  } catch {
    return DEFAULT_CATEGORIES;
  }
};

export const saveCategories = (categories: Category[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
  } catch (err) {
    console.error('Failed to save categories:', err);
  }
};

export const exportData = (todos: Todo[], categories: Category[]): void => {
  const data = {
    exportedAt: new Date().toISOString(),
    version: '1.0',
    todos,
    categories,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `taskflow-backup-${getTodayDateString()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
