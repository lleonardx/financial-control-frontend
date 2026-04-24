import {
createContext,
useCallback,
useContext,
useEffect,
useMemo,
useState,
type ReactNode
} from 'react';
  
import type { AuthUser, LoginPayload, RegisterPayload } from '../types/auth';
import { authService } from '../services/authServices';
  
type AuthContextType = {
    user: AuthUser | null;
    token: string | null;
    loading: boolean;
    isAuthenticated: boolean;
    login: (payload: LoginPayload) => Promise<void>;
    register: (payload: RegisterPayload) => Promise<void>;
    logout: () => void;
};
  
const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = '@FinancialControl:token';
const USER_KEY = '@FinancialControl:user';
  
  export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(() => {
      const savedUser = localStorage.getItem(USER_KEY);
      return savedUser ? JSON.parse(savedUser) : null;
    });
  
    const [token, setToken] = useState<string | null>(() => {
      return localStorage.getItem(TOKEN_KEY);
    });
  
    const [loading, setLoading] = useState(true);
  
    const persistSession = useCallback((accessToken: string, authUser: AuthUser) => {
      localStorage.setItem(TOKEN_KEY, accessToken);
      localStorage.setItem(USER_KEY, JSON.stringify(authUser));
  
      setToken(accessToken);
      setUser(authUser);
    }, []);
  
    const logout = useCallback(() => {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
  
      setToken(null);
      setUser(null);
    }, []);
  
    useEffect(() => {
      async function loadUser() {
        try {
          const savedToken = localStorage.getItem(TOKEN_KEY);
  
          if (!savedToken) {
            setLoading(false);
            return;
          }
  
          const currentUser = await authService.me();
  
          setToken(savedToken);
          setUser(currentUser);
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
        } catch {
          logout();
        } finally {
          setLoading(false);
        }
      }
  
      loadUser();
    }, [logout]);
  
    const login = useCallback(
      async (payload: LoginPayload) => {
        const response = await authService.login(payload);
        persistSession(response.accessToken, response.user);
      },
      [persistSession]
    );
  
    const register = useCallback(
      async (payload: RegisterPayload) => {
        const response = await authService.register(payload);
        persistSession(response.accessToken, response.user);
      },
      [persistSession]
    );
  
    const value = useMemo(
      () => ({
        user,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        login,
        register,
        logout
      }),
      [user, token, loading, login, register, logout]
    );
  
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }
  
  export function useAuth() {
    const context = useContext(AuthContext);
  
    if (!context) {
      throw new Error('useAuth deve ser usado dentro de AuthProvider');
    }
  
    return context;
  }