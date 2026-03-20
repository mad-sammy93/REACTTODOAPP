import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
    });

    if (!error) {
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="p-6 bg-white rounded shadow">
        <h2 className="mb-4">Login</h2>

        <input
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Enter email"
          className="border p-2 mb-2 w-full"
        />

        <button onClick={handleLogin} className="bg-indigo-600 text-white p-2 w-full">
          Send Magic Link
        </button>

        {sent && <p className="text-green-500 mt-2">Check your email!</p>}
      </div>
    </div>
  );
};

export default Auth;