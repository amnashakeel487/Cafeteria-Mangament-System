import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nvfjbaunuzkarcizqhfu.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im52ZmpiYXVudXprYXJjaXpxaGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ4MzcyMjksImV4cCI6MjA5MDQxMzIyOX0.QiLQU9rJxlmr2ITXlW6KWfv-n2KRrl9_kyjdk5nsdcY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
export const BUCKET = 'cafeteria_uploads';
