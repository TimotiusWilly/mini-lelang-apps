'use client';

import { useState } from 'react';
import Image from 'next/image';
import { updatePost, addPost } from '@/app/actions/admin';
import { Save, Loader2 } from 'lucide-react';

export default function AdminInventory({ initialPosts }: { initialPosts: any[] }) {
  const [posts, setPosts] = useState(initialPosts);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'READY' | 'BOOKED'>('ALL');
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleAddSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUploading(true);
    const formData = new FormData(e.currentTarget);
    try {
      const res = await addPost(formData);
      if (res.error) {
        alert(res.error);
      } else {
        alert('Barang berhasil ditambahkan!');
        setIsAdding(false);
        window.location.reload(); // Refresh the page to show the new item from DB
      }
    } catch (err) {
      alert('Terjadi kesalahan saat upload');
    } finally {
      setIsUploading(false);
    }
  };

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

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = 
      statusFilter === 'ALL' ? true :
      statusFilter === 'READY' ? post.status === 'OPEN' :
      post.status === 'BOOKED';
    
    return matchesSearch && matchesStatus;
  });

  const totalPrice = filteredPosts.reduce((sum, post) => sum + (Number(post.base_price) || 0), 0);
  const formattedTotal = new Intl.NumberFormat('id-ID', {
    style: 'currency', currency: 'IDR', minimumFractionDigits: 0
  }).format(totalPrice);

  const readyCount = posts.filter(p => p.status === 'OPEN').length;
  const bookedCount = posts.filter(p => p.status === 'BOOKED').length;

  return (
    <div>
      <div className="flex flex-col mb-6 gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-xl font-bold">Kelola Barang</h2>
            <button 
              onClick={() => setIsAdding(!isAdding)} 
              className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 transition-opacity"
            >
              {isAdding ? 'Batal Tambah' : '+ Tambah Barang Baru'}
            </button>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
            {/* Stat Cards */}
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 px-3 py-2 rounded-lg border border-green-200 dark:border-green-900/50 flex-1 sm:flex-none text-center">
                <div className="text-xs font-semibold uppercase tracking-wider">Ready</div>
                <div className="text-lg font-black leading-none mt-1">{readyCount}</div>
              </div>
              <div className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/50 flex-1 sm:flex-none text-center">
                <div className="text-xs font-semibold uppercase tracking-wider">Terjual</div>
                <div className="text-lg font-black leading-none mt-1">{bookedCount}</div>
              </div>
            </div>
            
            {/* Total Value */}
            <div className="bg-white dark:bg-gray-900 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm flex items-center shrink-0 w-full sm:w-auto justify-between sm:justify-center">
              <span className="text-gray-500 text-xs font-medium mr-2">Total Nilai:</span>
              <span className="font-black text-black dark:text-white text-base">{formattedTotal}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full">
          {/* Search Bar */}
          <div className="relative w-full sm:w-96">
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

          {/* Status Filter */}
          <div className="w-full sm:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as 'ALL' | 'READY' | 'BOOKED')}
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm cursor-pointer"
            >
              <option value="ALL">Semua Status</option>
              <option value="READY">Hanya Ready</option>
              <option value="BOOKED">Hanya Terjual/Booked</option>
            </select>
          </div>
        </div>
      </div>

      {isAdding && (
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4 md:p-6 mb-6">
          <h3 className="font-bold text-lg mb-4">Tambah Barang Baru</h3>
          <form onSubmit={handleAddSubmit} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Nama Barang *</label>
                <input type="text" name="title" required className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="Contoh: Hotwheels Nissan GTR" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Harga Awal (Rp) *</label>
                <input type="number" name="basePrice" required className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="Contoh: 150000" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Upload Foto *</label>
              <input type="file" name="image" accept="image/*" required className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800 transition-colors" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Deskripsi (Opsional)</label>
              <textarea name="description" rows={2} className="w-full bg-white dark:bg-black border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-black dark:focus:border-white transition-colors" placeholder="Contoh: Kondisi mulus, minus box agak penyok..."></textarea>
            </div>
            <div className="flex justify-end mt-2">
              <button type="submit" disabled={isUploading} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors flex items-center gap-2">
                {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {isUploading ? 'Mengupload...' : 'Upload & Simpan Barang'}
              </button>
            </div>
          </form>
        </div>
      )}
      <div className="w-full overflow-x-auto scroll-smooth custom-scrollbar-top" style={{ transform: 'rotateX(180deg)' }}>
        <div className="inline-block min-w-full max-h-[70vh] overflow-y-auto" style={{ transform: 'rotateX(180deg)' }}>
          <table className="w-full min-w-[800px] text-left text-sm border-collapse">
          <thead className="sticky top-0 bg-white dark:bg-black z-10 shadow-[0_1px_0_rgba(0,0,0,0.1)] dark:shadow-[0_1px_0_rgba(255,255,255,0.1)]">
            <tr className="text-gray-500">
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Barang</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Nama (Bisa diedit)</th>
              <th className="pb-3 px-4 font-semibold uppercase tracking-wider text-xs whitespace-nowrap">Status</th>
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
                  <td className="py-3 px-4">
                    {post.status === 'OPEN' ? (
                      <span className="inline-block bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded text-xs font-bold border border-green-200 dark:border-green-800">
                        READY
                      </span>
                    ) : (
                      <span className="inline-block bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 px-2 py-1 rounded text-xs font-bold border border-red-200 dark:border-red-800 uppercase">
                        TERJUAL
                      </span>
                    )}
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
