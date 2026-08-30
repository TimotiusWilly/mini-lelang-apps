'use client';

import { useState } from 'react';
import { login, resetPassword } from '@/app/actions/auth';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);
    
    const formData = new FormData(e.currentTarget);
    
    if (mode === 'forgot') {
      const password = formData.get('password') as string;
      const confirmPassword = formData.get('confirmPassword') as string;
      
      if (password !== confirmPassword) {
        setError('Password baru dan konfirmasi tidak cocok.');
        setIsLoading(false);
        return;
      }
      
      const result = await resetPassword(formData);
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.success) {
        setSuccess('Password berhasil direset! Silakan login dengan password baru.');
        setMode('login');
        setIsLoading(false);
      }
    } else {
      formData.append('isRegister', (mode === 'register').toString());
      const result = await login(formData);
      
      if (result?.error) {
        setError(result.error);
        setIsLoading(false);
      } else if (result?.success) {
        window.location.href = '/';
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel w-full max-w-md p-8 rounded-2xl shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-200 via-black to-gray-200 dark:from-gray-800 dark:via-white dark:to-gray-800"></div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 tracking-tight">
            {mode === 'register' ? 'Buat Akun' : mode === 'forgot' ? 'Reset Password' : 'Selamat Datang'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {mode === 'register' 
              ? 'Daftar untuk mulai mengikuti lelang.' 
              : mode === 'forgot'
              ? 'Masukkan Nama dan Nomor HP untuk mereset password.'
              : 'Masuk untuk ikut serta dalam lelang.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Nama Pengguna</label>
            <input 
              type="text" 
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              placeholder="Masukkan nama Anda"
            />
          </div>

          <AnimatePresence>
            {(mode === 'register' || mode === 'forgot') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="py-2">
                  <label className="block text-sm font-medium mb-2">
                    Nomor WhatsApp / HP <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="tel" 
                    name="phone"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="Contoh: 08123456789"
                  />
                  {mode === 'register' && (
                    <p className="text-xs text-gray-500 mt-1">Digunakan admin untuk menghubungi jika menang lelang.</p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label className="block text-sm font-medium mb-2">
              {mode === 'forgot' ? 'Password Baru' : 'Password'}
            </label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <AnimatePresence>
            {mode === 'forgot' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="py-2">
                  <label className="block text-sm font-medium mb-2">Konfirmasi Password Baru</label>
                  <input 
                    type="password" 
                    name="confirmPassword"
                    required
                    className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 text-green-600 dark:bg-green-950/50 dark:text-green-400 text-sm rounded-lg border border-green-100 dark:border-green-900">
              {success}
            </div>
          )}

          {mode === 'login' && (
            <div className="flex justify-end mt-[-10px]">
              <button 
                type="button"
                onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                className="text-xs text-gray-500 hover:text-black dark:hover:text-white transition-colors"
              >
                Lupa Password?
              </button>
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black text-white dark:bg-white dark:text-black font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'register' ? 'Daftar Sekarang' : mode === 'forgot' ? 'Reset Password' : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm flex flex-col gap-2">
          {mode !== 'login' && (
            <button 
              type="button"
              onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Sudah punya akun? Masuk di sini.
            </button>
          )}
          {mode !== 'register' && (
            <button 
              type="button"
              onClick={() => { setMode('register'); setError(null); setSuccess(null); }}
              className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              Belum punya akun? Daftar di sini.
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
