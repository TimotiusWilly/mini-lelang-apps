import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load variables from .env.local
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ NEXT_PUBLIC_SUPABASE_URL atau SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di .env.local!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function run() {
  console.log('🚀 Memulai migrasi gambar massal ke Supabase Storage...\n');

  // 1. Ambil semua data postingan
  const { data: posts, error } = await supabase.from('posts').select('id, image_url, title');
  if (error) {
    console.error("❌ Gagal mengambil data posts:", error.message);
    return;
  }
  
  console.log(`📦 Ditemukan ${posts.length} barang di database.`);
  let successCount = 0;
  
  for (const post of posts) {
    // Jika link gambarnya masih lokal (dimulai dengan '/')
    if (post.image_url && post.image_url.startsWith('/')) {
      const localPath = path.join(__dirname, 'public', post.image_url);
      
      if (fs.existsSync(localPath)) {
        const fileBuffer = fs.readFileSync(localPath);
        const fileExt = path.extname(post.image_url).slice(1) || 'webp';
        const fileName = path.basename(post.image_url);
        
        console.log(`⏳ Sedang meng-upload: ${post.title} (${fileName})...`);
        
        // 2. Upload file ke Supabase Storage (bucket: lelang-images)
        const { error: uploadError } = await supabase.storage
          .from('lelang-images')
          .upload(`migrated/${fileName}`, fileBuffer, {
            contentType: `image/${fileExt === 'jpg' ? 'jpeg' : fileExt}`,
            upsert: true
          });
          
        if (uploadError) {
          console.error(`   ❌ Gagal upload ${fileName}:`, uploadError.message);
          continue;
        }
        
        // 3. Dapatkan link publik baru
        const { data: { publicUrl } } = supabase.storage
          .from('lelang-images')
          .getPublicUrl(`migrated/${fileName}`);
          
        // 4. Perbarui link di database
        const { error: dbError } = await supabase
          .from('posts')
          .update({ image_url: publicUrl })
          .eq('id', post.id);
          
        if (dbError) {
          console.error(`   ❌ Gagal update database untuk ${post.title}:`, dbError.message);
        } else {
          console.log(`   ✅ Selesai! Link baru: ${publicUrl}`);
          successCount++;
        }
      } else {
        console.log(`   ⚠️ Lewati: File lokal tidak ditemukan untuk ${post.title} -> ${localPath}`);
      }
    } else {
      console.log(`   ⏭️ Lewati: ${post.title} sudah menggunakan link Cloud.`);
    }
  }
  
  console.log(`\n🎉 Migrasi selesai! Berhasil memindahkan ${successCount} gambar ke Cloud.`);
}

run().catch(console.error);
