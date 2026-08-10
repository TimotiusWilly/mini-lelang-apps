'use client';

import { useState } from 'react';
import PostCard from './PostCard';

export default function ClientPostGrid({ 
  posts, 
  userName, 
  userPhone 
}: { 
  posts: any[], 
  userName: string | null, 
  userPhone: string | null 
}) {
  const [searchQuery, setSearchQuery] = useState('');

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
            className="w-full pl-12 pr-4 py-3.5 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-black transition-all shadow-sm shadow-black/5"
          />
          <svg className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Grid */}
      {filteredPosts.length === 0 ? (
        <div className="text-center py-20 bg-white/50 rounded-3xl border border-gray-200 border-dashed">
          <p className="text-gray-500 font-medium">Barang "{searchQuery}" tidak ditemukan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-6">
          {filteredPosts.map((post) => (
            <PostCard key={post.id} post={post} userName={userName} userPhone={userPhone} />
          ))}
        </div>
      )}
    </div>
  );
}
