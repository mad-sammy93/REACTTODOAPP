import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

// 🔹 Fetch todos (user-specific)
export const fetchTodos = createAsyncThunk(
  'todos/fetchTodos',
  async (_, { rejectWithValue }) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) return [];

    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return rejectWithValue(error.message);
    }

    return data;
  }
);

// 🔹 Add todo
export const addTodoAsync = createAsyncThunk(
  'todos/addTodo',
  async (todo, { rejectWithValue }) => {
    const { data: userData } = await supabase.auth.getUser();
    const user = userData.user;

    if (!user) {
      return rejectWithValue('User not authenticated');
    }

    const { data, error } = await supabase
      .from('todos')
      .insert([
        {
          ...todo,
          user_id: user.id // ✅ IMPORTANT for RLS
        }
      ])
      .select();

    if (error) {
      return rejectWithValue(error.message);
    }

    return data[0];
  }
);

// 🔹 Update todo
export const updateTodoAsync = createAsyncThunk(
  'todos/updateTodo',
  async ({ id, updates }, { rejectWithValue }) => { // ✅ FIXED
    const { data, error } = await supabase
      .from('todos')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) {
      return rejectWithValue(error.message);
    }

    return data[0];
  }
);

// 🔹 Delete todo
export const deleteTodoAsync = createAsyncThunk(
  'todos/deleteTodo',
  async (id, { rejectWithValue }) => { // ✅ FIXED
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      return rejectWithValue(error.message);
    }

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
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTodoAsync.fulfilled, (state, action) => {
        state.items = state.items.filter(t => t.id !== action.payload);
      });
  },
});

export const { setFilter, clearTodos } = todosSlice.actions;
export default todosSlice.reducer;