import { useState, useEffect } from 'react';
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { firestore } from '@/lib/firebase';
import { create } from 'zustand';

interface AuthUser extends User {
  role?: 'student' | 'teacher';
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: 'student' | 'teacher') => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  error: null,
  signIn: async (email: string, password: string) => {
    try {
      set({ loading: true, error: null });
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signUp: async (email: string, password: string, role: 'student' | 'teacher') => {
    try {
      set({ loading: true, error: null });
      const auth = getAuth();
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Create user profile in Firestore
      await setDoc(doc(firestore, 'users', user.uid), {
        email: user.email,
        role,
        createdAt: new Date().toISOString(),
      });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signOut: async () => {
    try {
      set({ loading: true, error: null });
      const auth = getAuth();
      await firebaseSignOut(auth);
      set({ user: null });
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  signInWithGoogle: async () => {
    try {
      set({ loading: true, error: null });
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(firestore, 'users', user.uid));
      if (!userDoc.exists()) {
        // Create new user profile
        await setDoc(doc(firestore, 'users', user.uid), {
          email: user.email,
          role: 'student', // Default role
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      set({ error: (error as Error).message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

// Initialize auth state listener
const auth = getAuth();
onAuthStateChanged(auth, async (user) => {
  if (user) {
    // Get additional user data from Firestore
    const userDoc = await getDoc(doc(firestore, 'users', user.uid));
    const userData = userDoc.data();
    const authUser: AuthUser = user;
    authUser.role = userData?.role;
    useAuth.setState({ user: authUser, loading: false });
  } else {
    useAuth.setState({ user: null, loading: false });
  }
}); 