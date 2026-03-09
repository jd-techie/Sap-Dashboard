import {
  ApiResponse,
  AuthTokens,
  configureAuthRuntime,
  getMe,
  registerUser,
} from "@/common/ServerAPI";
import { beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function expectFailure<T>(response: ApiResponse<T>): asserts response is Extract<ApiResponse<T>, { success: false }> {
  if (response.success) {
    throw new Error("Expected failure response");
  }
}

describe("ServerAPI", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("normalizes global error shape into AppError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ error: "Invalid payload", details: { email: "required" } }, 400),
    );

    const response = await registerUser({
      name: "Alice",
      email: "",
      password: "password123",
    });

    expect(response.success).toBe(false);

    expectFailure(response);
    expect(response.error.code).toBe("VALIDATION");
    expect(response.error.message).toBe("Invalid payload");
    expect(response.error.details).toEqual({ email: "required" });
  });

  it("normalizes envelope error shape into AppError", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(
      jsonResponse({ success: false, message: "Invalid refresh token" }, 401),
    );

    const response = await getMe();

    expect(response.success).toBe(false);

    expectFailure(response);
    expect(response.error.code).toBe("UNAUTHORIZED");
    expect(response.message).toBe("Invalid refresh token");
  });

  it("retries protected requests once after a single shared refresh", async () => {
    const tokens: AuthTokens = {
      accessToken: "access-old",
      refreshToken: "refresh-old",
    };

    let refreshCount = 0;
    let meCount = 0;
    let isRefreshed = false;

    const setTokens = vi.fn((nextTokens: AuthTokens) => {
      tokens.accessToken = nextTokens.accessToken;
      tokens.refreshToken = nextTokens.refreshToken;
    });
    const clearSession = vi.fn();

    configureAuthRuntime({
      getAccessToken: () => tokens.accessToken,
      getRefreshToken: () => tokens.refreshToken,
      setTokens,
      clearSession,
    });

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        meCount += 1;

        if (!isRefreshed) {
          return jsonResponse({ success: false, message: "Unauthorized" }, 401);
        }

        return jsonResponse({
          success: true,
          message: "User profile fetched successfully",
          data: {
            user: {
              id: "1",
              name: "Alice",
              email: "alice@example.com",
            },
          },
        });
      }

      if (url.endsWith("/auth/refresh-token")) {
        refreshCount += 1;
        isRefreshed = true;

        return jsonResponse({
          success: true,
          message: "Token refreshed successfully",
          data: {
            access_token: "access-new",
            refresh_token: "refresh-new",
          },
        });
      }

      return jsonResponse({ error: "Unexpected endpoint" }, 500);
    });

    const [first, second] = await Promise.all([getMe(), getMe()]);

    expect(first.success).toBe(true);
    expect(second.success).toBe(true);
    expect(refreshCount).toBe(1);
    expect(meCount).toBe(4);
    expect(setTokens).toHaveBeenCalledTimes(1);
    expect(clearSession).not.toHaveBeenCalled();
  });

  it("clears session when refresh fails during protected request retry", async () => {
    const clearSession = vi.fn();

    configureAuthRuntime({
      getAccessToken: () => "access-old",
      getRefreshToken: () => "refresh-old",
      setTokens: vi.fn(),
      clearSession,
    });

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return jsonResponse({ success: false, message: "Unauthorized" }, 401);
      }

      if (url.endsWith("/auth/refresh-token")) {
        return jsonResponse({ success: false, message: "Invalid or expired refresh token" }, 401);
      }

      return jsonResponse({ error: "Unexpected endpoint" }, 500);
    });

    const response: ApiResponse<{ user: { email: string } }> = await getMe();

    expect(response.success).toBe(false);
    expect(clearSession).toHaveBeenCalledTimes(1);
  });
});
