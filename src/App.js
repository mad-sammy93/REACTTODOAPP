import React, { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import TodoApp from './components/TodoApp';
import Auth from './components/Auth';
import { Toaster } from 'react-hot-toast'; // 👈 ADD THIS

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

  return (
    <>
      {/* 👇 ADD HERE */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
        }}
      />

      {/* 👇 YOUR APP */}
      {session ? <TodoApp /> : <Auth />}
    </>
  );
}

export default App;