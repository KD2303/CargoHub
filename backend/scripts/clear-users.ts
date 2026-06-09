import dotenv from 'dotenv';
dotenv.config();

import { supabase } from '../src/config/supabase';
import { auth } from '../src/config/firebase';

async function clearUsers() {
  console.log('Starting user cleanup...');
  
  // 1. Delete all users from Supabase 'users' table
  const { data, error } = await supabase.from('users').delete().neq('firebase_uid', '000');
  
  if (error) {
    console.error('Error deleting from Supabase users table:', error.message);
  } else {
    console.log('Successfully cleared users from Supabase.');
  }

  // 2. Optionally clear from Firebase Auth if admin is initialized
  try {
    if (auth) {
      const listUsersResult = await auth.listUsers(1000);
      const uids = listUsersResult.users.map((userRecord) => userRecord.uid);
      if (uids.length > 0) {
        await auth.deleteUsers(uids);
        console.log(`Successfully deleted ${uids.length} users from Firebase Auth.`);
      } else {
        console.log('No users found in Firebase Auth to delete.');
      }
    }
  } catch (err: any) {
    console.error('Error clearing Firebase Auth:', err.message);
  }

  console.log('Cleanup finished.');
}

clearUsers().catch(console.error);
