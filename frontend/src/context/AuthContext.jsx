import { createContext, useContext, useEffect, useState } from "react";
import { getToken, logout } from "../services/auth";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = getToken();

    if (savedToken) {
      setToken(savedToken);
    }
  }, []);

  const signOut = () => {
    logout();
    setToken(null);
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        setToken,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};