import { createClient } from '@supabase/supabase-js';

// Get these values from your Supabase project settings -> API
const supabaseUrl = 'https://pzppkiwucwxdopggylmd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB6cHBraXd1Y3d4ZG9wZ2d5bG1kIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDU4NTIxNjAsImV4cCI6MjAyMTQyODE2MH0.0e46DXf8EqOK6Z_ThwYdvEi6HQe4E8_3UbYCFY0QH4E';

export const supabase = createClient(supabaseUrl, supabaseKey);