'use client';

import { useState } from 'react';
import { login } from '@/app/actions/auth';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

export default function LoginPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData(e.currentTarget);
    formData.append('isRegister', isRegister.toString());
    
    const result = await login(formData);
    
    if (result?.error) {
      setError(result.error);
      setIsLoading(false);
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
            {isRegister ? 'Buat Akun' : 'Selamat Datang'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {isRegister 
              ? 'Daftar untuk mulai mengikuti lelang.' 
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

          <div>
            <label className="block text-sm font-medium mb-2">
              Nomor WhatsApp / HP {isRegister && <span className="text-red-500">*</span>}
            </label>
            <input 
              type="tel" 
              name="phone"
              required={isRegister}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              placeholder="Contoh: 08123456789"
            />
            <p className="text-xs text-gray-500 mt-1">Digunakan admin untuk menghubungi jika menang lelang.</p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input 
              type="password" 
              name="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white/50 dark:bg-black/50 focus:ring-2 focus:ring-black dark:focus:ring-white outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400 text-sm rounded-lg border border-red-100 dark:border-red-900">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-black text-white dark:bg-white dark:text-black font-semibold py-3 px-4 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            {isRegister ? 'Daftar Sekarang' : 'Masuk'}
          </button>
        </form>

        <div className="mt-8 text-center text-sm">
          <button 
            type="button"
            onClick={() => setIsRegister(!isRegister)}
            className="text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          >
            {isRegister 
              ? 'Sudah punya akun? Masuk di sini.' 
              : 'Belum punya akun? Daftar di sini.'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
