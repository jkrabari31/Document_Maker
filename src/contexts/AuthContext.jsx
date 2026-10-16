import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from 'firebase/auth';
import {
  doc, getDoc, setDoc, serverTimestamp
} from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);

export function useAuth() {
  return useContext(AuthContext);
}

// Local storage mock helpers for offline / demo mode
const MOCK_USERS_KEY = 'dastavej_mock_users';
const MOCK_LICENSES_KEY = 'dastavej_mock_licenses';
const MOCK_SESSION_KEY = 'dastavej_mock_session';

function getMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY);
    if (!raw) {
      // Default pre-seeded admin user for demo/offline mode
      const initial = [
        {
          uid: 'admin-001',
          email: 'jaimin3460@gmail.com',
          password: 'Rspl@123456789',
          displayName: 'Jaimin (Admin)',
          role: 'admin'
        }
      ];
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw);
    const adminIdx = parsed.findIndex(u => u.email === 'jaimin3460@gmail.com');
    if (adminIdx === -1) {
      parsed.unshift({
        uid: 'admin-001',
        email: 'jaimin3460@gmail.com',
        password: 'Rspl@123456789',
        displayName: 'Jaimin (Admin)',
        role: 'admin'
      });
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(parsed));
    } else {
      parsed[adminIdx].password = 'Rspl@123456789';
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(parsed));
    }
    return parsed;
  } catch {
    return [];
  }
}

function getMockLicenses() {
  try {
    const raw = localStorage.getItem(MOCK_LICENSES_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveMockLicenses(licenses) {
  try {
    localStorage.setItem(MOCK_LICENSES_KEY, JSON.stringify(licenses));
  } catch (err) {
    console.error('Error saving mock licenses:', err);
  }
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [license, setLicense] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch license for user
  async function fetchLicense(userEmail) {
    if (!userEmail) return null;
    const cleanEmail = userEmail.toLowerCase().trim();

    if (isFirebaseConfigured) {
      try {
        const licenseRef = doc(db, 'licenses', cleanEmail);
        const licenseSnap = await getDoc(licenseRef);
        if (licenseSnap.exists()) {
          const data = licenseSnap.data();
          const now = new Date();
          const expiresAt = data.expiresAt?.toDate?.() || new Date(data.expiresAt);
          const isActive = data.status === 'active' && expiresAt > now;
          return {
            ...data,
            expiresAt,
            isActive,
            daysRemaining: Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
          };
        }
        return null;
      } catch (err) {
        console.error('Error fetching Firebase license:', err);
        return null;
      }
    } else {
      // Local demo mode
      const mockLicenses = getMockLicenses();
      const lic = mockLicenses[cleanEmail];
      if (lic) {
        const now = new Date();
        const expiresAt = new Date(lic.expiresAt);
        const isActive = lic.status === 'active' && expiresAt > now;
        return {
          ...lic,
          expiresAt,
          isActive,
          daysRemaining: Math.max(0, Math.ceil((expiresAt - now) / (1000 * 60 * 60 * 24)))
        };
      }
      return null;
    }
  }

  // Sign up with email + password
  async function signup(email, password, displayName) {
    const cleanEmail = email.toLowerCase().trim();

    if (isFirebaseConfigured) {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      await updateProfile(cred.user, { displayName });
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: cleanEmail,
        displayName,
        createdAt: serverTimestamp(),
        role: 'user'
      });
      return cred;
    } else {
      // Mock signup
      const users = getMockUsers();
      if (users.some(u => u.email === cleanEmail)) {
        const err = new Error('આ ઇમેઇલ પહેલેથી રજિસ્ટર્ડ છે');
        err.code = 'auth/email-already-in-use';
        throw err;
      }
      const newUser = {
        uid: 'user-' + Date.now(),
        email: cleanEmail,
        password,
        displayName: displayName || cleanEmail.split('@')[0],
        role: 'user',
        createdAt: new Date().toISOString()
      };
      users.push(newUser);
      localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

      const sessionUser = { uid: newUser.uid, email: newUser.email, displayName: newUser.displayName };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      setLicense(null);
      return { user: sessionUser };
    }
  }

  // Login
  async function login(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    if (isFirebaseConfigured) {
      return signInWithEmailAndPassword(auth, cleanEmail, password);
    } else {
      // Mock login
      const users = getMockUsers();
      const user = users.find(u => u.email === cleanEmail);
      if (!user) {
        const err = new Error('આ ઇમેઇલ સાથે કોઈ એકાઉન્ટ નથી');
        err.code = 'auth/user-not-found';
        throw err;
      }
      if (user.password !== password) {
        const err = new Error('ખોટો પાસવર્ડ');
        err.code = 'auth/wrong-password';
        throw err;
      }
      const sessionUser = { uid: user.uid, email: user.email, displayName: user.displayName };
      localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      const lic = await fetchLicense(cleanEmail);
      setLicense(lic);
      return { user: sessionUser };
    }
  }

  // Reset Password
  async function resetPassword(email) {
    const cleanEmail = email.toLowerCase().trim();
    if (isFirebaseConfigured) {
      return sendPasswordResetEmail(auth, cleanEmail);
    } else {
      const users = getMockUsers();
      const user = users.find(u => u.email === cleanEmail);
      if (!user) {
        const err = new Error('આ ઇમેઇલ સાથે કોઈ એકાઉન્ટ નથી');
        err.code = 'auth/user-not-found';
        throw err;
      }
      return true;
    }
  }

  // Logout
  async function logout() {
    setLicense(null);
    if (isFirebaseConfigured) {
      return signOut(auth);
    } else {
      localStorage.removeItem(MOCK_SESSION_KEY);
      setCurrentUser(null);
    }
  }

  // Check if current user has active premium license
  function isPremium() {
    if (currentUser?.email && ['jaimin3460@gmail.com', 'admin@dastavej.com'].includes(currentUser.email.toLowerCase())) {
      return true;
    }
    return license?.isActive === true;
  }

  // Listen for auth state changes / initialize
  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = onAuthStateChanged(auth, async (user) => {
        setCurrentUser(user);
        if (user?.email) {
          const lic = await fetchLicense(user.email);
          setLicense(lic);
        } else {
          setLicense(null);
        }
        setLoading(false);
      });
      return unsub;
    } else {
      // Restore local mock session
      try {
        const raw = localStorage.getItem(MOCK_SESSION_KEY);
        if (raw) {
          const sessionUser = JSON.parse(raw);
          setCurrentUser(sessionUser);
          if (sessionUser?.email) {
            fetchLicense(sessionUser.email).then(lic => setLicense(lic));
          }
        }
      } catch (err) {
        console.error('Error restoring mock session:', err);
      }
      setLoading(false);
    }
  }, []);

  const value = {
    currentUser,
    license,
    loading,
    signup,
    login,
    resetPassword,
    logout,
    isPremium,
    fetchLicense,
    isFirebaseConfigured,
    refreshLicense: async () => {
      if (currentUser?.email) {
        const lic = await fetchLicense(currentUser.email);
        setLicense(lic);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

