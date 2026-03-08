import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { auth, db } from '../lib/firebase';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  updateProfile as updateFirebaseAuthProfile,
  signInWithPopup,
  GoogleAuthProvider
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Helper to prevent Firestore from hanging forever if not initialized in console
const withTimeout = (promise, ms = 4000) => {
  return Promise.race([
    promise,
    new Promise((_, reject) => setTimeout(() => reject(new Error('firestore-timeout')), ms))
  ]);
};

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await withTimeout(getDoc(docRef));
          
          if (docSnap.exists()) {
            const profileData = docSnap.data();
            setUser({
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email,
              ...profileData
            });
          } else {
            // Safe fallback if Firestore document is somehow missing
            setUser({
              uid: firebaseUser.uid,
              id: firebaseUser.uid,
              email: firebaseUser.email,
              name: firebaseUser.displayName || 'User',
              role: 'resident',
            });
          }
        } catch (err) {
          console.warn("Firestore profile fetch delayed/failed. Resolving with safe fallback. Ensure Firestore is enabled in Firebase Console.", err);
          // Safe fallback so the user can still log in and use the app
          setUser({
            uid: firebaseUser.uid,
            id: firebaseUser.uid,
            email: firebaseUser.email,
            name: firebaseUser.displayName || 'User',
            role: 'resident',
          });
        }
      } else {
        setUser(null);
      }
      setIsInitializing(false);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged will handle finishing the loading state
      return true;
    } catch (err) {
      setError(mapAuthError(err.code));
      setLoading(false);
      return false;
    }
  }, []);

  const loginWithGoogle = useCallback(async (roleFallback = 'resident') => {
    setLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      // Check if user document exists in Firestore (with timeout)
      const docRef = doc(db, 'users', firebaseUser.uid);
      const docSnap = await withTimeout(getDoc(docRef));

      if (!docSnap.exists()) {
        // Create it if it doesn't exist (first-time login via Google)
        const userRecord = {
          name: firebaseUser.displayName || 'Google User',
          email: firebaseUser.email,
          role: roleFallback, // Can be provided by register flow step 1
          unit: null,
          status: 'active',
          provider: 'google',
          createdAt: new Date().toISOString()
        };
        await withTimeout(setDoc(docRef, userRecord));
      }
      
      // State updated via onAuthStateChanged
      return true;
    } catch (err) {
      if (err.message === 'firestore-timeout') {
         setError('Firestore database is not initialized. Please enable it in Firebase Console.');
      } else {
         setError(mapAuthError(err.code));
      }
      setLoading(false);
      return false;
    }
  }, []);

  const register = useCallback(async (data) => {
    setLoading(true);
    setError(null);
    try {
      // 1. Create Firebase Auth user
      const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
      const firebaseUser = userCredential.user;

      // 2. Update Auth display name
      await updateFirebaseAuthProfile(firebaseUser, { displayName: data.name });

      // 3. Create Firestore user document
      const userRecord = {
        name: data.name,
        email: data.email,
        role: data.role,
        unit: data.role === 'resident' ? data.unit : null,
        phone: data.phone || null,
        status: 'active',
        provider: 'email',
        createdAt: new Date().toISOString()
      };
      
      await withTimeout(setDoc(doc(db, 'users', firebaseUser.uid), userRecord));
      
      return true;
    } catch (err) {
      if (err.message === 'firestore-timeout') {
         setError('Firestore database is not initialized. Please enable it in Firebase Console.');
      } else {
         setError(mapAuthError(err.code));
      }
      setLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout Error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const resetPassword = useCallback(async (email) => {
    setLoading(true);
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email);
      setLoading(false);
      return true;
    } catch (err) {
      setError(mapAuthError(err.code));
      setLoading(false);
      return false;
    }
  }, []);

  const value = {
    user,
    loading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    setError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitializing ? (
        <div className="min-h-screen bg-bg flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
};

// Helper to map error codes to human-readable text
function mapAuthError(code) {
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-login-credentials':
      return 'Invalid email or password.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before finishing.';
    case 'auth/account-exists-with-different-credential':
      return 'An account already exists with the same email address but different sign-in credentials.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    default:
      console.error("Firebase auth error code:", code);
      return 'An unexpected error occurred. Please try again.';
  }
}
