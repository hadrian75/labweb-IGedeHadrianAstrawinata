import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const API_BASE_URL = 'http://127.0.0.1:8000/api/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = () => {
      const accessToken = localStorage.getItem('access_token');
      if (accessToken) {
        try {
          const decoded = jwtDecode(accessToken);
          if (decoded.exp * 1000 > Date.now()) {
            setUser({
              accessToken,
              email: decoded.email,
              fullName: decoded.full_name,
              role: decoded.role,
              major: decoded.major, // Pastikan major ada di token
            });
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          } else {
            logout();
          }
        } catch (e) {
          logout();
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post(`${API_BASE_URL}/login/`, {
        email,
        password,
      });

      const { access, refresh } = response.data.token;
      const decoded = jwtDecode(access);

      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);

      setUser({
        accessToken: access,
        email: decoded.email,
        fullName: decoded.full_name,
        role: decoded.role,
        major: decoded.major, // Ambil major dari token
      });

      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;

      setLoading(false);
      return true;
    } catch (error) {
      setLoading(false);
      if (error.response && error.response.data.detail) {
        throw new Error(error.response.data.detail);
      }
      throw new Error('Login failed. Please check your credentials.');
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    isLoggedIn: !!user,
    loading,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};