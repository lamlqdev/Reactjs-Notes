export interface Todo {
  id: number;
  text: string;
  isCompleted: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
}

export interface TodoState {
  todos: Todo[];
}

export interface RootState {
  auth: AuthState;
  todo: TodoState;
}

export type AuthAction = 
  | { type: 'LOGIN' }
  | { type: 'LOGOUT' };

export type TodoAction = 
  | { type: 'ADD_TODO'; payload: Todo }
  | { type: 'UPDATE_TODO'; payload: Todo }
  | { type: 'DELETE_TODO'; payload: number }
  | { type: 'TOGGLE_TODO'; payload: { id: number; isCompleted: boolean } };

export type AppAction = AuthAction | TodoAction;

