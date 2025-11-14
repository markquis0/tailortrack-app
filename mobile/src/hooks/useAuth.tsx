import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import * as SecureStore from "expo-secure-store";
import api, { AuthResponse } from "../services/api";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: "tailor" | "client" | null;
  isAnonymous?: boolean;
  firstName?: string | null;
  lastName?: string | null;
}

interface AuthState {
  token: string | null;
  user: User | null;
  status: "idle" | "loading" | "error";
  error?: string;
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (
    name: string,
    email: string,
    password: string,
    role: "tailor" | "client"
  ) => Promise<void>;
  createAnonymousUser: () => Promise<void>;
  updateProfile: (profile: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, setState] = useState<AuthState>({
    token: null,
    user: null,
    status: "loading",
  });

  const createAnonymousUser = useCallback(async () => {
    setState((current) => ({ ...current, status: "loading", error: undefined }));
    try {
      const response = await api.createAnonymous();
      await SecureStore.setItemAsync(TOKEN_KEY, response.token);
      await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
      setState({
        token: response.token,
        user: response.user,
        status: "idle",
      });
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "error",
        error: error instanceof Error ? error.message : "Failed to create anonymous account",
      }));
    }
  }, []);

  // Load token and user from SecureStore on mount
  useEffect(() => {
    const loadToken = async () => {
      try {
        const storedToken = await SecureStore.getItemAsync(TOKEN_KEY);
        const storedUser = await SecureStore.getItemAsync(USER_KEY);
        if (storedToken) {
          const user = storedUser ? JSON.parse(storedUser) : null;
          setState((prev) => ({ ...prev, token: storedToken, user, status: "idle" }));
        } else {
          // No token found, create anonymous user
          await createAnonymousUser();
        }
      } catch (error) {
        console.error("Failed to load token:", error);
        setState((prev) => ({ ...prev, status: "error", error: "Failed to load session" }));
      }
    };
    loadToken();
  }, [createAnonymousUser]);

  const handleAuthSuccess = useCallback(async (response: AuthResponse & { user: User }) => {
    await SecureStore.setItemAsync(TOKEN_KEY, response.token);
    await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
    setState({
      token: response.token,
      user: response.user,
      status: "idle",
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setState((current) => ({ ...current, status: "loading", error: undefined }));
    try {
      const response = await api.login({ email, password });
      handleAuthSuccess(response);
    } catch (error) {
      setState((current) => ({
        ...current,
        status: "error",
        error: error instanceof Error ? error.message : "Login failed",
      }));
    }
  }, [handleAuthSuccess]);

  const register = useCallback(
    async (
      name: string,
      email: string,
      password: string,
      role: "tailor" | "client"
    ) => {
      setState((current) => ({
        ...current,
        status: "loading",
        error: undefined,
      }));
      try {
        const response = await api.register({ name, email, password, role });
        handleAuthSuccess(response);
      } catch (error) {
        setState((current) => ({
          ...current,
          status: "error",
          error: error instanceof Error ? error.message : "Registration failed",
        }));
      }
    },
    [handleAuthSuccess]
  );

  const updateProfile = useCallback(
    async (profile: { firstName?: string; lastName?: string; email?: string }) => {
      if (!state.token) {
        throw new Error("Not authenticated");
      }
      setState((current) => ({ ...current, status: "loading", error: undefined }));
      try {
        const response = await api.updateProfile(state.token, profile);
        await SecureStore.setItemAsync(USER_KEY, JSON.stringify(response.user));
        setState((current) => ({
          ...current,
          user: response.user,
          status: "idle",
        }));
      } catch (error) {
        setState((current) => ({
          ...current,
          status: "error",
          error: error instanceof Error ? error.message : "Failed to update profile",
        }));
        throw error;
      }
    },
    [state.token]
  );

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_KEY);
    setState({ token: null, user: null, status: "idle" });
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...state,
      login,
      register,
      createAnonymousUser,
      updateProfile,
      logout,
    }),
    [login, register, createAnonymousUser, updateProfile, logout, state]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

