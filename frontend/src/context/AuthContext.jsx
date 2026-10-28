import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('quiztrack_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('quiztrack_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('quiztrack_token');
      if (storedToken) {
        try {
          const res = await authApi.getMe();
          setUser(res.data);
          localStorage.setItem('quiztrack_user', JSON.stringify(res.data));
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const authData = res.data;
    setToken(authData.token);
    setUser(authData);
    localStorage.setItem('quiztrack_token', authData.token);
    localStorage.setItem('quiztrack_user', JSON.stringify(authData));
    return authData;
  };

  const register = async (userData) => {
    const res = await authApi.register(userData);
    const authData = res.data;
    setToken(authData.token);
    setUser(authData);
    localStorage.setItem('quiztrack_token', authData.token);
    localStorage.setItem('quiztrack_user', JSON.stringify(authData));
    return authData;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('quiztrack_token');
    localStorage.removeItem('quiztrack_user');
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => {
      const merged = { ...prev, ...updatedUser };
      localStorage.setItem('quiztrack_user', JSON.stringify(merged));
      return merged;
    });
  };

  const isAdmin = () => {
    if (!user || !user.roles) return false;
    return user.roles.includes('ROLE_ADMIN') || user.roles.some((r) => r.name === 'ROLE_ADMIN');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAdmin,
        isAuthenticated: !!token,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
