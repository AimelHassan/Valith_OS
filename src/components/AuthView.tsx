import React, { useState } from 'react';
import { supabase, isSupabaseConfigured } from '../supabaseClient';

export const AuthView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) {
        setMessage(`Error: ${error.message}`);
      }
      setLoading(false);
    } else {
      // Mock local sign in
      if (email === 'founder@valith.tech' && password === 'valithos') {
        const mockUser = { id: 'founder-local', email: 'founder@valith.tech', role: 'founder' };
        localStorage.setItem('vos_mock_session', JSON.stringify(mockUser));
        window.location.reload();
      } else {
        setMessage('Offline Credentials: Use founder@valith.tech / valithos');
      }
      setLoading(false);
    }
  };

  const handleOfflineBypass = () => {
    const mockUser = { id: 'founder-local', email: 'founder@valith.tech', role: 'founder' };
    localStorage.setItem('vos_mock_session', JSON.stringify(mockUser));
    window.location.reload();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md bg-background-card border border-border rounded-lg shadow-premium p-8 relative overflow-hidden">
        {/* Aurum Glow Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 gold-gradient"></div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-typography font-sans">VALITH OS</h1>
          <p className="text-xs text-typography-muted mt-2 font-sans">INTERNAL COMMAND CENTER — v0</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-typography-muted">
              Founder Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="founder@valith.tech"
              required
              className="w-full"
            />
          </div>

          <div className="flex flex-col space-y-1">
            <label className="text-xs font-semibold uppercase tracking-wider text-typography-muted">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full"
            />
          </div>

          {message && (
            <div className={`p-3 rounded text-xs ${message.startsWith('Error') ? 'bg-red-50 text-red-600' : 'bg-aurum-glow text-aurum-dark'}`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-typography hover:bg-typography/90 text-white font-medium py-2 px-4 rounded text-sm transition-all focus:outline-none"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 border-t border-border pt-6 text-center">
          <p className="text-xs text-typography-light mb-3">
            {!isSupabaseConfigured
              ? "Supabase integration not detected. Operating in local sandbox."
              : "Supabase connection online. Login with founder credentials."}
          </p>
          <button
            onClick={handleOfflineBypass}
            className="text-xs font-medium text-aurum hover:text-aurum-dark underline transition-all focus:outline-none"
          >
            Proceed in Offline Sandbox Mode
          </button>
        </div>
      </div>
    </div>
  );
};
