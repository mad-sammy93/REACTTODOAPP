import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// 🔹 Fetch todos (user-specific)
export const fetchTodos = createAsyncThunk('todos/fetchTodos', async () => {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData.user;

  if (!user) return [];

  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
});

// 🔹 Add todo
export const addTodoAsync = createAsyncThunk(
  'todos/addTodo',
  async (todo) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    const { data, error } = await supabase
      .from('todos')
      .insert([{
        ...todo,
        user_id: user.id
      }])
      .select();

    if (error) throw error;
    return data[0];
  }
);

// 🔹 Update
export const updateTodoAsync = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, updates }) => {
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    return data[0];
  }
);

// 🔹 Delete
export const deleteTodoAsync = createAsyncThunk(
  'todos/deleteTodo',
  async (id) => {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  }
);

const todosSlice = createSlice({
  name: 'todos',
  initialState: {
    items: [],
    filter: 'all',
  },
  reducers: {
    setFilter(state, action) {
      state.filter = action.payload;
    },
    clearTodos(state) {
      state.items = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTodos.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(addTodoAsync.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTodoAsync.fulfilled, (state, action) => {
        const index = state.items.findIndex(t => t.id === action.payload.id);
        if (index !== -1) state.items[index] = action.payload;
      })
      .addCase(deleteTodoAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      });
  },
});

export const { setFilter, clearTodos } = todosSlice.actions;
export default todosSlice.reducer;