import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import {
  fetchTodos,
  addTodoAsync,
  updateTodoAsync,
  deleteTodoAsync,
  setFilter,
  clearTodos,
} from "../features/todos/todosSlice";

const TodoApp = () => {
  const dispatch = useDispatch();
  const { items, filter } = useSelector((state) => state.todos);

  const [text, setText] = useState("");
  const [tag, setTag] = useState("work");
  const [dueDate, setDueDate] = useState("");
  const [dark, setDark] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  useEffect(() => {
    Notification.requestPermission();
  }, []);

  setInterval(() => {
    items.forEach((todo) => {
      if (new Date(todo.due_date) < new Date()) {
        new Notification("Task overdue!", { body: todo.text });
      }
    });
  }, 60000);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    dispatch(clearTodos());
  };

  const handleAdd = () => {
    if (!text.trim()) return;

    dispatch(
      addTodoAsync({
        text,
        completed: false,
        tag,
        due_date: dueDate || null,
      }),
    );

    setText("");
    setDueDate("");
  };

  const filteredTodos = items.filter((todo) => {
    if (filter === "active") return !todo.completed;
    if (filter === "completed") return todo.completed;
    return true;
  });

  const isOverdue = (todo) =>
    todo.due_date && new Date(todo.due_date) < new Date() && !todo.completed;

  const handleEditSave = (id) => {
    if (editText.trim()) {
      dispatch(
        updateTodoAsync({
          id,
          updates: { text: editText },
        }),
      );
    }
    setEditingId(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 transition-colors duration-300">
      <div className="w-full max-w-md p-6 rounded-2xl shadow-xl bg-white dark:bg-gray-800">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-white">
            ✨ Todo App
          </h1>

          <div className="flex gap-2">
            <button onClick={() => setDark(!dark)}>{dark ? "☀️" : "🌙"}</button>
            <button onClick={handleLogout}>🚪</button>
          </div>
        </div>

        {/* Input */}
        <div className="flex flex-col gap-2 mb-4">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="What needs to be done?"
            className="px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          />

          <div className="flex gap-2">
            <select
              onChange={(e) => setTag(e.target.value)}
              className="px-2 py-1 rounded border"
            >
              <option value="work">Work</option>
              <option value="personal">Personal</option>
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="px-2 py-1 rounded border"
            />
          </div>

          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-4">
          {["all", "active", "completed"].map((f) => (
            <button
              key={f}
              onClick={() => dispatch(setFilter(f))}
              className={`px-3 py-1 rounded-lg text-sm
                ${
                  filter === f
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 dark:text-white"
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <ul className="space-y-2">
          <AnimatePresence>
            {filteredTodos.map((todo) => (
              <motion.li
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                {editingId === todo.id ? (
                  <input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleEditSave(todo.id);
                      if (e.key === "Escape") setEditingId(null);
                    }}
                    onBlur={() => handleEditSave(todo.id)}
                    className="flex-1 px-2 py-1 rounded border dark:bg-gray-600 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() =>
                      dispatch(
                        updateTodoAsync({
                          id: todo.id,
                          updates: { completed: !todo.completed },
                        }),
                      )
                    }
                    className={`flex-1 cursor-pointer
                      ${
                        todo.completed
                          ? "line-through opacity-50"
                          : "text-gray-800 dark:text-white"
                      }
                      ${isOverdue(todo) ? "text-red-500" : ""}
                    `}
                  >
                    {todo.text}
                  </span>
                )}

                <div className="flex gap-2 ml-2">
                  <button
                    onClick={() => {
                      setEditingId(todo.id);
                      setEditText(todo.text);
                    }}
                    className="text-blue-500 hover:scale-110 transition"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => dispatch(deleteTodoAsync(todo.id))}
                    className="text-red-500 hover:scale-110 transition"
                  >
                    ❌
                  </button>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      </div>
    </div>
  );
};

export default TodoApp;
