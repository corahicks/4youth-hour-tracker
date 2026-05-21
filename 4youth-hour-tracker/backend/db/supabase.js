import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client using credentials from .env
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

export default supabase;
