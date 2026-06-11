'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { Home, LogIn } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const locale = useLocale();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      console.log('🔐 Attempting login with username:', username);
      
      // Send login request to server
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      console.log('📥 Login response status:', response.status);
      const data = await response.json();
      console.log('📥 Login response data:', data);

      if (response.ok) {
        // Set auth token in localStorage as backup for client-side checks
        localStorage.setItem('adminAuth', 'true');
        console.log('✅ Login successful, redirecting...');
        router.push(`/${locale}/admin/dashboard`);
      } else {
        const errorMsg = data.message || 'ناویی بەکارهێنەر یان وشەی نهێنی هەڵەیە';
        setError(errorMsg);
        console.error('❌ Login failed:', errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      setError('خۆڵای سێرڤەر: ' + errorMsg);
      console.error('❌ Login error:', err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-gray-50 to-zinc-200/50 p-4 sm:p-6">
      {/* Home Button */}
      <button
        onClick={() => router.push(`/${locale}`)}
        className="absolute top-5 left-5 bg-white/80 backdrop-blur border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-xl p-2.5 shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center z-10"
      >
        <Home className="w-4 h-4" />
      </button>

      <div className="w-full max-w-md bg-white border border-gray-100 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.06)] p-6 sm:p-9 relative" dir="rtl">
        {/* Logo */}
        <div className="flex justify-center mb-5">
          <div className="w-20 h-20 rounded-2xl overflow-hidden border border-gray-100/80 shadow-md p-1 bg-white">
            <Image
              src="/image/logo.jpeg"
              alt="Logo"
              width={76}
              height={76}
              className="w-full h-full object-contain rounded-xl"
            />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-900 mb-1">
          بەخێربێیتەوە
        </h1>
        <p className="text-xs text-gray-400 text-center mb-6">
          بۆ چوونەژوورەوە، تکایە زانیارییەکانت بنووسە
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-4" style={{textAlign:'right'}}>
          {/* Username */}
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-gray-500 mb-1.5 text-right">
              ناوی بەکارهێنەر
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="ناوی بەکارهێنەر"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900 text-right placeholder:text-right text-base lg:text-sm shadow-sm transition bg-white"
              style={{direction:'rtl'}}
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-xs font-semibold text-gray-500 mb-1.5 text-right">
              وشەی نهێنی
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="وشەی نهێنی"
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:ring-1 focus:ring-black text-gray-900 text-right placeholder:text-right text-base lg:text-sm shadow-sm transition bg-white"
              style={{direction:'rtl'}}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs text-right font-medium animate-pulse" style={{direction:'rtl'}}>
              {error}
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 hover:bg-gray-800 text-white cursor-pointer rounded-xl py-5.5 font-semibold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-gray-900/10 active:scale-[0.98]"
            style={{direction:'rtl'}}
          >
            {loading ? 'چونەژوورەوە...' : 'چونەژوورەوە'}
            <LogIn className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}

