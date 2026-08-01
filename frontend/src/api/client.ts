// Single entry point for every API call: adds the /api prefix, attaches the
// auth token, and turns non-OK responses into a typed ApiError.

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`/api${path}`, { ...options, headers });

  if (!response.ok) {
    // The backend always sends { message }, but fall back gracefully if not.
    let message = `Request failed (${response.status})`;
    try {
      const body = (await response.json()) as { message?: string };
      if (body?.message) message = body.message;
    } catch {
      // Non-JSON body — keep the generic message.
    }
    throw new ApiError(response.status, message);
  }

  // 204 No Content has no body.
  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}
