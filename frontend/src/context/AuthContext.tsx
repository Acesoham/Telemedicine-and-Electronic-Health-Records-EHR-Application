import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: unknown;
  isAuthenticated: boolean;
  isLoading: boolean;
  role: UserRole | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = useCallback(() => {
    setUser(null);
    setProfile(null);
    localStorage.removeItem('medivault_access_token');
    localStorage.removeItem('medivault_refresh_token');
  }, []);

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('medivault_access_token');
    if (!token) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await authApi.getProfile();
      if (response.data.success && response.data.data) {
        const { user: userData, profile: profileData } = response.data.data as {
          user: User;
          profile: unknown;
        };
        setUser(userData);
        setProfile(profileData);
      }
    } catch {
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await authApi.login(email, password);

    if (!response.data.success) {
      throw new Error(response.data.message);
    }

    const { user: userData, accessToken, refreshToken } = response.data.data as {
      user: User;
      accessToken: string;
      refreshToken: string;
    };

    localStorage.setItem('medivault_access_token', accessToken);
    localStorage.setItem('medivault_refresh_token', refreshToken);
    setUser(userData);

    // Load full profile
    await loadProfile();
  }, [loadProfile]);

  const logout = useCallback(async () => {
    const refreshToken = localStorage.getItem('medivault_refresh_token');
    try {
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch {
      // Logout on client side regardless
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        role: user?.role || null,
        login,
        logout,
        refreshProfile: loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
