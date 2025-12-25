import { useState } from "react";
import classes from "./Todo.module.css";
import { useAppSelector, useAppDispatch } from "../hooks/redux";
import {
  selectAllTodos,
  selectCompletedTodoCount,
  selectActiveTodoCount,
} from "../selectors";
import { addTodo, deleteTodo, toggleTodo, updateTodo } from "../actions/todo";

const Todo = () => {
  const todos = useAppSelector(selectAllTodos);
  const completedCount = useAppSelector(selectCompletedTodoCount);
  const activeCount = useAppSelector(selectActiveTodoCount);

  const dispatch = useAppDispatch();

  const [inputText, setInputText] = useState<string>("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  const addTodoHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (inputText.trim() === "") return;
    dispatch(addTodo(inputText));
    setInputText("");
  };

  const deleteTodoHandler = (id: number) => {
    dispatch(deleteTodo(id));
  };

  const toggleTodoHandler = (id: number, isCompleted: boolean) => {
    dispatch(toggleTodo(id, isCompleted));
  };

  const startEditHandler = (id: number, text: string) => {
    setEditingId(id);
    setEditText(text);
  };

  const cancelEditHandler = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEditHandler = (id: number) => {
    if (editText.trim() === "") {
      cancelEditHandler();
      return;
    }
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      dispatch(updateTodo(id, editText, todo.isCompleted));
    }
    setEditingId(null);
    setEditText("");
  };

  return (
    <main className={classes.todo}>
      <h1>Redux Todo List</h1>

      <form onSubmit={addTodoHandler} className={classes.form}>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Nhập công việc mới..."
          className={classes.input}
        />
        <button type="submit" className={classes.addButton}>
          Thêm Todo
        </button>
      </form>

      <div className={classes.todoList}>
        {todos.length === 0 ? (
          <p className={classes.emptyMessage}>
            Chưa có todo nào. Hãy thêm todo mới!
          </p>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className={`${classes.todoItem} ${
                todo.isCompleted ? classes.completed : ""
              }`}
            >
              {editingId === todo.id ? (
                <div className={classes.editForm}>
                  <input
                    type="text"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className={classes.editInput}
                    autoFocus
                  />
                  <div className={classes.editActions}>
                    <button
                      onClick={() => saveEditHandler(todo.id)}
                      className={classes.saveButton}
                    >
                      Lưu
                    </button>
                    <button
                      onClick={cancelEditHandler}
                      className={classes.cancelButton}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className={classes.todoContent}>
                    <input
                      type="checkbox"
                      checked={todo.isCompleted}
                      onChange={() =>
                        toggleTodoHandler(todo.id, todo.isCompleted)
                      }
                      className={classes.checkbox}
                    />
                    <span className={classes.todoText}>{todo.text}</span>
                  </div>
                  <div className={classes.todoActions}>
                    <button
                      onClick={() => startEditHandler(todo.id, todo.text)}
                      className={classes.editButton}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => deleteTodoHandler(todo.id)}
                      className={classes.deleteButton}
                    >
                      Xóa
                    </button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>

      {todos.length > 0 && (
        <div className={classes.stats}>
          <p>
            Tổng số: {todos.length} | Hoàn thành: {completedCount} | Chưa hoàn
            thành: {activeCount}
          </p>
        </div>
      )}
    </main>
  );
};

export default Todo;

