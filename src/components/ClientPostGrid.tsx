'use client';

import { useState } from 'react';
import PostCard from './PostCard';
import { deletePosts } from '@/app/actions/admin';
import { Loader2, Trash2, X } from 'lucide-react';

export default function ClientPostGrid({ 
  posts, 
  userName, 
  userPhone,
  isAdmin
}: { 
  posts: any[], 
  userName: string | null, 
  userPhone: string | null,
  isAdmin?: boolean
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const toggleSelectPost = (postId: string) => {
    setSelectedPostIds(prev => 
      prev.includes(postId) 
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  const handleBulkDelete = async () => {
    if (selectedPostIds.length === 0) return;
    if (!window.confirm(`Yakin ingin menghapus ${selectedPostIds.length} postingan terpilih secara permanen?`)) return;
    
    setIsBulkDeleting(true);
    const res = await deletePosts(selectedPostIds);
    if (res.error) {
      alert(res.error);
    } else {
      setSelectedPostIds([]);
    }
    setIsBulkDeleting(false);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      {/* Modern Search Bar */}
      <div className="max-w-md mx-auto px-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Cari Hotwheels idamanmu..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3.5 bg-white dark:bg-black/50 border border-gray-200 dark:border-gray-800 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all shadow-sm shadow-black/5 dark:text-white"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white/50 dark:bg-black/50 rounded-3xl border border-gray-200 dark:border-gray-800 border-dashed">
          <p className="text-gray-500 font-medium">Barang "{searchQuery}" tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {filteredPosts.map((post) => (
            <PostCard 
              key={post.id} 
              post={post} 
              userName={userName} 
              userPhone={userPhone} 
              isAdmin={isAdmin}
              isSelected={selectedPostIds.includes(post.id)}
              onToggleSelect={() => toggleSelectPost(post.id)}
            />
          ))}
        </div>
      )}

      {/* Floating Action Bar for Bulk Delete (Admin Only) */}
      {isAdmin && selectedPostIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="bg-black/90 dark:bg-white/90 backdrop-blur-xl border border-white/10 dark:border-black/10 shadow-2xl rounded-full px-4 py-3 flex items-center gap-4 text-white dark:text-black">
            <span className="text-sm font-semibold pl-2">
              {selectedPostIds.length} dipilih
            </span>
            <div className="w-px h-6 bg-white/20 dark:bg-black/20"></div>
            <button
              onClick={handleBulkDelete}
              disabled={isBulkDeleting}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-1.5 rounded-full text-sm font-bold transition-colors disabled:opacity-50"
            >
              {isBulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Hapus
            </button>
            <button
              onClick={() => setSelectedPostIds([])}
              className="p-1.5 hover:bg-white/10 dark:hover:bg-black/10 rounded-full transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
