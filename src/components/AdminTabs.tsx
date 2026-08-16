'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminBookings from './AdminBookings';
import AdminInventory from './AdminInventory';
import AdminInvoice from './AdminInvoice';

type AdminTabsProps = {
  initialPosts: any[];
  initialBookings: any[];
  initialUsers: any[];
};

export default function AdminTabs({ initialPosts, initialBookings, initialUsers }: AdminTabsProps) {
  const [activeTab, setActiveTab] = useState<'bookings' | 'nego' | 'inventory' | 'invoice'>('bookings');
  const [bookings, setBookings] = useState(initialBookings);

  useEffect(() => {
    const channel = supabase
      .channel('admin_global_bookings')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'comments' },
        async (payload) => {
          const newComment = payload.new;
          const { data: postData } = await supabase
            .from('posts')
            .select('title, image_url, base_price')
            .eq('id', newComment.post_id)
            .single();

          if (postData) {
            setBookings((prev) => [{ ...newComment, posts: postData }, ...prev]);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'comments' },
        (payload) => setBookings((prev) => prev.filter(b => b.id !== payload.old.id))
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'comments' },
        (payload) => setBookings((prev) => prev.map(b => b.id === payload.new.id ? { ...b, ...payload.new } : b))
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div>
      <div className="flex flex-wrap gap-4 mb-8 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveTab('bookings')}
          className={`pb-3 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'bookings'
              ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Live Bookings
        </button>
        <button
          onClick={() => setActiveTab('nego')}
          className={`pb-3 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'nego'
              ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Try & Nego
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`pb-3 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'inventory'
              ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Kelola Barang
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`pb-3 font-semibold text-sm transition-colors whitespace-nowrap ${
            activeTab === 'invoice'
              ? 'border-b-2 border-black dark:border-white text-black dark:text-white'
              : 'text-gray-500 hover:text-black dark:hover:text-white'
          }`}
        >
          Rekap Invoice
        </button>
      </div>

      <div className="bg-white dark:bg-black rounded-2xl p-4 md:p-6 shadow-sm border border-gray-100 dark:border-gray-900 w-full overflow-hidden">
        {activeTab === 'bookings' ? (
          <AdminBookings bookings={bookings} mode="book" />
        ) : activeTab === 'nego' ? (
          <AdminBookings bookings={bookings} mode="nego" />
        ) : activeTab === 'invoice' ? (
          <AdminInvoice bookings={bookings} />
        ) : (
          <AdminInventory initialPosts={initialPosts} initialUsers={initialUsers} />
        )}
      </div>
    </div>
  );
}
