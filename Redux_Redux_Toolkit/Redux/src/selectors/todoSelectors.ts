import { RootState, Todo } from "../types";

export const selectAllTodos = (state: RootState): Todo[] => state.todo.todos;

export const selectCompletedTodos = (state: RootState): Todo[] =>
  state.todo.todos.filter((todo) => todo.isCompleted);

export const selectActiveTodos = (state: RootState): Todo[] =>
  state.todo.todos.filter((todo) => !todo.isCompleted);

export const selectTodoCount = (state: RootState): number =>
  state.todo.todos.length;

export const selectCompletedTodoCount = (state: RootState): number =>
  state.todo.todos.filter((todo) => todo.isCompleted).length;

export const selectActiveTodoCount = (state: RootState): number =>
  state.todo.todos.filter((todo) => !todo.isCompleted).length;

export const selectTodoById = (
  state: RootState,
  id: number
): Todo | undefined => state.todo.todos.find((todo) => todo.id === id);
