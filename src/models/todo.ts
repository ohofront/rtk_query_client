export interface Todo {
  id: number;
  description: string;
  completed?: boolean;
}

// 하위 호환성을 위한 별칭
export type todo = Todo;

export type TodoInput = Omit<Todo, 'id'>;

export interface TodoListResponse {
  todoList: Todo[];
}
