'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function GlobalRealtime() {
  useEffect(() => {
    const channel = supabase
      .channel('global_comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, (payload) => {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('supabase_comments_change', { detail: payload }));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return null;
}
