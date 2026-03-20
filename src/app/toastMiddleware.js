import { isRejectedWithValue, isFulfilled } from '@reduxjs/toolkit';
import toast from 'react-hot-toast';

export const toastMiddleware = () => (next) => (action) => {
  // ❌ Error handler
  if (isRejectedWithValue(action)) {
    const message =
      action.payload?.message || action.error?.message || 'Something went wrong';

    toast.error(message);
  }

  // ✅ Success handler (optional: filter by type)
  if (isFulfilled(action)) {
    if (action.type.includes('addTodo')) {
      toast.success('Todo added 🎉');
    }

    if (action.type.includes('deleteTodo')) {
      toast.success('Deleted 🗑️');
    }

    if (action.type.includes('updateTodo')) {
      toast.success('Updated ✏️');
    }
  }

  return next(action);
};