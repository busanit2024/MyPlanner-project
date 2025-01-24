import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../firebase";
import { EmailAuthProvider, onAuthStateChanged, reauthenticateWithCredential } from "firebase/auth";

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

  // 사용자 재인증
  const reauthenticate = async (password) => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return false;
    }
    const credential = EmailAuthProvider.credential(currentUser.email, password);
    
    try {
      await reauthenticateWithCredential(currentUser, credential);
      return true;
    } catch (error) {
      console.error("재인증 에러", error);
      return false;
    }
  }

  return (
    <AuthContext.Provider value={{ user, isLoggedIn, loading, login, logout, loadUser, reauthenticate }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
}