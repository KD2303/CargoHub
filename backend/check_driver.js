const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function checkDrivers() {
  const { data: users, error: uErr } = await supabase.from('users').select('*');
  console.log('--- USERS ---');
  console.log(users);

  const { data: drivers, error: dErr } = await supabase.from('drivers').select('*');
  console.log('--- DRIVERS ---');
  console.log(drivers);

  const { data: bookings, error: bErr } = await supabase.from('bookings').select('*');
  console.log('--- BOOKINGS ---');
  console.log(bookings);
}

checkDrivers();
