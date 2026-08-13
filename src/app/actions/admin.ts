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

  // Find the comment first to get its post_id
  const { data: comment, error: fetchError } = await supabase
    .from('comments')
    .select('post_id')
    .eq('id', commentId)
    .single();

  if (fetchError || !comment) {
    return { error: fetchError?.message || 'Comment not found' };
  }

  // Reset all comments for this post so there is only one winner
  await supabase
    .from('comments')
    .update({ is_winner: false })
    .eq('post_id', comment.post_id);

  const { error } = await supabase
    .from('comments')
    .update({ is_winner: true })
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function revokeWinner(commentId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_winner: false })
    .eq('id', commentId);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateInvoiceStatus(userName: string, isPaid: boolean) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const { error } = await supabase
    .from('comments')
    .update({ is_paid: isPaid })
    .eq('user_name', userName);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function addPost(formData: FormData) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const basePrice = Number(formData.get('basePrice'));
  const file = formData.get('image') as File;

  if (!title || !file || file.size === 0) {
    return { error: 'Judul dan Foto wajib diisi' };
  }

  try {
    // 1. Upload File to Supabase Storage
    const fileExt = file.name.split('.').pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { error: uploadError } = await supabase.storage
      .from('lelang-images')
      .upload(fileName, buffer, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      return { error: `Gagal upload gambar: ${uploadError.message}` };
    }

    // 2. Get Public URL
    const { data: { publicUrl } } = supabase.storage
      .from('lelang-images')
      .getPublicUrl(fileName);

    // 3. Insert Post to Database
    const { error: dbError } = await supabase
      .from('posts')
      .insert([{
        title,
        description: description || '',
        base_price: basePrice || 0,
        image_url: publicUrl,
        status: 'OPEN'
      }]);

    if (dbError) {
      return { error: `Gagal menyimpan data: ${dbError.message}` };
    }

    revalidatePath('/');
    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { error: err.message || 'Terjadi kesalahan sistem' };
  }
}

export async function markItemAsSoldManually(postId: string, price: number, userName: string, userPhone: string = '') {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { error: 'Unauthorized' };
  }

  const content = `nego ${price} (manual offline)`;

  const { error } = await supabase
    .from('comments')
    .insert([{
      post_id: postId,
      user_name: userName,
      user_phone: userPhone,
      content: content,
      is_winner: true,
    }]);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/');
  revalidatePath('/admin');
  return { success: true };
}
