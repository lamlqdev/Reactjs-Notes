import {
  ADD_TODO,
  UPDATE_TODO,
  DELETE_TODO,
  TOGGLE_TODO,
} from "../constants/todo";
import { TodoAction } from "../types";

export const addTodo = (text: string): TodoAction => {
  return {
    type: ADD_TODO,
    payload: { id: Date.now(), text, isCompleted: false, },
  };
};

export const updateTodo = (
  id: number,
  text: string,
  isCompleted: boolean
): TodoAction => {
  return {
    type: UPDATE_TODO,
    payload: { id, text, isCompleted },
  };
};

export const deleteTodo = (id: number): TodoAction => {
  return { type: DELETE_TODO, payload: id };
};

export const toggleTodo = (id: number, isCompleted: boolean): TodoAction => {
  return { type: TOGGLE_TODO, payload: { id, isCompleted: !isCompleted } };
};

