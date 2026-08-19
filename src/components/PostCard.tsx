'use client';

import { useState } from 'react';
import Image from 'next/image';
import LiveComments from './LiveComments';
import { Clock, Trash2, Loader2, RotateCw } from 'lucide-react';
import { deletePost, rotatePostImage } from '@/app/actions/admin';

type Post = {
  id: string;
  title: string;
  description: string;
  image_url: string;
  base_price: number;
  status: string;
  created_at: string;
};

export default function PostCard({ 
  post, 
  userName, 
  userPhone, 
  isAdmin,
  isSelected,
  onToggleSelect
}: { 
  post: Post, 
  userName: string | null, 
  userPhone?: string | null, 
  isAdmin?: boolean,
  isSelected?: boolean,
  onToggleSelect?: () => void
}) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRotating, setIsRotating] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Yakin ingin menghapus postingan ini secara permanen?')) return;
    
    setIsDeleting(true);
    const res = await deletePost(post.id);
    if (res.error) {
      alert(res.error);
      setIsDeleting(false);
    }
  };

  const handleRotate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRotating(true);
    const res = await rotatePostImage(post.id);
    if (res.error) {
      alert(res.error);
    }
    setIsRotating(false);
  };

  // Format price
  const formattedPrice = new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(post.base_price);

  return (
    <>
      <div className={`glass-panel rounded-2xl overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-2xl ${isSelected ? 'ring-4 ring-blue-500 shadow-xl' : ''}`}>
        <div 
          className="relative aspect-[3/4] w-full overflow-hidden bg-gray-100 dark:bg-gray-900 cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onClick={() => setIsZoomed(true)}
        >
          <Image
            src={post.image_url}
            alt={post.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {isAdmin && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-20 flex flex-col gap-2">
              <div className="flex gap-2">
                <input 
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => onToggleSelect && onToggleSelect()}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 md:w-6 md:h-6 rounded-md border-2 border-white shadow-lg cursor-pointer accent-blue-600 bg-black/30 backdrop-blur-sm"
                />
                <button
                  onClick={handleRotate}
                  disabled={isRotating}
                  className="bg-black/50 hover:bg-black/80 backdrop-blur-sm text-white p-1 rounded-md shadow-lg transition-colors disabled:opacity-50 flex items-center justify-center w-5 h-5 md:w-6 md:h-6"
                  title="Putar Foto 90 Derajat"
                >
                  {isRotating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCw className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="bg-black/80 backdrop-blur-md text-white text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                {post.status}
              </div>
            </div>
          )}
          {!isAdmin && (
            <div className="absolute top-2 left-2 md:top-4 md:left-4 bg-black/80 backdrop-blur-md text-white text-[9px] md:text-xs font-bold px-2 py-1 md:px-3 md:py-1.5 rounded-full uppercase tracking-wider z-10 shadow-lg">
              {post.status}
            </div>
          )}
          
          {isAdmin && (
            <button 
              onClick={handleDelete}
              disabled={isDeleting}
              className="absolute top-2 right-2 md:top-4 md:right-4 bg-red-600/90 hover:bg-red-700 text-white p-1.5 md:p-2 rounded-full backdrop-blur-md z-20 transition-colors disabled:opacity-50"
              title="Hapus Postingan"
            >
              {isDeleting ? <Loader2 className="w-3.5 h-3.5 md:w-4 md:h-4 animate-spin" /> : <Trash2 className="w-3.5 h-3.5 md:w-4 md:h-4" />}
            </button>
          )}
        </div>

        <div className="p-2 md:p-5 flex flex-col flex-1 bg-white/50 dark:bg-black/50">
          <div className="mb-2 md:mb-4">
            <h2 className="text-xs md:text-xl font-bold mb-0.5 md:mb-1 leading-tight line-clamp-2 md:line-clamp-none">{post.title}</h2>
            <p className="hidden md:block text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{post.description}</p>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-4">
            <div className="text-[9px] md:text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wider mb-0.5 md:mb-0">Harga Awal</div>
            <div className="text-sm md:text-lg font-bold text-black dark:text-white">{formattedPrice}</div>
          </div>

          {/* Live Comments Section */}
          <LiveComments postId={post.id} userName={userName} userPhone={userPhone} />
        </div>
      </div>

      {/* Hover Modal for 8x Pop Out (Desktop Only, Disabled for Admins to prevent checkbox conflict) */}
      {isHovered && !isZoomed && !isAdmin && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-300 hidden md:flex">
           <div className="relative w-[80vw] h-[80vh] animate-in zoom-in duration-300">
              <Image
                src={post.image_url}
                alt={post.title}
                fill
                className="object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.5)]"
                sizes="80vw"
              />
           </div>
        </div>
      )}

      {/* Click Modal for Interactive Zoom */}
      {isZoomed && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 backdrop-blur-xl cursor-zoom-out p-4 md:p-12 animate-in fade-in duration-300"
          onClick={() => setIsZoomed(false)}
        >
          <div className="relative w-full h-full max-w-7xl animate-in zoom-in duration-300">
            <Image
              src={post.image_url}
              alt={post.title}
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>
        </div>
      )}
    </>
  );
}
