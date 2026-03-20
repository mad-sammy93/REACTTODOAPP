import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import TodoApp from './components/TodoApp';
import Auth from './components/Auth';

function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setSession(session);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  return session ? <TodoApp /> : <Auth />;
}

export default App;