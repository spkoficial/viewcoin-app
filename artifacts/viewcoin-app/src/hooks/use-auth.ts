import { useState, useEffect } from 'react';
import { User } from '@workspace/api-client-react';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  isReady: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>(() => {
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
  });

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

  return {
    ...authState,
    login,
    logout,
    updateUser,
  };
}
