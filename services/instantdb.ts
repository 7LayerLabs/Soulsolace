import { init, tx, id } from '@instantdb/react';
import { Religion } from '../types';

// Initialize InstantDB
// You'll need to replace this with your actual app ID from instantdb.com
const APP_ID = process.env.INSTANTDB_APP_ID || 'your-app-id-here';

type Schema = {
  users: {
    id: string;
    email: string;
    religion?: Religion;
    createdAt: number;
    updatedAt: number;
  };
};

export const db = init<Schema>({ appId: APP_ID });

// Auth helpers
export const useAuth = () => {
  const { isLoading, user, error } = db.useAuth();
  return { isLoading, user, error };
};

export const sendMagicLink = async (email: string) => {
  try {
    await db.auth.sendMagicCode({ email });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const verifyMagicCode = async (email: string, code: string) => {
  try {
    await db.auth.signInWithMagicCode({ email, code });
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const signOut = () => {
  db.auth.signOut();
};

// User preferences
export const useUserPreferences = () => {
  const { user } = useAuth();

  const { isLoading, error, data } = db.useQuery(
    user ? { users: { $: { where: { id: user.id } } } } : null
  );

  const userPrefs = data?.users?.[0];

  return {
    isLoading,
    error,
    religion: userPrefs?.religion as Religion | undefined,
    preferences: userPrefs
  };
};

export const setUserReligion = async (userId: string, religion: Religion) => {
  try {
    await db.transact([
      tx.users[userId].update({
        religion,
        updatedAt: Date.now()
      })
    ]);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const createUserProfile = async (userId: string, email: string) => {
  try {
    await db.transact([
      tx.users[userId].update({
        email,
        createdAt: Date.now(),
        updatedAt: Date.now()
      })
    ]);
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};
