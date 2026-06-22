import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rvfsvtpdktexqwdjtddt.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ2ZnN2dHBka3RleHF3ZGp0ZGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEwOTcxNDAsImV4cCI6MjA5NjY3MzE0MH0.kHWhvgyTIXa97tAXUqFK07sjwafdTny2J-wVq8HXuS8';

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
);