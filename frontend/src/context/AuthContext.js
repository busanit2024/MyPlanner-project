import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        login(user.accessToken);
      } else {
        const token = sessionStorage.getItem("userToken");
        if (token) {
          login(token);
        } else {
          setIsLoggedIn(false);
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, []);


  const loadUser = () => {
    const currentUser = auth.currentUser;
    let token = null;
    if (currentUser) {
      token = currentUser.accessToken;
    } else {
      token = sessionStorage.getItem("userToken");
    }
    
    if (token) {
      login(token);
    }
  }

  const login = (token) => {
    setLoading(true);
    let loginResult = false;
    if (token) {
      loginResult = axios.get("/api/user/find", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }).then((res) => {
        setUser(res.data);
        setIsLoggedIn(true);
        return true;
      }).catch((error) => {
        console.error(error);
        return false;
      }).finally(() => {
        setLoading(false);
      });
    }
    return loginResult;
  }

  const logout = () => {
    auth.signOut();
    sessionStorage.removeItem("userToken");
    setUser(null);
    setIsLoggedIn(false);
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}