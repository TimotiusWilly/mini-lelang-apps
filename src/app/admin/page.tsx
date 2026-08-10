import { verifyAdmin } from '@/app/actions/admin';
import { redirect } from 'next/navigation';
import AdminTabs from '@/components/AdminTabs';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import Image from 'next/image';

export const revalidate = 0;

export default async function AdminDashboard() {
  const isAdmin = await verifyAdmin();

  if (!isAdmin) {
    redirect('/');
  }

  // Fetch initial posts for the inventory
  const { data: posts, error: postsError } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false });

  // Fetch initial booking comments
  const { data: comments, error: commentsError } = await supabase
    .from('comments')
    .select('*, posts(title, image_url, base_price)')
    .or('content.ilike.%book%,content.ilike.%nego%,content.ilike.%try%')
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen pb-20 bg-gray-50 dark:bg-[#0a0a0a]">
      {/* Admin Header */}
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
            <h1 className="text-[13px] sm:text-xl font-black tracking-tighter text-black dark:text-white leading-none shrink-0">
              ADMIN<br className="sm:hidden" /> DASHBOARD
            </h1>
          </div>
          <Link href="/" className="text-sm font-semibold hover:opacity-70 transition-opacity text-black dark:text-white">
            Kembali ke Web
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AdminTabs
          initialPosts={posts || []}
          initialBookings={comments || []}
        />
      </main>
    </div>
  );
}
