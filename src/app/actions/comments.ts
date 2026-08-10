'use server';

import { supabaseServer } from '@/lib/supabase-server';
import { verifySession } from '@/app/actions/auth';
import { verifyAdmin } from '@/app/actions/admin';

export async function submitComment(postId: string, content: string) {
  const session = await verifySession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabaseServer
    .from('comments')
    .insert([{ 
      post_id: postId, 
      user_name: session.name, 
      user_phone: session.phone || null, 
      content: content.trim() 
    }]);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await verifySession();
  if (!session) {
    return { error: 'Unauthorized' };
  }

  // Verify ownership or admin
  const isAdmin = await verifyAdmin();
  
  if (!isAdmin) {
    // Check if the comment belongs to the user
    const { data: comment } = await supabaseServer
      .from('comments')
      .select('user_name')
      .eq('id', commentId)
      .single();
      
    if (!comment || comment.user_name !== session.name) {
      return { error: 'Unauthorized to delete this comment' };
    }
  }

  const { error } = await supabaseServer
    .from('comments')
    .delete()
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}
