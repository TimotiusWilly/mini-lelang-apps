import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const SOURCE_DIR = path.join(process.cwd(), 'Hotwheels');
const DEST_DIR = path.join(process.cwd(), 'public', 'lelang-images');

async function processImages() {
  if (!fs.existsSync(DEST_DIR)) {
    fs.mkdirSync(DEST_DIR, { recursive: true });
  }

  // Clear existing posts to prevent duplicates
  console.log("Clearing old data in Supabase...");
  const { error: deleteError } = await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  if (deleteError) {
    console.error("Failed to clear old posts:", deleteError);
  }

  const files = fs.readdirSync(SOURCE_DIR).filter(file => file.toLowerCase().endsWith('.jpg') || file.toLowerCase().endsWith('.jpeg') || file.toLowerCase().endsWith('.png'));
  console.log(`Found ${files.length} images to process.`);

  const batchSize = 10; // Process 10 at a time to prevent memory issues and rate limits
  let count = 0;

  for (let i = 0; i < files.length; i += batchSize) {
    const batch = files.slice(i, i + batchSize);
    
    await Promise.all(batch.map(async (file) => {
      try {
        const sourcePath = path.join(SOURCE_DIR, file);
        const filenameWithoutExt = path.parse(file).name;
        const destFilename = `${filenameWithoutExt}.webp`;
        const destPath = path.join(DEST_DIR, destFilename);
        
        // 1. Convert to webp
        await sharp(sourcePath)
          .webp({ quality: 80 })
          .toFile(destPath);

        // 2. Insert to Supabase
        const { error } = await supabase.from('posts').insert([{
          title: `Hotwheels Lelang - ${filenameWithoutExt}`,
          description: 'Lelang Hotwheels By Willy. Harga NET dan siap resell.',
          image_url: `/lelang-images/${destFilename}`,
          base_price: 50000,
          status: 'active'
        }]);

        if (error) {
          console.error(`Error inserting ${destFilename} into Supabase:`, error.message);
        } else {
          count++;
          console.log(`[${count}/${files.length}] Converted and inserted: ${destFilename}`);
        }
      } catch (err) {
        console.error(`Error processing file ${file}:`, err);
      }
    }));
  }
  
  console.log("Processing complete!");
}

processImages();
