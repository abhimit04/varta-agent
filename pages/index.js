import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const signUp = async () => {
    const { user, error } = await supabase.auth.signUp({ email, password });
    if (error) alert(error.message);
    else {
      setUser(user);
      router.push('/chat');
    }
  };

  const signIn = async () => {
    const { user, error } = await supabase.auth.signIn({ email, password });
    if (error) alert(error.message);
    else {
      setUser(user);
      router.push('/chat');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <h1 className="text-2xl font-bold mb-4 text-green-600">WhatsApp Clone</h1>
      <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="mb-2 p-2 rounded border" />
      <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="mb-2 p-2 rounded border" />
      <div className="flex space-x-2">
        <button onClick={signIn} className="bg-green-500 text-white px-4 py-2 rounded">Sign In</button>
        <button onClick={signUp} className="bg-blue-500 text-white px-4 py-2 rounded">Sign Up</button>
      </div>
    </div>
  );
}
