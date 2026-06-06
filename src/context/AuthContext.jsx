import {
    createContext,
    useContext,
    useEffect,
    useState,
  } from 'react';
  
  const AuthContext =
    createContext();
  
  export const AuthProvider =
    ({ children }) => {
  
      const [user, setUser] =
        useState(null);
  
      const [token, setToken] =
        useState(null);
  
      /*
      LOAD DATA
      */
  
      useEffect(() => {
  
        const storedUser =
          localStorage.getItem(
            'user'
          );
  
        const storedToken =
          localStorage.getItem(
            'token'
          );
  
        if (storedUser) {
  
          setUser(
            JSON.parse(storedUser)
          );
  
        }
  
        if (storedToken) {
  
          setToken(
            storedToken
          );
  
        }
  
      }, []);
  
      /*
      LOGIN
      */
  
      const login = (
        userData,
        tokenData
      ) => {
  
        localStorage.setItem(
          'user',
          JSON.stringify(userData)
        );
  
        localStorage.setItem(
          'token',
          tokenData
        );
  
        setUser(userData);
  
        setToken(tokenData);
  
      };
  
      /*
      LOGOUT
      */
  
      const logout = () => {
  
        localStorage.removeItem(
          'user'
        );
  
        localStorage.removeItem(
          'token'
        );
  
        setUser(null);
  
        setToken(null);
  
      };
  
      return (
  
        <AuthContext.Provider
          value={{
            user,
            token,
  
            login,
            logout,
  
            setUser,
          }}
        >
  
          {children}
  
        </AuthContext.Provider>
  
      );
  
    };
  
  export const useAuth =
    () =>
      useContext(
        AuthContext
      );