'use server';

import { supabaseServer as supabase } from '@/lib/supabase-server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const getJwtSecret = () => new TextEncoder().encode(process.env.JWT_SECRET || 'fallback_willy_consign_secret_key_2026');

export async function login(formData: FormData) {
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;
  const phone = formData.get('phone') as string;
  const isRegister = formData.get('isRegister') === 'true';

  if (!name || !password || (isRegister && !phone)) {
    return { error: 'Nama, password, dan nomor HP wajib diisi.' };
  }

  let finalPhone = phone;
  let userId = '';

  if (isRegister) {
    // Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('name', name)
      .single();

    if (existingUser) {
      return { error: 'Nama sudah digunakan. Silakan login.' };
    }

    // Check if phone already exists
    const { data: existingPhone } = await supabase
      .from('users')
      .select('id')
      .eq('phone', phone)
      .single();
      
    if (existingPhone) {
      return { error: 'Nomor HP ini sudah digunakan oleh akun lain.' };
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const { data: newUser, error: insertError } = await supabase
      .from('users')
      .insert([{ name, password: hashedPassword, phone }])
      .select('id')
      .single();

    if (insertError || !newUser) {
      return { error: 'Gagal mendaftar: ' + (insertError?.message || 'Unknown Error') };
    }
    userId = newUser.id;

  } else {
    // Login
    const { data: user, error } = await supabase
      .from('users')
      .select('id, name, phone, password')
      .eq('name', name)
      .single();

    if (error || !user) {
      return { error: 'Nama atau password salah.' };
    }
    
    // Verify password (with fallback for old plaintext passwords)
    let isValid = false;
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$')) {
      isValid = await bcrypt.compare(password, user.password);
    } else {
      isValid = (password === user.password);
      // Auto-migrate plaintext to hashed
      if (isValid) {
        const hashed = await bcrypt.hash(password, 10);
        await supabase.from('users').update({ password: hashed }).eq('id', user.id);
      }
    }

    if (!isValid) {
      return { error: 'Nama atau password salah.' };
    }

    userId = user.id;
    
    // Strict Phone Number Validation
    if (name === 'WillyAdmin') {
      finalPhone = ''; // Admin doesn't need phone
    } else if (user.phone) {
      if (phone && phone !== user.phone) {
        return { error: 'Nomor HP yang dimasukkan tidak cocok dengan data akun ini.' };
      }
      finalPhone = user.phone;
    } else {
      // Old user with null phone
      if (!phone) {
        return { error: 'Akun Anda belum memiliki Nomor HP. Silakan isi kolom Nomor HP untuk melanjutkan.' };
      }
      // Check if someone else is already using this phone
      const { data: existingPhone } = await supabase
        .from('users')
        .select('id')
        .eq('phone', phone)
        .single();
        
      if (existingPhone) {
        return { error: 'Nomor HP ini sudah terdaftar pada akun lain.' };
      }
      
      // Save it to DB for future
      await supabase.from('users').update({ phone }).eq('id', user.id);
      finalPhone = phone;
    }
  }

  // Create JWT Token
  const token = await new SignJWT({ 
    sub: userId, 
    name, 
    phone: finalPhone, 
    role: name === 'WillyAdmin' ? 'admin' : 'user' 
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret());

  // Set highly secure cookie
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
    sameSite: 'lax'
  });

  // Remove old insecure cookies if they exist
  cookieStore.delete('auth_user');
  cookieStore.delete('auth_user_phone');

  redirect('/');
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete('auth_token');
  redirect('/login');
}

export async function verifySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    return payload as { sub: string; name: string; phone: string; role: string };
  } catch (err) {
    return null; // Invalid or expired token
  }
}

export async function getUser() {
  const session = await verifySession();
  return session?.name || null;
}

export async function getUserPhone() {
  const session = await verifySession();
  return session?.phone || null;
}
