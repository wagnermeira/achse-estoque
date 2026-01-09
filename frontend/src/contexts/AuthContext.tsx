// frontend/src/contexts/AuthContext.tsx

// AQUI ESTAVA O ERRO: Separamos "import type" para o TypeScript não reclamar
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react'; 

type UserRole = 'master' | 'manutencao' | null;

interface AuthContextType {
  user: UserRole;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserRole>(() => {
    const savedUser = localStorage.getItem('achse_user');
    return (savedUser as UserRole) || null;
  });

  const login = (username: string, pass: string) => {
    if (username === 'master' && pass === '665544') {
      setUser('master');
      localStorage.setItem('achse_user', 'master');
      return true;
    }
    
    if (username === 'manu' && pass === '1234') {
      setUser('manutencao');
      localStorage.setItem('achse_user', 'manutencao');
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('achse_user');
    window.location.href = '/';
  };

  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        alert('Sessão expirada. Por favor, faça login novamente.');
        logout();
      }, 3600000); // 1 hora
      return () => clearTimeout(timer);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);