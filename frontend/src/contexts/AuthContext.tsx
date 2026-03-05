import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  login: (data: any) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('@MailerWeb:token');
    const storedUser = localStorage.getItem('@MailerWeb:user');

    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async ({ username, password }: any) => {
    const response = await api.post('/auth/login/', { username, password });
    const { access } = response.data;
    localStorage.setItem('@MailerWeb:token', access);

    const userResponse = await api.get('/auth/me/');
    setUser(userResponse.data);
    localStorage.setItem('@MailerWeb:user', JSON.stringify(userResponse.data));

    navigate('/');
  };

  const logout = () => {
    localStorage.removeItem('@MailerWeb:token');
    localStorage.removeItem('@MailerWeb:user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
