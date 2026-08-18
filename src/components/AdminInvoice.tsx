'use client';

import { useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

import { updateInvoiceStatus } from '@/app/actions/admin';
import { Loader2, CheckCircle, Clock } from 'lucide-react';

export default function AdminInvoice({ bookings }: { bookings: any[] }) {
  const [loadingUser, setLoadingUser] = useState<string | null>(null);

  const confirmedItems = useMemo(() => {
    // Urutkan semua booking dari yang paling awal (terlama) untuk mencari siapa yang pertama book
    const sortedBookings = [...bookings].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
    
    const postWinners = new Map(); // post_id -> winning_comment_id
    
    for (const c of sortedBookings) {
      const content = (c.content || '').toLowerCase();
      const isBook = /\b(book|buk|b)\b/.test(content);
      
      if (isBook && !postWinners.has(c.post_id)) {
        postWinners.set(c.post_id, c.id);
      }
      if (c.is_winner) {
        postWinners.set(c.post_id, c.id); // Admin override
      }
    }

    return bookings.reduce((acc: any[], booking) => {
      // HANYA proses jika booking ini adalah pemenangnya
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
  }, [bookings]);

  // Group by user
  const groupedByUser = useMemo(() => {
    const groups: Record<string, { user_name: string; user_phone: string; items: any[]; total: number; is_paid: boolean }> = {};
    confirmedItems.forEach(item => {
      const key = item.user_phone || item.user_name;
      if (!groups[key]) {
        groups[key] = {
          user_name: item.user_name,
          user_phone: item.user_phone,
          items: [],
          total: 0,
          is_paid: false
        };
      }
      groups[key].items.push(item);
      groups[key].total += item.finalPrice;
      if (item.is_paid) {
        groups[key].is_paid = true;
      }
    });
    return Object.values(groups).sort((a, b) => b.total - a.total);
  }, [confirmedItems]);

  const grandTotal = confirmedItems.reduce((sum, item) => sum + item.finalPrice, 0);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency', currency: 'IDR', minimumFractionDigits: 0
    }).format(price);
  };

  const handleTogglePaid = async (userName: string, currentStatus: boolean) => {
    setLoadingUser(userName);
    try {
      const res = await updateInvoiceStatus(userName, !currentStatus);
      if (res.error) {
        alert('Gagal mengupdate status: ' + res.error);
      }
      // If success, Realtime will automatically update the UI
    } catch (err) {
      alert('Terjadi kesalahan saat mengupdate status');
    } finally {
      setLoadingUser(null);
    }
  };

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">Rekap Invoice</h2>
        
        <div className="bg-black text-white dark:bg-white dark:text-black px-4 py-2 rounded-lg font-bold shadow-lg">
          Grand Total: {formatPrice(grandTotal)}
        </div>
      </div>
      
      <div className="w-full overflow-x-auto scroll-smooth custom-scrollbar-top" style={{ transform: 'rotateX(180deg)' }}>
        <div className="inline-block min-w-full max-h-[70vh] overflow-y-auto" style={{ transform: 'rotateX(180deg)' }}>
          <table className="w-full min-w-[800px] text-left text-sm border-collapse">
            <thead className="sticky top-0 bg-white dark:bg-black z-10 shadow-[0_1px_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_rgba(255,255,255,0.1)]">
              <tr className="text-gray-500">
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Pembeli</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs">Barang Dimenangkan</th>
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap text-right">Total Tagihan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
              {groupedByUser.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-gray-400">
                    Belum ada barang yang terjual.
                  </td>
                </tr>
              ) : (
                groupedByUser.map((userGroup, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-4 align-top w-1/4">
                      <div className="font-bold text-black dark:text-white text-base">{userGroup.user_name}</div>
                      {userGroup.user_phone && (
                        <div className="text-sm font-normal text-gray-500 mt-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          <a href={`https://wa.me/${userGroup.user_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                            {userGroup.user_phone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-top">
                      <div className="flex flex-col gap-3">
                        {userGroup.items.map(item => (
                          <div key={item.id} className="flex items-center justify-between bg-white dark:bg-black border border-gray-100 dark:border-gray-800 p-2 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                                {item.posts?.image_url && (
                                  <Image 
                                    src={item.posts.image_url} 
                                    alt="Item" 
                                    fill 
                                    className="object-cover"
                                    sizes="48px"
                                    unoptimized
                                  />
                                )}
                              </div>
                              <div>
                                <div className="font-medium text-sm line-clamp-1" title={item.posts?.title}>{item.posts?.title}</div>
                                <div className="text-xs text-gray-500 mt-0.5 uppercase font-semibold">
                                  Via: {
                                    (item.content || '').toLowerCase() === 'book' || (item.content || '').toLowerCase().includes('book') 
                                      ? 'Book' 
                                      : `Try / Nego: "${item.content}"`
                                  }
                                </div>
                              </div>
                            </div>
                            <div className="font-bold text-gray-900 dark:text-gray-100 ml-4 whitespace-nowrap">
                              {formatPrice(item.finalPrice)}
                              {item.finalPrice !== item.posts?.base_price && (
                                <div className="text-[10px] text-gray-400 font-normal line-through text-right mt-0.5">
                                  {formatPrice(item.posts?.base_price || 0)}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 align-top text-right w-1/4">
                      <div className="font-black text-lg text-green-600 dark:text-green-400">
                        {formatPrice(userGroup.total)}
                      </div>
                      <div className="text-xs text-gray-400 mt-1 uppercase font-semibold mb-4">
                        {userGroup.items.length} Barang
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        {userGroup.is_paid ? (
                          <div className="flex items-center gap-1.5 text-sm font-bold text-green-600 bg-green-50 dark:bg-green-900/30 px-3 py-1.5 rounded-full border border-green-200 dark:border-green-800">
                            <CheckCircle className="w-4 h-4" />
                            LUNAS
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-sm font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-3 py-1.5 rounded-full border border-amber-200 dark:border-amber-800">
                            <Clock className="w-4 h-4" />
                            BELUM LUNAS
                          </div>
                        )}
                        
                        <button
                          onClick={() => handleTogglePaid(userGroup.user_name, userGroup.is_paid)}
                          disabled={loadingUser === userGroup.user_name}
                          className="mt-2 text-xs font-semibold underline underline-offset-2 text-gray-500 hover:text-black dark:hover:text-white transition-colors disabled:opacity-50 flex items-center justify-end w-full"
                        >
                          {loadingUser === userGroup.user_name ? (
                            <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Proses...</>
                          ) : (
                            userGroup.is_paid ? 'Tandai Belum Lunas' : 'Tandai Lunas'
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
