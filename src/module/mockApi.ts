import { Todo } from '../models/todo';
import { AxiosBaseQueryArgs } from './baseApi';

const STORAGE_KEY = 'RTK_QUERY_TODOS';

// 초기 데모 데이터
const INITIAL_TODOS: Todo[] = [
  { id: 1, description: 'RTK Query 기본 개념 학습하기', completed: true },
  { id: 2, description: 'LocalStorage 기반 Mock 모드로 CRUD 테스트하기', completed: false },
  { id: 3, description: 'Netlify 배포 후 정상 동작 확인하기', completed: false },
];

const getStoredTodos = (): Todo[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_TODOS));
      return INITIAL_TODOS;
    }
    return JSON.parse(raw) as Todo[];
  } catch (e) {
    console.error('LocalStorage 읽기 실패:', e);
    return INITIAL_TODOS;
  }
};

const saveTodos = (todos: Todo[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  } catch (e) {
    console.error('LocalStorage 저장 실패:', e);
  }
};

// 약간의 네트워크 지연 효과 (실제 API처럼 로딩 상태를 시각적으로 확인 가능)
const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

export const handleMockRequest = async (args: AxiosBaseQueryArgs): Promise<{ data: any }> => {
  await delay();

  const { url, method = 'get', data } = args;
  const methodUpper = method.toUpperCase();
  const todos = getStoredTodos();

  console.info(`[Mock API] ${methodUpper} ${url}`, data || '');

  // 1. 할 일 목록 조회: GET /todo/list
  if (url === '/todo/list' && methodUpper === 'GET') {
    return { data: { todoList: todos } };
  }

  // 2. 할 일 추가: POST /todo/add
  if (url === '/todo/add' && methodUpper === 'POST') {
    const newTodo: Todo = {
      id: Date.now(),
      description: data?.description || '새 할 일',
      completed: false,
    };
    const updated = [newTodo, ...todos];
    saveTodos(updated);
    return { data: newTodo };
  }

  // 3. 할 일 완료/토글: PATCH /todo/toggle/:id
  if (url.startsWith('/todo/toggle/') && methodUpper === 'PATCH') {
    const id = Number(url.replace('/todo/toggle/', ''));
    let targetTodo: Todo | undefined;
    const updated = todos.map((item) => {
      if (item.id === id) {
        targetTodo = {
          ...item,
          completed: data?.completed !== undefined ? Boolean(data.completed) : !item.completed,
        };
        return targetTodo;
      }
      return item;
    });

    if (!targetTodo) {
      throw { status: 404, message: `Todo ID ${id}를 찾을 수 없습니다.` };
    }

    saveTodos(updated);
    return { data: targetTodo };
  }

  // 4. 할 일 삭제: DELETE /todo/remove/:id
  if (url.startsWith('/todo/remove/') && methodUpper === 'DELETE') {
    const id = Number(url.replace('/todo/remove/', ''));
    const updated = todos.filter((item) => item.id !== id);
    saveTodos(updated);
    return { data: { success: true, id } };
  }

  throw { status: 404, message: `지원하지 않는 Mock API 경로입니다: ${methodUpper} ${url}` };
};
