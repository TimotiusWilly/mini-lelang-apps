import { getUser } from '@/app/actions/auth';
import { supabase } from '@/lib/supabase';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, Package, Receipt } from 'lucide-react';
import Image from 'next/image';
import { GridBackground } from '@/components/ui/GridBackground';

export const revalidate = 0;

export default async function MyInvoicePage() {
  const userName = await getUser();

  if (!userName) {
    redirect('/login');
  }

  // Ambil semua komentar/booking dari user ini beserta data barangnya
  const { data: rawBookings, error } = await supabase
    .from('comments')
    .select('*, posts(*)')
    .eq('user_name', userName)
    .order('created_at', { ascending: false });

  // 1. Dapatkan daftar post_id yang dikomentari oleh user
  const postIds = Array.from(new Set((rawBookings || []).map((b: any) => b.post_id)));

  // 2. Ambil SEMUA komentar untuk barang-barang tersebut untuk mencari siapa yang nge-book PERTAMA
  let postWinners = new Map(); // post_id -> winning_comment_id
  
  if (postIds.length > 0) {
    const { data: allComments } = await supabase
      .from('comments')
      .select('id, post_id, content, created_at, is_winner')
      .in('post_id', postIds)
      .order('created_at', { ascending: true }); // Urutkan dari yang paling lama (pertama)

    // 3. Tentukan pemenang untuk setiap barang
    for (const c of (allComments || [])) {
      const content = (c.content || '').toLowerCase();
      const isBook = /\b(book|buk|b)\b/.test(content);
      
      // Jika ini komentar book, dan belum ada pemenang untuk barang ini, maka dia menang
      if (isBook && !postWinners.has(c.post_id)) {
        postWinners.set(c.post_id, c.id);
      }
      
      // Override: Jika admin secara manual memilih pemenang (is_winner = true)
      if (c.is_winner) {
        postWinners.set(c.post_id, c.id);
      }
    }
  }

  // 4. Filter komentar user, HANYA masukkan jika komentar dia adalah komentar yang menang
  const confirmedItems = (rawBookings || []).reduce((acc: any[], booking: any) => {
    // Cek apakah komentar ini adalah pemenangnya
    if (postWinners.get(booking.post_id) === booking.id) {
      const content = (booking.content || '').toLowerCase();
      const isBook = /\b(book|buk|b)\b/.test(content);
      const isNego = !isBook && (content.includes('nego') || content.includes('try') || /\d+/.test(content));
      let finalPrice = booking.posts?.base_price || 0;

      if (!isBook && isNego) {
        const match = content.match(/(\d+(?:[.,]\d+)*)\s*(k)?/);
        if (match) {
          const numStr = match[1].replace(/[,.]/g, '');
          let num = parseInt(numStr, 10);

          if (match[2] === 'k') {
            num *= 1000;
          } else if (num > 0 && num <= 1000) {
            num *= 1000;
          }
          finalPrice = num;
        }
      }

      acc.push({ ...booking, finalPrice });
    }
    return acc;
  }, []);

  const grandTotal = confirmedItems.reduce((sum, item) => sum + item.finalPrice, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <GridBackground>
      <div className="min-h-screen pb-20 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 glass-panel p-4 md:p-6 rounded-2xl bg-white/60 dark:bg-black/60 shadow-lg">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors shrink-0">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl md:text-2xl font-black uppercase tracking-tight flex items-center gap-2">
                  <Receipt className="w-6 h-6" /> Invoice Tagihan
                </h1>
                <p className="text-sm text-gray-500 mt-1">Halo, <b>{userName}</b>! Berikut adalah rekap belanjaan Anda.</p>
              </div>
            </div>

            <div className="w-full sm:w-auto bg-black text-white dark:bg-white dark:text-black px-6 py-4 rounded-xl flex flex-col items-start sm:items-end shadow-xl">
              <span className="text-xs uppercase tracking-wider font-bold opacity-70 mb-1">Grand Total</span>
              <span className="text-2xl md:text-3xl font-black">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          {/* List Items */}
          <div className="space-y-4">
            {error ? (
              <div className="text-center p-8 bg-red-50 text-red-500 rounded-xl font-bold">
                Gagal memuat data invoice.
              </div>
            ) : confirmedItems.length === 0 ? (
              <div className="text-center p-12 glass-panel bg-white/40 dark:bg-black/40 rounded-3xl flex flex-col items-center justify-center gap-4 border border-dashed border-gray-300 dark:border-gray-700">
                <Package className="w-12 h-12 text-gray-300 dark:text-gray-700" />
                <p className="text-gray-500 font-medium">Anda belum memiliki tagihan atau barang yang dimenangkan.</p>
                <Link href="/" className="bg-black text-white dark:bg-white dark:text-black px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg">
                  Mulai Belanja
                </Link>
              </div>
            ) : (
              <div className="glass-panel bg-white/70 dark:bg-black/70 rounded-3xl overflow-hidden shadow-sm">
                <div className="divide-y divide-gray-100 dark:divide-gray-900">
                  {confirmedItems.map((item: any) => {
                    const isBook = /\b(book|buk|b)\b/.test(item.content.toLowerCase());
                    const dateStr = item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }) : '';

                    return (
                      <div key={item.id} className="p-4 md:p-6 flex gap-4 md:gap-6 items-start sm:items-center flex-col sm:flex-row hover:bg-white/40 dark:hover:bg-white/5 transition-colors">
                        {/* Image */}
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 bg-gray-100 dark:bg-gray-800 shadow-inner">
                          {item.posts?.image_url ? (
                            <Image
                              src={item.posts.image_url}
                              alt={item.posts.title}
                              fill
                              className="object-cover"
                              sizes="96px"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400"><Package className="w-8 h-8" /></div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 w-full flex flex-col sm:flex-row justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-lg md:text-xl truncate text-gray-900 dark:text-white">{item.posts?.title || 'Barang Dihapus'}</h3>
                            <div className="flex items-center gap-2 mt-1.5 mb-3">
                              {isBook ? (
                                <span className="bg-black text-white dark:bg-white dark:text-black text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider">{item.content}</span>
                              ) : (
                                <span className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-500 text-[10px] font-bold px-2 py-0.5 rounded border border-yellow-200 dark:border-yellow-800">Deal: "{item.content}"</span>
                              )}
                              <span className="text-xs text-gray-400 font-medium">{dateStr}</span>
                            </div>
                          </div>

                          <div className="flex flex-col sm:items-end justify-center">
                            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-0.5">Subtotal</span>
                            <span className="font-black text-xl text-green-600 dark:text-green-400">{formatPrice(item.finalPrice)}</span>
                            {item.finalPrice !== item.posts?.base_price && (
                              <span className="text-xs text-gray-400 line-through mt-0.5" title="Harga Awal">
                                {formatPrice(item.posts?.base_price || 0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Floating WhatsApp Button for Payment */}
      {confirmedItems.length > 0 && (
        <a
          href={`https://wa.me/6287836872403?text=${encodeURIComponent(`Halo Admin Willy Consign, saya ingin memproses pembayaran untuk invoice saya.\n\nUsername: ${userName}\nTotal Tagihan: ${formatPrice(grandTotal)}\n\nMohon info rekening untuk pembayaran.`)}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 md:bottom-10 md:right-10 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center z-50 group"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.347-.272.297-1.04 1.016-1.04 2.479 0 1.463 1.065 2.876 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          {/* Tooltip on hover */}
          <div className="absolute right-full mr-4 top-1/2 -translate-y-1/2 bg-black text-white text-sm px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity font-semibold">
            Lanjut Pembayaran
          </div>
        </a>
      )}
    </GridBackground>
  );
}
