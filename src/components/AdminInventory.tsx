'use client';

import { useState } from 'react';
import Image from 'next/image';
import { updatePost } from '@/app/actions/admin';
import { Save, Loader2 } from 'lucide-react';

export default function AdminInventory({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleUpdate = async (postId: string, title: string, price: number) => {
    setSavingId(postId);
    try {
      const res = await updatePost(postId, title, price);
      if (res.error) {
        alert('Gagal menyimpan: ' + res.error);
      } else {
        // Optional: show a small success indicator
      }
    } catch (err) {
      alert('Terjadi kesalahan');
    } finally {
      setSavingId(null);
    }
  };

  const handleLocalChange = (postId: string, field: 'title' | 'base_price', value: string | number) => {
    setPosts(posts.map(p => {
      if (p.id === postId) {
        return { ...p, [field]: value };
      }
      return p;
    }));
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPrice = filteredPosts.reduce((sum, post) => sum + (Number(post.base_price) || 0), 0);
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(totalPrice);

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold">Kelola Barang</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari nama barang..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm"
            />
            <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Total Value */}
          <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center shrink-0 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-gray-500 text-sm font-medium mr-3">Total Nilai:</span>
            <span className="font-black text-green-600 dark:text-green-400 text-lg">{formattedTotal}</span>
          </div>
        </div>
      </div>
      <div className="w-full overflow-x-auto scroll-smooth custom-scrollbar-top" style={{ transform: 'rotateX(180deg)' }}>
        <div className="inline-block min-w-full max-h-[70vh] overflow-y-auto" style={{ transform: 'rotateX(180deg)' }}>
          <table className="w-full min-w-[800px] text-left text-sm border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-black z-10 shadow-[0_1px_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_rgba(255,255,255,0.1)]">
            <tr className="text-gray-500">
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Barang</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Nama (Bisa diedit)</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Harga (Bisa diedit)</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap w-24">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
            {filteredPosts.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-gray-400">
                  {searchQuery ? 'Tidak ada barang yang cocok dengan pencarian.' : 'Belum ada barang.'}
                </td>
              </tr>
            ) : (
              filteredPosts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                  <td className="py-3 px-4 w-20">
                    <div className="relative w-12 h-16 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 transition-all duration-300 hover:scale-[8] hover:z-50 hover:shadow-2xl z-10 relative origin-left hover:-translate-y-4 cursor-zoom-in border border-transparent hover:border-white/50">
                      <Image 
                        src={post.image_url} 
                        alt="Item" 
                        fill 
                        className="object-cover"
                        sizes="48px"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <input 
                      type="text" 
                      value={post.title}
                      onChange={(e) => handleLocalChange(post.id, 'title', e.target.value)}
                      className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded px-3 py-1.5 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                    />
                  </td>
                  <td className="py-3 px-4 w-48">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">Rp</span>
                      <input 
                        type="number" 
                        value={post.base_price}
                        onChange={(e) => handleLocalChange(post.id, 'base_price', Number(e.target.value))}
                        className="w-full bg-transparent border border-gray-300 dark:border-gray-700 rounded pl-8 pr-3 py-1.5 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                      />
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleUpdate(post.id, post.title, post.base_price)}
                      disabled={savingId === post.id}
                      className="flex items-center justify-center bg-black dark:bg-white text-white dark:text-black rounded px-4 py-1.5 font-medium hover:opacity-90 disabled:opacity-50 transition-opacity w-full"
                    >
                      {savingId === post.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Simpan
                        </>
                      )}
                    </button>
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
