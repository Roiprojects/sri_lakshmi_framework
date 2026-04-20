const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ytajatxcbryruoqxkldb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl0YWphdHhjYnJ5cnVvcXhrbGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUxMjAzNjcsImV4cCI6MjA5MDY5NjM2N30.mCJHKI8ixpzZRvWGo0bKUz8Q_b6GjTX_SEIKYtPnw7o';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('Testing Supabase connection...');
    const { data, error } = await supabase.from('categories').select('*').limit(1);
    if (error) {
        console.error('Supabase Error:', error);
    } else {
        console.log('Supabase Success:', data);
    }
}

test();
