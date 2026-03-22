import { createContext, useContext, useState, useEffect } from "react";
import axiosInstance from "../api/axios";

const AuthContext = createContext();

// Custom hook — instead of importing useContext + AuthContext everywhere,
// components just call useAuth() — cleaner and more readable
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  // On app load, if a token exists, fetch the current user
  // This keeps the user logged in after a page refresh
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await axiosInstance.get("/auth/me");
        setUser(data.user);
      } catch (error) {
        // Token expired or invalid — clean up
        localStorage.removeItem("token");
        setToken(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  const login = (userData, userToken) => {
    localStorage.setItem("token", userToken);
    setToken(userToken);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};