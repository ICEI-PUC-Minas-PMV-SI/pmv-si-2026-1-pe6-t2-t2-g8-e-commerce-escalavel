type ErrorPayload = {
  message?: string
  error?: string
}

export class HttpClient {
  private readonly baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  async get<T>(path: string, options: { signal?: AbortSignal; headers?: HeadersInit } = {}): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      signal: options.signal,
      headers: options.headers,
    })

    return this.parseResponse<T>(res)
  }

  private async parseResponse<T>(res: Response): Promise<T> {
    const contentType = res.headers.get('content-type') || ''
    const isJson = contentType.includes('application/json')

    const payload = isJson
      ? await res.json().catch(() => null)
      : await res.text()

    if (!res.ok) {
      const messageFromPayload =
        payload && typeof payload === 'object'
          ? (payload as ErrorPayload).message || (payload as ErrorPayload).error
          : null

      const messageFromText =
        typeof payload === 'string' && payload.trim().length > 0
          ? payload
          : null

      throw new Error(
        messageFromPayload ||
        messageFromText ||
        `Request failed with status ${res.status}`
      )
    }

    return payload as T
  }
}