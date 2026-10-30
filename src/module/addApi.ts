import { Todo, TodoListResponse } from '../models/todo';
import { baseApi } from './baseApi';

export const todoApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    // 할 일 목록 조회
    todoList: build.query<Todo[], void | object>({
      query: (params) => ({
        url: '/todo/list',
        method: 'get',
        params,
      }),
      transformResponse: (response: TodoListResponse | Todo[]): Todo[] => {
        if (Array.isArray(response)) {
          return response;
        }
        return response?.todoList ?? [];
      },
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'TODO' as const, id })),
              { type: 'TODO', id: 'LIST' },
            ]
          : [{ type: 'TODO', id: 'LIST' }],
    }),

    // 할 일 추가
    todoAdd: build.mutation<Todo, { description: string } | Partial<Todo>>({
      query: (data) => ({
        url: '/todo/add',
        method: 'post',
        data,
      }),
      invalidatesTags: [{ type: 'TODO', id: 'LIST' }],
    }),

    // 할 일 완료 여부 토글 / 수정
    todoToggle: build.mutation<Todo, { id: number; completed?: boolean }>({
      query: ({ id, completed }) => ({
        url: `/todo/toggle/${id}`,
        method: 'patch',
        data: { completed },
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'TODO', id },
        { type: 'TODO', id: 'LIST' },
      ],
    }),

    // 할 일 삭제
    todoRemove: build.mutation<{ success: boolean; id: number }, number | { id: number }>({
      query: (arg) => {
        const id = typeof arg === 'number' ? arg : arg.id;
        return {
          url: `/todo/remove/${id}`,
          method: 'delete',
          data: { id },
        };
      },
      invalidatesTags: (result, error, arg) => {
        const id = typeof arg === 'number' ? arg : arg.id;
        return [
          { type: 'TODO', id },
          { type: 'TODO', id: 'LIST' },
        ];
      },
    }),
  }),
  overrideExisting: false,
});

// 컴포넌트에서 편리하게 사용할 수 있도록 RTK Query 자동 생성 훅 export
export const {
  useTodoListQuery,
  useTodoAddMutation,
  useTodoToggleMutation,
  useTodoRemoveMutation,
  endpoints,
} = todoApi;
