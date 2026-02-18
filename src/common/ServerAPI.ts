const BASE_URL = "http://localhost:3606/api/auth";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

interface RegisterResponseData {
  message: string;
}

interface LoginResponseData {
  token: string;
  valid: boolean;
  message: string;
}

async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        "Content-Type": "application/json",
        ...options?.headers,
      },
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        message: data.message || "Something went wrong.",
      };
    }

    return { success: true, data };
  } catch (error) {
    console.error("API call error:", error);
    return {
      success: false,
      message: (error as Error).message || "Network error or unexpected issue.",
    };
  }
}

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
}): Promise<ApiResponse<RegisterResponseData>> => {
  return fetchAPI<RegisterResponseData>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const loginUser = async (payload: {
  email: string;
  password: string;
}): Promise<ApiResponse<LoginResponseData>> => {
  return fetchAPI<LoginResponseData>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};
