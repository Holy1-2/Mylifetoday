import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from 'firebase/auth';
import {
  loginUser,
  logoutUser,
  observeAuth,
  registerUser,
  resetUserPassword,
} from '../services/firebaseService';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string, name?: string) => Promise<User>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = observeAuth((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  const signIn = useCallback(
    (email: string, password: string) => loginUser(email, password),
    []
  );

  const signUp = useCallback(
    (email: string, password: string, name = '') => registerUser(email, password, name),
    []
  );

  const signOut = useCallback(async () => {
    await logoutUser();
  }, []);

  const resetPassword = useCallback(
    (email: string) => resetUserPassword(email),
    []
  );

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, resetPassword }),
    [user, loading, signIn, signUp, signOut, resetPassword]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
