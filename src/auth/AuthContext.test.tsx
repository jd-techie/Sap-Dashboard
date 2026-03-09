import { AuthProvider, useAuth } from "@/auth/AuthContext";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

function jsonResponse(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

function AuthProbe() {
  const auth = useAuth();

  return (
    <div>
      <div data-testid="bootstrapping">{String(auth.isBootstrapping)}</div>
      <div data-testid="authenticated">{String(auth.isAuthenticated)}</div>
      <div data-testid="email">{auth.user?.email ?? ""}</div>
      <button type="button" onClick={() => void auth.logout()}>
        logout
      </button>
    </div>
  );
}

describe("AuthProvider", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    window.localStorage.clear();
  });

  it("bootstraps /me when stored tokens exist", async () => {
    window.localStorage.setItem(
      "sap.auth.session",
      JSON.stringify({ accessToken: "access-1", refreshToken: "refresh-1" }),
    );

    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse({
        success: true,
        message: "User profile fetched successfully",
        data: {
          user: {
            id: "u1",
            name: "Alice",
            email: "alice@example.com",
          },
        },
      }),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("bootstrapping")).toHaveTextContent("false");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    expect(screen.getByTestId("email")).toHaveTextContent("alice@example.com");

    const fetchInit = fetchSpy.mock.calls[0]?.[1] as RequestInit;
    const headers = new Headers(fetchInit?.headers);

    expect(headers.get("Authorization")).toBe("Bearer access-1");
  });

  it("always clears local auth state on logout, even when backend logout fails", async () => {
    window.localStorage.setItem(
      "sap.auth.session",
      JSON.stringify({ accessToken: "access-1", refreshToken: "refresh-1" }),
    );

    vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
      const url = String(input);

      if (url.endsWith("/auth/me")) {
        return jsonResponse({
          success: true,
          message: "User profile fetched successfully",
          data: {
            user: {
              id: "u1",
              name: "Alice",
              email: "alice@example.com",
            },
          },
        });
      }

      if (url.endsWith("/auth/logout")) {
        return jsonResponse({ error: "Network issue" }, 500);
      }

      return jsonResponse({ error: "Unexpected endpoint" }, 500);
    });

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    await waitFor(() => {
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });

    expect(window.localStorage.getItem("sap.auth.session")).toBeNull();
  });
});
