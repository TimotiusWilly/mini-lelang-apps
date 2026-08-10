'use server';

import { supabaseServer as supabase } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

import { verifySession } from '@/app/actions/auth';

// Helper to verify admin
export async function verifyAdmin() {
  const session = await verifySession();
  return session?.role === 'admin' || session?.name === 'WillyAdmin';
}

export async function updatePost(postId: string, title: string, basePrice: number) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('posts')
    .update({ title, base_price: basePrice })
    .eq('id', postId);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/'); // Refresh homepage cache
  revalidatePath('/admin');
  return { success: true };
}

export async function approveWinner(commentId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_winner: true })
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
