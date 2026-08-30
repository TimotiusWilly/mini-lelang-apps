'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { submitComment, deleteComment } from '@/app/actions/comments';

type Comment = {
  id: string;
  user_name: string;
  content: string;
  is_winner?: boolean;
  created_at: string;
};

export default function LiveComments({ postId, userName, userPhone }: { postId: string, userName: string | null, userPhone?: string | null }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch initial comments
    const fetchComments = async () => {
      const { data } = await supabase
        .from('comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });
      
      if (data) setComments(data);
    };

    fetchComments();

    // Subscribe to global real-time event (multiplexed by GlobalRealtime)
    const handleRealtime = (e: Event) => {
      const customEvent = e as CustomEvent;
      const payload = customEvent.detail;
      
      if (payload.eventType === 'INSERT' && payload.new.post_id === postId) {
        setComments((prev: Comment[]) => [...prev, payload.new as Comment]);
      } else if (payload.eventType === 'DELETE' && payload.old) {
        setComments((prev: Comment[]) => prev.filter((c: Comment) => c.id !== payload.old.id));
      } else if (payload.eventType === 'UPDATE' && payload.new.post_id === postId) {
        setComments((prev: Comment[]) => prev.map((c: Comment) => c.id === payload.new.id ? (payload.new as Comment) : c));
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('supabase_comments_change', handleRealtime);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('supabase_comments_change', handleRealtime);
      }
    };
  }, [postId]);

  // Removed auto-scroll to bottom so the fastest (first) commenter stays visible at the top.

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userName || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await submitComment(postId, newComment);
    
    if (!error) {
      setNewComment('');
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (commentId: string) => {
    await deleteComment(commentId);
  };

  // Determine actual winner
  const explicitWinner = comments.find((c: Comment) => c.is_winner);
  const firstBook = comments.find((c: Comment) => {
    const text = c.content.toLowerCase();
    return /\b(book|buk|b)\b/.test(text);
  });
  
  const winnerId = explicitWinner ? explicitWinner.id : firstBook?.id;

  return (
    <div className="flex flex-col h-[200px] md:h-[300px] border-t border-gray-100 dark:border-gray-800 pt-2 md:pt-4">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-3 pr-2 scroll-smooth"
      >
        <AnimatePresence>
          {comments.map((comment: Comment) => {
            const isWinner = comment.id === winnerId;
            
            return (
            <motion.div 
              key={comment.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`text-[10px] md:text-sm rounded-md md:rounded-lg px-2 py-1.5 md:px-3 md:py-2 ${
                isWinner 
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 shadow-sm' 
                  : 'bg-gray-50 dark:bg-gray-900'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-1 mb-0.5">
                    {isWinner && (
                      <span className="text-[10px] md:text-xs mr-1" title="Tercepat (Pemenang)">👑</span>
                    )}
                    <span className={`font-bold truncate max-w-[60px] ${isWinner ? 'text-yellow-700 dark:text-yellow-500' : 'text-black dark:text-white'}`}>
                      {comment.user_name}
                    </span>
                    <span className="text-[8px] md:text-[10px] text-gray-400">
                      {new Date(comment.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' })}
                    </span>
                  </div>
                  <div className="text-gray-700 dark:text-gray-300 break-words text-[9px] md:text-sm">
                    {(() => {
                      const contentLower = comment.content.toLowerCase();
                      if (/\b(book|buk|b)\b/.test(contentLower)) {
                        return <span className="font-bold text-black dark:text-white bg-gray-200 dark:bg-gray-800 px-1.5 py-0.5 rounded uppercase text-[8px] md:text-xs">{comment.content}</span>;
                      } else if (contentLower.includes('nego') || contentLower.includes('try')) {
                        return <span className="font-bold text-yellow-800 bg-yellow-200 dark:text-yellow-200 dark:bg-yellow-900 px-1.5 py-0.5 rounded text-[8px] md:text-xs">"{comment.content}"</span>;
                      }
                      return comment.content;
                    })()}
                  </div>
                </div>
                {(userName === comment.user_name || userName === 'WillyAdmin') && (
                  <button 
                    onClick={() => handleDelete(comment.id)}
                    className="text-red-500 hover:text-red-700 opacity-50 hover:opacity-100 p-0.5 ml-1 transition-opacity"
                    title="Hapus komentar"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                  </button>
                )}
              </div>
            </motion.div>
          )})}
          {comments.length === 0 && (
            <div className="text-gray-400 text-[10px] md:text-xs italic text-center mt-6 md:mt-10">Belum ada komentar.</div>
          )}
        </AnimatePresence>
      </div>

      <div className="mt-2 md:mt-4 pt-2 md:pt-4 border-t border-gray-100 dark:border-gray-800">
        {userName ? (
          <form onSubmit={handleSubmit} className="flex flex-col xl:flex-row gap-1.5 md:gap-2">
            <input 
              type="text" 
              value={newComment}
              onChange={(e: any) => setNewComment(e.target.value)}
              placeholder="Ketik 'book' atau 'nego 50k'"
              className="flex-1 w-full text-[9px] md:text-sm px-1.5 md:px-4 py-1.5 md:py-2 rounded border border-gray-200 dark:border-gray-800 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-black dark:focus:ring-white transition-all"
            />
            <button 
              type="submit" 
              disabled={isSubmitting || !newComment.trim()}
              className="w-full xl:w-auto bg-black text-white dark:bg-white dark:text-black px-1.5 md:px-4 py-1 md:py-2 rounded text-[9px] md:text-sm font-semibold disabled:opacity-50 transition-opacity"
            >
              Kirim
            </button>
          </form>
        ) : (
          <div className="text-center text-[10px] md:text-sm text-gray-500">
            <a href="/login" className="font-bold underline text-black dark:text-white">Login</a> u/ komen
          </div>
        )}
      </div>
    </div>
  );
}
