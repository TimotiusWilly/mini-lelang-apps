    -- SECURITY MIGRATION: Enable Row Level Security (RLS)
    -- Run this script in your Supabase SQL Editor to secure your database!

    -- 1. Enable RLS on all tables
    ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
    ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

    -- 2. Create Policies for 'users' table
    -- The users table is completely blocked from the client.
    -- Server Actions bypass RLS to perform login and registration securely.

    -- 3. Create Policies for 'posts' table
    -- Allow anyone to read active posts
    DROP POLICY IF EXISTS "Allow public read posts" ON public.posts;
    CREATE POLICY "Allow public read posts" 
    ON public.posts FOR SELECT 
    USING (true);

    -- 4. Create Policies for 'comments' table
    -- Allow anyone to read comments (required for Live Comments and UI)
    DROP POLICY IF EXISTS "Allow public read comments" ON public.comments;
    CREATE POLICY "Allow public read comments" 
    ON public.comments FOR SELECT 
    USING (true);

    -- IMPORTANT: 
    -- We DO NOT create any policies for INSERT, UPDATE, or DELETE!
    -- Because RLS is default-deny for operations without policies, 
    -- this means NO ONE (including hackers with the anon key) can insert or delete data directly from the client.
    -- Our new Next.js Server Actions use the SUPABASE_SERVICE_ROLE_KEY to securely bypass RLS and insert/delete data only after verifying the JWT Session!
