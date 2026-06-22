require('dotenv').config();
const { supabaseAdmin } = require('./src/config/supabase');

async function checkUsers() {
  try {
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .limit(5);
    
    if (error) throw error;
    console.log('Registered Users in DB:');
    console.log(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
  }
}

checkUsers();
