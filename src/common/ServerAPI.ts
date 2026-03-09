const API_BASE_URL = "http://localhost:3000/api";
const AUTH_BASE_URL = `${API_BASE_URL}/auth`;

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "NOT_FOUND"
  | "VALIDATION"
  | "NETWORK"
  | "UNKNOWN";

export interface AppError {
  code: AppErrorCode;
  status: number;
  message: string;
  details?: unknown;
  raw?: unknown;
}

export interface ApiSuccess<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFailure {
  success: false;
  message: string;
  error: AppError;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

interface ApiEnvelope<T> {
  success: boolean;
  message?: string;
  data?: T;
}

interface EnvelopeErrorShape {
  success: false;
  message: string;
}

interface GlobalErrorShape {
  error: string;
  details?: unknown;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterResponseData {
  message?: string;
  user?: AuthUser;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseData {
  access_token?: string;
  refresh_token?: string;
  token?: string;
  valid?: boolean;
  message?: string;
  user?: AuthUser;
}

export interface RefreshTokenPayload {
  refresh_token: string;
}

export interface RefreshTokenResponseData {
  access_token: string;
  refresh_token: string;
}

export interface LogoutPayload {
  refresh_token: string;
}

export type LogoutResponseData = Record<string, never>;

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
}

export interface UserEnvelopeData {
  user: AuthUser;
}

export interface HealthResponseData {
  status: "ok" | string;
}

interface RequestConfig extends RequestInit {
  auth?: boolean;
  retryOnUnauthorized?: boolean;
}

interface AuthRuntimeHandlers {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
}

const authRuntime: AuthRuntimeHandlers = {
  getAccessToken: () => null,
  getRefreshToken: () => null,
  setTokens: () => undefined,
  clearSession: () => undefined,
};

let refreshInFlight: Promise<AuthTokens | null> | null = null;

function resolveErrorCode(status: number): AppErrorCode {
  if (status === 401) return "UNAUTHORIZED";
  if (status === 404) return "NOT_FOUND";
  if (status === 400 || status === 422) return "VALIDATION";
  if (status === 0) return "NETWORK";
  return "UNKNOWN";
}

function isEnvelopeError(payload: unknown): payload is EnvelopeErrorShape {
  return Boolean(
    payload &&
      typeof payload === "object" &&
      "success" in payload &&
      (payload as EnvelopeErrorShape).success === false &&
      "message" in payload,
  );
}

function isGlobalError(payload: unknown): payload is GlobalErrorShape {
  return Boolean(payload && typeof payload === "object" && "error" in payload);
}

function normalizeError(payload: unknown, status: number, fallbackMessage: string): AppError {
  if (isEnvelopeError(payload)) {
    return {
      code: resolveErrorCode(status),
      status,
      message: payload.message,
      raw: payload,
    };
  }

  if (isGlobalError(payload)) {
    return {
      code: resolveErrorCode(status),
      status,
      message: payload.error,
      details: payload.details,
      raw: payload,
    };
  }

  return {
    code: resolveErrorCode(status),
    status,
    message: fallbackMessage,
    raw: payload,
  };
}

function normalizeNetworkError(error: unknown): AppError {
  return {
    code: "NETWORK",
    status: 0,
    message: (error as Error)?.message || "Network error or unexpected issue.",
    raw: error,
  };
}

async function parseBody(response: Response): Promise<unknown> {
  const contentType = response.headers.get("content-type");

  if (!contentType || !contentType.includes("application/json")) {
    return null;
  }

  try {
    return await response.json();
  } catch {
    return null;
  }
}

function toFailure<T>(error: AppError): ApiResponse<T> {
  return {
    success: false,
    message: error.message,
    error,
  };
}

function isApiFailure<T>(response: ApiResponse<T>): response is ApiFailure {
  return response.success === false;
}

function extractSuccessPayload<T>(payload: unknown): { data: T; message?: string } {
  if (payload && typeof payload === "object" && "success" in payload) {
    const envelope = payload as ApiEnvelope<T>;
    return {
      data: (envelope.data ?? ({} as T)) as T,
      message: envelope.message,
    };
  }

  return {
    data: payload as T,
  };
}

async function executeFetch<T>(url: string, config: RequestConfig): Promise<ApiResponse<T>> {
  try {
    const headers = new Headers(config.headers);

    if (!headers.has("Content-Type") && config.body) {
      headers.set("Content-Type", "application/json");
    }

    if (config.auth) {
      const accessToken = authRuntime.getAccessToken();
      if (accessToken) {
        headers.set("Authorization", `Bearer ${accessToken}`);
      }
    }

    const response = await fetch(url, {
      ...config,
      headers,
    });
    const payload = await parseBody(response);

    if (!response.ok) {
      const fallbackMessage = response.statusText || "Something went wrong.";
      return toFailure<T>(normalizeError(payload, response.status, fallbackMessage));
    }

    if (isEnvelopeError(payload)) {
      return toFailure<T>(normalizeError(payload, response.status, payload.message));
    }

    const { data, message } = extractSuccessPayload<T>(payload);
    return {
      success: true,
      data,
      message,
    };
  } catch (error) {
    return toFailure<T>(normalizeNetworkError(error));
  }
}

async function refreshTokenOnce(): Promise<AuthTokens | null> {
  const refreshToken = authRuntime.getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  const response = await executeFetch<RefreshTokenResponseData>(
    `${AUTH_BASE_URL}/refresh-token`,
    {
      method: "POST",
      body: JSON.stringify({ refresh_token: refreshToken } satisfies RefreshTokenPayload),
      retryOnUnauthorized: false,
    },
  );

  if (!response.success) {
    return null;
  }

  const nextTokens = {
    accessToken: response.data.access_token,
    refreshToken: response.data.refresh_token,
  };

  authRuntime.setTokens(nextTokens);
  return nextTokens;
}

async function refreshWithMutex(): Promise<AuthTokens | null> {
  if (!refreshInFlight) {
    refreshInFlight = refreshTokenOnce().finally(() => {
      refreshInFlight = null;
    });
  }

  return refreshInFlight;
}

async function fetchAPI<T>(endpoint: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
  const url = `${AUTH_BASE_URL}${endpoint}`;
  const shouldRetry = config.auth && config.retryOnUnauthorized !== false;

  const initialResponse = await executeFetch<T>(url, config);
  if (initialResponse.success) {
    return initialResponse;
  }

  if (!shouldRetry || !isApiFailure(initialResponse) || initialResponse.error.status !== 401) {
    return initialResponse;
  }

  const refreshed = await refreshWithMutex();
  if (!refreshed) {
    authRuntime.clearSession();
    return initialResponse;
  }

  const retryResponse = await executeFetch<T>(url, {
    ...config,
    retryOnUnauthorized: false,
  });

  if (isApiFailure(retryResponse) && retryResponse.error.status === 401) {
    authRuntime.clearSession();
  }

  return retryResponse;
}

export function configureAuthRuntime(handlers: Partial<AuthRuntimeHandlers>) {
  if (handlers.getAccessToken) authRuntime.getAccessToken = handlers.getAccessToken;
  if (handlers.getRefreshToken) authRuntime.getRefreshToken = handlers.getRefreshToken;
  if (handlers.setTokens) authRuntime.setTokens = handlers.setTokens;
  if (handlers.clearSession) authRuntime.clearSession = handlers.clearSession;
}

export const registerUser = async (payload: RegisterPayload): Promise<ApiResponse<RegisterResponseData>> => {
  return fetchAPI<RegisterResponseData>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const loginUser = async (payload: LoginPayload): Promise<ApiResponse<LoginResponseData>> => {
  return fetchAPI<LoginResponseData>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const refreshToken = async (payload: RefreshTokenPayload): Promise<ApiResponse<RefreshTokenResponseData>> => {
  return fetchAPI<RefreshTokenResponseData>("/refresh-token", {
    method: "POST",
    body: JSON.stringify(payload),
    retryOnUnauthorized: false,
  });
};

export const logoutUser = async (payload: LogoutPayload): Promise<ApiResponse<LogoutResponseData>> => {
  return fetchAPI<LogoutResponseData>("/logout", {
    method: "POST",
    body: JSON.stringify(payload),
    retryOnUnauthorized: false,
  });
};

export const getMe = async (): Promise<ApiResponse<UserEnvelopeData>> => {
  return fetchAPI<UserEnvelopeData>("/me", {
    method: "GET",
    auth: true,
  });
};

export const changePassword = async (
  payload: ChangePasswordPayload,
): Promise<ApiResponse<UserEnvelopeData>> => {
  return fetchAPI<UserEnvelopeData>("/change-password", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
};

export const getHealth = async (): Promise<ApiResponse<HealthResponseData>> => {
  return executeFetch<HealthResponseData>(`${API_BASE_URL.replace(/\/api$/, "")}/health`, {
    method: "GET",
    retryOnUnauthorized: false,
  });
};
