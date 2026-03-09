import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  ApiResponse,
  AppError,
  AuthTokens,
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
  LoginResponseData,
  RegisterResponseData,
  changePassword,
  configureAuthRuntime,
  getMe,
  loginUser,
  logoutUser,
  registerUser,
  RegisterPayload,
} from "@/common/ServerAPI";
import { clearStoredTokens, loadStoredTokens, storeTokens } from "@/auth/storage";

interface AuthContextValue {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isBootstrapping: boolean;
  login: (payload: LoginPayload) => Promise<ApiResponse<LoginResponseData>>;
  register: (payload: RegisterPayload) => Promise<ApiResponse<RegisterResponseData>>;
  logout: () => Promise<void>;
  changePassword: (payload: ChangePasswordPayload) => Promise<ApiResponse<{ user: AuthUser }>>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function toClientFailure<T>(message: string): ApiResponse<T> {
  const error: AppError = {
    code: "UNKNOWN",
    status: 0,
    message,
  };

  return {
    success: false,
    message,
    error,
  };
}

function normalizeTokens(data: LoginResponseData): AuthTokens | null {
  const accessToken = data.access_token ?? data.token;
  const refreshToken = data.refresh_token;

  if (!accessToken || !refreshToken) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [tokens, setTokens] = useState<AuthTokens | null>(() => loadStoredTokens());
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const tokensRef = useRef<AuthTokens | null>(tokens);

  const setSessionTokens = useCallback((nextTokens: AuthTokens) => {
    tokensRef.current = nextTokens;
    setTokens(nextTokens);
    storeTokens(nextTokens);
  }, []);

  const clearSession = useCallback(() => {
    tokensRef.current = null;
    setTokens(null);
    setUser(null);
    clearStoredTokens();
  }, []);

  useEffect(() => {
    configureAuthRuntime({
      getAccessToken: () => tokensRef.current?.accessToken ?? null,
      getRefreshToken: () => tokensRef.current?.refreshToken ?? null,
      setTokens: setSessionTokens,
      clearSession,
    });
  }, [clearSession, setSessionTokens]);

  useEffect(() => {
    let isMounted = true;

    const bootstrap = async () => {
      if (!tokensRef.current?.accessToken) {
        if (isMounted) {
          setIsBootstrapping(false);
        }
        return;
      }

      const profile = await getMe();
      if (!isMounted) {
        return;
      }

      if (profile.success) {
        setUser(profile.data.user);
      } else {
        clearSession();
      }

      setIsBootstrapping(false);
    };

    void bootstrap();

    return () => {
      isMounted = false;
    };
  }, [clearSession]);

  const login = useCallback(async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
    const response = await loginUser(payload);
    if (!response.success) {
      return response;
    }

    const nextTokens = normalizeTokens(response.data);
    if (!nextTokens) {
      return toClientFailure<LoginResponseData>("Invalid login response: missing access or refresh token.");
    }

    setSessionTokens(nextTokens);

    if (response.data.user) {
      setUser(response.data.user);
      return response;
    }

    const me = await getMe();
    if (!me.success) {
      clearSession();
      return toClientFailure<LoginResponseData>(me.message || "Could not fetch user profile after login.");
    }

    setUser(me.data.user);
    return response;
  }, [clearSession, setSessionTokens]);

  const register = useCallback(
    async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
      return registerUser(payload);
    },
    [],
  );

  const logout = useCallback(async () => {
    const refreshToken = tokensRef.current?.refreshToken;

    if (refreshToken) {
      await logoutUser({ refresh_token: refreshToken });
    }

    clearSession();
  }, [clearSession]);

  const handleChangePassword = useCallback(
    async (payload: ChangePasswordPayload): Promise<ApiResponse<{ user: AuthUser }>> => {
      const response = await changePassword(payload);
      if (!response.success) {
        return response;
      }

      setUser(response.data.user);
      await logout();

      return response;
    },
    [logout],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      tokens,
      isAuthenticated: Boolean(tokens?.accessToken && user),
      isBootstrapping,
      login,
      register,
      logout,
      changePassword: handleChangePassword,
    }),
    [handleChangePassword, isBootstrapping, login, logout, register, tokens, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
