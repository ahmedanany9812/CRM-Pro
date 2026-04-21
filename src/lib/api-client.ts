interface FetchOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export async function apiClient<T>(
  endpoint: string,
  options: FetchOptions = {},
): Promise<T> {
  const { params, headers, ...rest } = options;

  const cleanEndpoint = endpoint.startsWith("/") ? endpoint.slice(1) : endpoint;
  let url = endpoint.startsWith("http") ? endpoint : `/api/${cleanEndpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += (url.includes("?") ? "&" : "?") + queryString;
    }
  }

  const response = await fetch(url, {
    headers: {
      ...(options.body instanceof FormData || (options.body && typeof options.body === 'object' && options.body.constructor?.name === 'FormData') 
        ? {} 
        : { "Content-Type": "application/json" }),
      ...headers,
    },
    ...rest,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(
      errorData.error || response.statusText || "An error occurred",
    ) as Error & { status?: number; data?: unknown };
    error.status = response.status;
    error.data = errorData;
    throw error;
  }

  return response.json() as Promise<T>;
}

export interface Pagination {
  total: number;
  page: number;
  pageSize: number;
  pages: number;
}

export interface StandardResponse<T> {
  success: boolean;
  data: T;
  pagination?: Pagination;
  message?: string;
  error?: string;
}

export const api = {
  get: <T>(url: string, options?: FetchOptions) =>
    apiClient<T>(url, { ...options, method: "GET" }),
  post: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "POST",
      body: (body instanceof FormData || (body && typeof body === 'object' && (body as any).constructor?.name === 'FormData')) 
        ? (body as any) 
        : JSON.stringify(body),
    }),
  patch: <T>(url: string, body?: unknown, options?: FetchOptions) =>
    apiClient<T>(url, {
      ...options,
      method: "PATCH",
      body: (body instanceof FormData || (body && typeof body === 'object' && (body as any).constructor?.name === 'FormData')) 
        ? (body as any) 
        : JSON.stringify(body),
    }),
  delete: <T>(url: string, options?: FetchOptions) =>
    apiClient<T>(url, { ...options, method: "DELETE" }),
};
