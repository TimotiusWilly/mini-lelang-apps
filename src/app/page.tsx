import { supabase } from '@/lib/supabase';
import { getUser, getUserPhone, logout } from '@/app/actions/auth';
import { LogOut, User } from 'lucide-react';
import Link from 'next/link';
import { GridBackground } from '@/components/ui/GridBackground';
import Image from 'next/image';
import GlobalRealtime from '@/components/GlobalRealtime';
import ClientPostGrid from '@/components/ClientPostGrid';

export const revalidate = 0; // Dynamic rendering for this prototype

export default async function Home() {
  const userName = await getUser();
  const userPhone = await getUserPhone();

  // Fetch posts from Supabase
  const { data: posts, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Fallback dummy data if no data in supabase
  const displayPosts = posts && posts.length > 0 ? posts : [];

  return (
    <GridBackground>
      <GlobalRealtime />
      <div className="min-h-screen pb-20">
        {/* Header */}
        <header className="sticky top-4 z-50 max-w-7xl mx-auto px-4 w-full mb-8">
          <div className="glass-panel rounded-full px-4 md:px-6 h-16 flex items-center justify-between shadow-lg shadow-black/5 border border-gray-200/50 bg-gradient-to-r from-gray-200/80 to-gray-50/90">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-md overflow-hidden bg-white shrink-0 shadow-sm border border-gray-100 dark:border-gray-800">
                <Image
                  src="/logo.jpg"
                  alt="Willy Consign Logo"
                  fill
                  className="object-contain p-0.5"
                  sizes="40px"
                />
              </div>
              <h1 className="text-[13px] sm:text-xl font-bold tracking-tighter leading-none shrink-0 whitespace-nowrap">
                Willy<br className="sm:hidden" /> Consign
              </h1>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {userName ? (
                <div className="flex items-center gap-1.5 sm:gap-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <div className="hidden sm:flex w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 items-center justify-center border border-gray-200 dark:border-gray-700">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">{userName}</span>
                  </div>
                  {userName === 'WillyAdmin' && (
                    <Link href="/admin" className="text-xs font-semibold bg-gray-900 text-white dark:bg-white dark:text-black px-3 py-1.5 rounded-full hover:opacity-90">
                      Admin
                    </Link>
                  )}
                  <Link href="/my-bookings" className="text-xs font-semibold bg-gray-200 text-black dark:bg-gray-800 dark:text-white px-3 py-1.5 rounded-full hover:opacity-90">
                    Invoice Saya
                  </Link>
                  <form action={logout}>
                    <button type="submit" className="text-gray-500 hover:text-red-500 transition-colors p-1.5 sm:p-2" title="Keluar">
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                    </button>
                  </form>
                </div>
              ) : (
                <Link href="/login" className="text-sm font-semibold bg-black text-white dark:bg-white dark:text-black px-5 py-2 rounded-full hover:opacity-90 transition-opacity">
                  Login
                </Link>
              )}
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-12 md:py-20 px-4 max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4">
            Stock Hotwheels By Willy
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            Harga Hotwheels yang tertera sudah NET, sudah dipastikan harga sudah murah dan cocok untuk di resell oleh kalian! SAY NO TO BNR.
          </p>
        </section>

        {/* Grid of Posts with Search */}
        <main className="max-w-7xl mx-auto px-4">
          {error ? (
            <div className="text-center py-20 bg-red-50 dark:bg-red-950/20 rounded-3xl border border-red-200 dark:border-red-900 border-dashed">
              <p className="text-red-500 font-bold mb-2">Terjadi kesalahan saat mengambil data dari Supabase:</p>
              <code className="bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 px-4 py-2 rounded text-sm">{error.message}</code>
              <p className="text-sm mt-4 text-gray-500">Pastikan URL dan Anon Key di `.env.local` sudah benar.</p>
            </div>
          ) : displayPosts.length === 0 ? (
            <div className="text-center py-20 bg-white/50 dark:bg-black/50 rounded-3xl border border-gray-200 dark:border-gray-800 border-dashed">
              <p className="text-gray-500 dark:text-gray-400">Belum ada data lelang.</p>
              <p className="text-sm text-gray-400 mt-2">Jalankan query SQL di Supabase dari file <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded">schema.sql</code> untuk menambahkan data dummy.</p>
            </div>
          ) : (
            <ClientPostGrid posts={displayPosts} userName={userName} userPhone={userPhone} />
          )}
        </main>
      </div>
    </GridBackground>
  );
}
