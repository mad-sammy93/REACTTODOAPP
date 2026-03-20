import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  addTodo,
  toggleTodo,
  deleteTodo,
  setFilter,
  fetchTodos,
  editTodo
} from '../features/todos/todosSlice';

const TodoApp = () => {
  const [text, setText] = useState('');
  const [dark, setDark] = useState(false);

  // ✏️ edit state
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');

  const dispatch = useDispatch();
  const { items, filter } = useSelector(state => state.todos);

  // fetch initial todos
  useEffect(() => {
    dispatch(fetchTodos());
  }, [dispatch]);

  // dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  const filteredTodos = items.filter(todo => {
    if (filter === 'active') return !todo.completed;
    if (filter === 'completed') return todo.completed;
    return true;
  });

  const handleAdd = () => {
    if (text.trim()) {
      dispatch(addTodo(text));
      setText('');
    }
  };

  const handleEditSave = (id) => {
    if (editText.trim()) {
      dispatch(editTodo({ id, text: editText }));
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

          <button
            onClick={() => setDark(!dark)}
            className="text-sm px-3 py-1 rounded bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white"
          >
            {dark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Input */}
        <div className="flex gap-2 mb-4">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            placeholder="What needs to be done?"
            className="flex-1 px-3 py-2 rounded-lg border dark:bg-gray-700 dark:text-white"
          />
          <button
            onClick={handleAdd}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Add
          </button>
        </div>

        {/* Filters */}
        <div className="flex justify-center gap-2 mb-4">
          {['all', 'active', 'completed'].map(f => (
            <button
              key={f}
              onClick={() => dispatch(setFilter(f))}
              className={`px-3 py-1 rounded-lg text-sm transition
                ${filter === f
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        <ul className="space-y-2">
          <AnimatePresence>
            {filteredTodos.map(todo => (
              <motion.li
                key={todo.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -50 }}
                className="flex justify-between items-center p-3 rounded-lg bg-gray-100 dark:bg-gray-700"
              >
                {/* ✏️ EDIT MODE */}
                {editingId === todo.id ? (
                  <input
                    value={editText}
                    onChange={e => setEditText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleEditSave(todo.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    onBlur={() => handleEditSave(todo.id)}
                    className="flex-1 px-2 py-1 rounded border dark:bg-gray-600 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <span
                    onClick={() => dispatch(toggleTodo(todo.id))}
                    className={`flex-1 cursor-pointer transition
                      ${todo.completed
                        ? 'line-through opacity-50'
                        : 'text-gray-800 dark:text-white'
                      }`}
                  >
                    {todo.text}
                  </span>
                )}

                {/* Actions */}
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
                    onClick={() => dispatch(deleteTodo(todo.id))}
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