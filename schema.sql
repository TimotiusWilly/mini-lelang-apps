-- Execute this SQL in your Supabase SQL Editor

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Create Posts Table
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  base_price NUMERIC,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'booked', 'sold')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Create Comments Table
CREATE TABLE IF NOT EXISTS public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  content TEXT NOT NULL,
  is_winner BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enable Realtime for comments and posts
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.posts;

-- 5. Insert some dummy data for posts (200 photos requested, here we insert a few for testing)
INSERT INTO public.posts (title, description, image_url, base_price, status)
VALUES 
('Vintage Jacket', 'Jaket vintage kondisi 9/10', 'https://images.unsplash.com/photo-1551028719-01c1eb562a11?w=500&q=80', 150000, 'active'),
('Classic Sneakers', 'Sepatu klasik ukuran 42', 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=500&q=80', 200000, 'active'),
('Analog Watch', 'Jam tangan analog pria', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&q=80', 350000, 'active'),
('Denim Jeans', 'Celana jeans biru ukuran 32', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&q=80', 100000, 'active');
