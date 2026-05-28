type ErrorPayload = {
  message?: string;
  error?: string;
};

type RequestOptions = {
  signal?: AbortSignal;
  headers?: HeadersInit;
};

// TODO: integrate expo-secure-store for token storage when auth lands.
export async function authHeader(): Promise<HeadersInit> {
  return {};
}

export class HttpClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  get<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  post<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  put<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  patch<T>(
    path: string,
    body?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>('PATCH', path, body, options);
  }

  del<T>(path: string, options: RequestOptions = {}): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  private async request<T>(
    method: string,
    path: string,
    body: unknown,
    options: RequestOptions
  ): Promise<T> {
    const hasBody = body !== undefined && body !== null;

    const headers = new Headers(options.headers);

    if (hasBody && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    const res = await fetch(`${this.baseUrl}${path}`, {
      method,
      signal: options.signal,
      headers,
      body: hasBody ? JSON.stringify(body) : undefined,
    });

    return this.parseResponse<T>(res);
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') || '';

    const isJson = contentType.includes('application/json');

    const payload = isJson
      ? await res.json().catch(() => null)
      : await res.text();

    if (!res.ok) {
      const messageFromPayload =
        payload && typeof payload === 'object'
          ? (payload as ErrorPayload).message ||
            (payload as ErrorPayload).error
          : null;

      const messageFromText =
        typeof payload === 'string' &&
        payload.trim().length > 0
          ? payload
          : null;

      throw new Error(
        messageFromPayload ||
          messageFromText ||
          `Request failed with status ${res.status}`
      );
    }

    return payload as T;
  }
}