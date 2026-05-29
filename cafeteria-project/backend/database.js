require('dotenv').config({ path: require('path').resolve(__dirname, '.env') });
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
// Service role bypasses RLS for server-side writes (notifications, etc.)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    'Missing SUPABASE_URL or SUPABASE_ANON_KEY (or SUPABASE_SERVICE_ROLE_KEY). ' +
      'Set them in backend/.env locally or in Vercel → Settings → Environment Variables.'
  );
  // Do not process.exit on serverless (Vercel) — it breaks every API route
  if (!process.env.VERCEL) {
    process.exit(1);
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;
