import { createContext, useContext, useState, type ReactNode } from 'react';
import { User } from '@workspace/api-client-react';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isReady: boolean;
}

interface AuthContextValue extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

function readInitialState(): AuthState {
  try {
    const storedToken = localStorage.getItem('viewcoin_token');
    const storedUser = localStorage.getItem('viewcoin_user');

    if (storedToken && storedUser) {
      return {
        token: storedToken,
        user: JSON.parse(storedUser),
        isLoggedIn: true,
        isReady: true,
      };
    }
  } catch (e) {
    console.error('Error parsing auth state', e);
  }
  return {
    user: null,
    token: null,
    isLoggedIn: false,
    isReady: true,
  };
}

const AuthContext = createContext<AuthContextValue | null>(null);

// Compartilha o estado de autenticação entre todos os componentes da árvore
// (login/logout/updateUser em qualquer lugar reflete em todos na hora),
// em vez de cada componente ler o localStorage de forma independente.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>(readInitialState);

  const login = (token: string, user: User) => {
    localStorage.setItem('viewcoin_token', token);
    localStorage.setItem('viewcoin_user', JSON.stringify(user));
    setAuthState({ token, user, isLoggedIn: true, isReady: true });
  };

  const logout = () => {
    localStorage.removeItem('viewcoin_token');
    localStorage.removeItem('viewcoin_user');
    setAuthState({ token: null, user: null, isLoggedIn: false, isReady: true });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('viewcoin_user', JSON.stringify(user));
    setAuthState((prev) => ({ ...prev, user }));
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>');
  }
  return ctx;
}
