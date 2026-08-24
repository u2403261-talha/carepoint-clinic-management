import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, signInWithPopup, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signIn: (role?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (email: string, pass: string, name: string, role?: string) => Promise<any>;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signIn: async () => {},
  signInWithEmail: async () => {},
  registerWithEmail: async () => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const token = await currentUser.getIdToken();
          if (sessionStorage.getItem('is_registering')) { setLoading(false); return; }
          const intendedRole = sessionStorage.getItem('intended_role');
          const doctorData = sessionStorage.getItem('doctor_registration_data');
          const pendingName = sessionStorage.getItem('pending_registration_name');
          
          // Sync profile to our DB
          const res = await fetch('/api/auth/sync', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              name: pendingName || currentUser.displayName || currentUser.email?.split('@')[0],
              role: intendedRole || undefined,
              doctorData: doctorData ? JSON.parse(doctorData) : undefined
            })
          });
          if (res.ok) {
            const data = await res.json();
            setProfile(data);
            sessionStorage.removeItem('intended_role');
            sessionStorage.removeItem('doctor_registration_data');
            sessionStorage.removeItem('pending_registration_name');
      sessionStorage.removeItem('is_registering');
          }
        } catch (error) {
          console.error("Failed to sync profile:", error);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signIn = async (role?: string) => {
    if (role) {
      sessionStorage.setItem('intended_role', role);
    }
    await signInWithPopup(auth, googleAuthProvider);
  };

  const signInWithEmail = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const registerWithEmail = async (email: string, pass: string, name: string, role?: string) => {
    if (role) sessionStorage.setItem('intended_role', role);
    sessionStorage.setItem('pending_registration_name', name);
    sessionStorage.setItem('is_registering', 'true');
    
    let userCredential;
    try {
      userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    } catch (e: any) {
      sessionStorage.removeItem('is_registering');
      throw e;
    }
    
    try {
      await updateProfile(userCredential.user, { displayName: name });
    } catch (e) {
      console.warn('Failed to update profile name', e);
    }

    try {
      const token = await userCredential.user.getIdToken();
      const doctorDataStr = sessionStorage.getItem('doctor_registration_data');
      
      const res = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name: name,
          role: role,
          doctorData: doctorDataStr ? JSON.parse(doctorDataStr) : undefined
        })
      });

      if (!res.ok) {
        let errMessage = 'Unknown error';
        try {
          const errData = await res.json();
          errMessage = errData.error || errMessage;
        } catch (jsonErr) {}
        throw new Error(`Database Profile Creation Failed: ${errMessage}`);
      }

      const data = await res.json();
      setProfile(data);
      sessionStorage.removeItem('intended_role');
      sessionStorage.removeItem('doctor_registration_data');
      sessionStorage.removeItem('pending_registration_name');
      return data;
    } catch (error: any) {
      // If the error doesn't already start with Database Profile Creation Failed
      if (error.message.startsWith('Database Profile Creation Failed')) {
        sessionStorage.removeItem('is_registering');
        throw error;
      }
      sessionStorage.removeItem('is_registering');
      throw new Error(`Database Error: ${error.message}`);
    }
  };

  const logOut = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signInWithEmail, registerWithEmail, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
