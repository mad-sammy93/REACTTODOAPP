import { createSlice, nanoid, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchTodos = createAsyncThunk(
    'todos/fetchTodos',
    async () => {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve([
                    { id: '1', text: 'Learn Redux', completed: false },
                    { id: '2', text: 'Build App', completed: true },
                ]);
            }, 1000);
        });
    }
);

const loadState = () => {
    try {
        const data = localStorage.getItem('todos');
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
};

const initialState = {
    items: loadState(),
    filter: 'all', // 'all' | 'active' | 'completed'
};

const todosSlice = createSlice({
    name: 'todos',
    initialState,
    reducers: {
        addTodo: {
            reducer(state, action) {
                state.items.push(action.payload);
            },
            prepare(text) {
                return {
                    payload: {
                        id: nanoid(),
                        text,
                        completed: false,
                    },
                };
            },
        },
        setFilter(state, action) {
            state.filter = action.payload;
        },
        toggleTodo(state, action) {
            const todo = state.items.find(t => t.id === action.payload);
            if (todo) {
                todo.completed = !todo.completed;
            }
        },
        deleteTodo(state, action) {
            state.items = state.items.filter(t => t.id !== action.payload);
        },
        editTodo(state, action) {
            const { id, text } = action.payload;
            const todo = state.items.find(t => t.id === id);
            if (todo) {
                todo.text = text;
            }
        },
        extraReducers: builder => {
            builder.addCase(fetchTodos.fulfilled, (state, action) => {
                state.items = action.payload;
            });
        },
    },
});

export const { addTodo, toggleTodo, deleteTodo, editTodo, setFilter } = todosSlice.actions;
// export { fetchTodos };
export default todosSlice.reducer;