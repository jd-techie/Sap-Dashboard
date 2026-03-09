import { AuthTokens } from "@/common/ServerAPI";

const STORAGE_KEY = "sap.auth.session";

interface StoredSession {
  accessToken: string;
  refreshToken: string;
}

function isStoredSession(value: unknown): value is StoredSession {
  return Boolean(
    value &&
      typeof value === "object" &&
      "accessToken" in value &&
      typeof (value as StoredSession).accessToken === "string" &&
      "refreshToken" in value &&
      typeof (value as StoredSession).refreshToken === "string",
  );
}

export function loadStoredTokens(): AuthTokens | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (!isStoredSession(parsed)) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      refreshToken: parsed.refreshToken,
    };
  } catch {
    return null;
  }
}

export function storeTokens(tokens: AuthTokens) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tokens));
}

export function clearStoredTokens() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(STORAGE_KEY);
}
