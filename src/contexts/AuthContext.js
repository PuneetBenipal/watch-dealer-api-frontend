import React, { createContext, useState } from 'react';

export const AuthContext = createContext({});

const initialize = {
  jwtTokan: "",
  user: null,
  loading: false,
  company: null,
  companyId: null
}

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(initialize);

  const update = (newState) => {
    setAuthState(prevState => ({ ...prevState, ...newState }));
  }

  return (
    <AuthContext.Provider
      value={{ authState, setAuthState, update }}
    >
      {children}
    </AuthContext.Provider>
  );
}; 