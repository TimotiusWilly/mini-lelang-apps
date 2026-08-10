-- SECURITY MIGRATION: Enable Supabase Storage for Images
-- Run this script in your Supabase SQL Editor to create the Storage Bucket

-- 1. Create a new storage bucket named 'lelang-images'
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lelang-images', 'lelang-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to view/read the images
DROP POLICY IF EXISTS "Give public access to lelang-images" ON storage.objects;
CREATE POLICY "Give public access to lelang-images" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'lelang-images');

-- Note: We do NOT need INSERT/UPDATE/DELETE policies for the client.
-- Uploading images will be handled entirely via our Next.js Server Actions 
-- using the SUPABASE_SERVICE_ROLE_KEY, ensuring only Admins can upload!
