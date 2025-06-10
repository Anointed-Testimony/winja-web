import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [adminToken, setAdminToken] = useState(() =>
    localStorage.getItem("admin_token")
  );
  const [adminUser, setAdminUser] = useState(() =>
    localStorage.getItem("admin_user")
  );

  useEffect(() => {
    if (adminToken) {
      localStorage.setItem("admin_token", adminToken);
    } else {
      localStorage.removeItem("admin_token");
    }
  }, [adminToken]);

  useEffect(() => {
    if (adminUser) {
      localStorage.setItem("admin_user", adminUser);
    } else {
      localStorage.removeItem("admin_user");
    }
  }, [adminUser]);

  const login = (token, user) => {
    setAdminToken(token);
    setAdminUser(user);
  };

  const logout = () => {
    setAdminToken(null);
    setAdminUser(null);
  };

  return (
    <AuthContext.Provider value={{ adminToken, adminUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
