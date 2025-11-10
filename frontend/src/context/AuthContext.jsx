import React, { createContext, useReducer, useContext, useEffect } from "react";

const AuthStateContext = createContext();
const AuthDispatchContext = createContext();

const initialState = {
  user: JSON.parse(localStorage.getItem("user")) || null,
  token: localStorage.getItem("token") || null
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      localStorage.setItem("token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return { 
        user: action.payload.user,
        token: action.payload.token 
      };
    case "LOGOUT":
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      return { user: null, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);
  return (
    <AuthStateContext.Provider value={state}>
      <AuthDispatchContext.Provider value={dispatch}>
        {children}
      </AuthDispatchContext.Provider>
    </AuthStateContext.Provider>
  );
}

export function useAuthState() {
  return useContext(AuthStateContext);
}

export function useAuthDispatch() {
  return useContext(AuthDispatchContext);
}

export function useAuth() {
  const state = useAuthState();
  const dispatch = useAuthDispatch();

  const login = async (credentials) => {
    try {
      // For now, just simulate a successful login
      const fakeResponse = {
        user: { id: 1, email: credentials.email },
        token: "fake-jwt-token"
      };
      dispatch({ type: "LOGIN", payload: fakeResponse });
      return fakeResponse;
    } catch (error) {
      throw new Error(error.message || "Login failed");
    }
  };

  const register = async (userData) => {
    try {
      // For now, just simulate a successful registration
      const fakeResponse = {
        user: { id: 1, email: userData.email, name: userData.name },
        token: "fake-jwt-token"
      };
      dispatch({ type: "LOGIN", payload: fakeResponse });
      return fakeResponse;
    } catch (error) {
      throw new Error(error.message || "Registration failed");
    }
  };

  const logout = () => {
    dispatch({ type: "LOGOUT" });
  };

  return {
    user: state.user,
    token: state.token,
    login,
    register,
    logout
  };
}
