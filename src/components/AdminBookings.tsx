'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';

export default function AdminBookings({ initialBookings, mode = 'book' }: { initialBookings: any[], mode?: 'book' | 'nego' }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    // Subscribe to new comments
    const channel = supabase
      .channel('admin_bookings')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'comments',
        },
        async (payload) => {
          const newComment = payload.new;
          
          const content = newComment.content.toLowerCase();
          const isBook = /\b(book|buk|b)\b/.test(content);
          const isNego = !isBook && (content.includes('nego') || content.includes('try') || /\d+/.test(content));

          // Track both book and nego/try comments globally
          if (isBook || isNego) {
            // Fetch post details for this comment
            const { data: postData } = await supabase
              .from('posts')
              .select('title, image_url, base_price')
              .eq('id', newComment.post_id)
              .single();

            if (postData) {
              const fullBooking = {
                ...newComment,
                posts: postData
              };
              setBookings((prev) => [fullBooking, ...prev]);
            }
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          setBookings((prev) => prev.filter(b => b.id !== payload.old.id));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'comments',
        },
        (payload) => {
          setBookings((prev) => prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filteredBookings = bookings.filter((booking) => {
    const content = (booking.content || '').toLowerCase();
    const isBook = /\b(book|buk|b)\b/.test(content);
    const isNego = !isBook && (content.includes('nego') || content.includes('try') || /\d+/.test(content));
    const matchesMode = mode === 'book' ? isBook : isNego;

    if (!matchesMode) return false;

    const query = searchQuery.toLowerCase();
    return (
      booking.user_name.toLowerCase().includes(query) ||
      (booking.posts?.title && booking.posts.title.toLowerCase().includes(query))
    );
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-bold">{mode === 'book' ? 'Live Bookings' : 'Try & Nego'}</h2>
        
        {/* Search Bar */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Cari nama atau barang..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
          />
          <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      
      <div className="w-full overflow-x-auto scroll-smooth custom-scrollbar-top" style={{ transform: 'rotateX(180deg)' }}>
        <div className="inline-block min-w-full max-h-[70vh] overflow-y-auto" style={{ transform: 'rotateX(180deg)' }}>
          <table className="w-full min-w-[800px] text-left text-sm border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-black z-10 shadow-[0_1px_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_rgba(255,255,255,0.1)]">
            <tr className="text-gray-500">
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Waktu</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Pembeli</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Barang</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Komentar</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Harga</th>
              {mode === 'nego' && (
                <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Aksi</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {filteredBookings.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-400">
                  {searchQuery ? 'Tidak ada booking yang cocok dengan pencarian.' : 'Belum ada booking masuk.'}
                </td>
              </tr>
            ) : (
              filteredBookings.map((booking) => {
                // Fix Hydration mismatch by not using toLocaleTimeString directly
                const timeStr = booking.created_at ? booking.created_at.split('T')[1].substring(0, 8) : '';
                
                const formattedPrice = new Intl.NumberFormat('id-ID', {
                  style: 'currency', currency: 'IDR', minimumFractionDigits: 0
                }).format(booking.posts?.base_price || 0);

                return (
                  <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="p-4 text-gray-500 whitespace-nowrap">{timeStr} WIB</td>
                    <td className="p-4">
                      <div className="font-bold text-black dark:text-white">{booking.user_name}</div>
                      {booking.user_phone && (
                        <div className="text-xs font-normal text-gray-500 mt-1 flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                          <a href={`https://wa.me/${booking.user_phone.replace(/[^0-9]/g, '')}`} target="_blank" rel="noreferrer" className="hover:text-black dark:hover:text-white transition-colors">
                            {booking.user_phone}
                          </a>
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0">
                          {booking.posts?.image_url && (
                            <Image 
                              src={booking.posts.image_url} 
                              alt="Item" 
                              fill 
                              className="object-cover"
                              sizes="48px"
                            />
                          )}
                        </div>
                        <span className="font-medium max-w-[200px] truncate" title={booking.posts?.title}>
                          {booking.posts?.title}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      {mode === 'book' ? (
                        <span className="inline-block bg-black text-white dark:bg-white dark:text-black px-2 py-1 rounded text-xs font-bold uppercase">
                          BOOK
                        </span>
                      ) : (
                        <span className="inline-block bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-500 px-2 py-1 rounded text-xs font-bold border border-yellow-200 dark:border-yellow-900/50">
                          "{booking.content}"
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 font-bold text-green-600 dark:text-green-400 whitespace-nowrap">
                      {formattedPrice}
                    </td>
                    {mode === 'nego' && (
                      <td className="py-4 px-4">
                        {booking.is_winner ? (
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-green-600 font-bold flex items-center gap-1 whitespace-nowrap text-xs">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                              Deal (Pemenang)
                            </span>
                            <button
                              onClick={async () => {
                                const { revokeWinner } = await import('@/app/actions/admin');
                                const res = await revokeWinner(booking.id);
                                if (res?.error) alert(res.error);
                              }}
                              className="text-red-500 hover:text-red-700 text-[10px] underline"
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={async () => {
                              const { approveWinner } = await import('@/app/actions/admin');
                              const res = await approveWinner(booking.id);
                              if (res.error) alert(res.error);
                            }}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-xs font-bold transition-colors whitespace-nowrap"
                          >
                            Deal (Crown)
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
