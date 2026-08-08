const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetCoins() {
  const today = new Date().toISOString().split('T')[0];
  const email = process.argv[2] || 'bruafo94@gmail.com';

  console.log('Looking for user:', email);

  // Find the user by email
  const { data: profiles, error: findError } = await supabase
    .from('profiles')
    .select('id, email, coins, coins_reset_at')
    .ilike('email', `%${email.split('@')[0]}%`);

  if (findError) {
    console.error('Find error:', findError);
    return;
  }

  console.log('Found profiles:', profiles);

  if (!profiles || profiles.length === 0) {
    console.log('No profiles found');
    return;
  }

  for (const profile of profiles) {
    console.log(`Resetting coins for ${profile.email} (current: ${profile.coins})...`);

    const { data, error } = await supabase
      .from('profiles')
      .update({ coins: 5, coins_reset_at: today })
      .eq('id', profile.id)
      .select('id, email, coins, coins_reset_at');

    if (error) {
      console.error('Update error:', error);
    } else {
      console.log('✅ Reset complete:', data[0]);
    }
  }
}

resetCoins().catch(console.error);
