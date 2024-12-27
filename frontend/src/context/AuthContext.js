import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem("userToken");
    if (token) {
      login(token);
    }
  }, []);

  const login = (token) => {
    if (token) {
      axios.get("/api/user/find", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        setUser(res.data);
      }).catch((error) => {
        console.error(error);
      });
    }
  }

  const logout = () => {
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}