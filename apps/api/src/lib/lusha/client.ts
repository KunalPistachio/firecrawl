import { config } from "../../config";

type HttpMethod = "GET" | "POST";

type LushaClientOptions = {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  fetchImpl?: typeof fetch;
};

type LushaRequestOptions = {
  method: HttpMethod;
  path: string;
  body?: unknown;
};

export class LushaConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "LushaConfigurationError";
  }
}

export class LushaError extends Error {
  public readonly status: number;
  public readonly endpoint: string;
  public readonly details?: unknown;
  public readonly retryAfter?: string | null;

  constructor(
    message: string,
    options: {
      status: number;
      endpoint: string;
      details?: unknown;
      retryAfter?: string | null;
    },
  ) {
    super(message);
    this.name = "LushaError";
    this.status = options.status;
    this.endpoint = options.endpoint;
    this.details = options.details;
    this.retryAfter = options.retryAfter;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function responseMessage(body: unknown, fallback: string): string {
  if (isRecord(body) && typeof body.message === "string") {
    return body.message;
  }

  if (isRecord(body) && typeof body.error === "string") {
    return body.error;
  }

  return fallback;
}

async function parseResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();
  if (!text) return undefined;

  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export class LushaClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;
  private readonly fetchImpl: typeof fetch;

  constructor(options: LushaClientOptions = {}) {
    const apiKey = options.apiKey ?? config.LUSHA_API_KEY;
    if (!apiKey) {
      throw new LushaConfigurationError(
        "LUSHA_API_KEY is not configured for custom Lusha routes.",
      );
    }

    this.apiKey = apiKey;
    this.baseUrl = options.baseUrl ?? config.LUSHA_BASE_URL;
    this.timeoutMs = options.timeoutMs ?? config.LUSHA_TIMEOUT_MS;
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch;
  }

  async request<T = unknown>(options: LushaRequestOptions): Promise<T> {
    const url = new URL(options.path, this.baseUrl).toString();
    const abortController = new AbortController();
    const timeout = setTimeout(() => abortController.abort(), this.timeoutMs);

    try {
      const response = await this.fetchImpl(url, {
        method: options.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          api_key: this.apiKey,
        },
        body:
          options.method === "POST"
            ? JSON.stringify(options.body ?? {})
            : undefined,
        signal: abortController.signal,
      });

      const body = await parseResponseBody(response);

      if (!response.ok) {
        throw new LushaError(
          responseMessage(body, response.statusText || "Lusha request failed"),
          {
            status: response.status,
            endpoint: options.path,
            details: body,
            retryAfter: response.headers.get("retry-after"),
          },
        );
      }

      return body as T;
    } catch (error) {
      if (error instanceof LushaError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new LushaError("Lusha request timed out", {
          status: 504,
          endpoint: options.path,
        });
      }

      throw new LushaError(
        error instanceof Error ? error.message : "Lusha request failed",
        {
          status: 502,
          endpoint: options.path,
        },
      );
    } finally {
      clearTimeout(timeout);
    }
  }

  getAccountUsage() {
    return this.request({
      method: "GET",
      path: "/v3/account/usage",
    });
  }

  searchContacts(body: unknown) {
    return this.request({
      method: "POST",
      path: "/v3/contacts/search",
      body,
    });
  }

  enrichContacts(body: unknown) {
    return this.request({
      method: "POST",
      path: "/v3/contacts/enrich",
      body,
    });
  }

  searchAndEnrichContacts(body: unknown) {
    return this.request({
      method: "POST",
      path: "/v3/contacts/search-and-enrich",
      body,
    });
  }

  searchCompanies(body: unknown) {
    return this.request({
      method: "POST",
      path: "/v3/companies/search",
      body,
    });
  }

  enrichCompanies(body: unknown) {
    return this.request({
      method: "POST",
      path: "/v3/companies/enrich",
      body,
    });
  }

  searchAndEnrichCompanies(body: unknown) {
    return this.request({
      method: "POST",
      path: "/v3/companies/search-and-enrich",
      body,
    });
  }
}

export function createLushaClient(options?: LushaClientOptions) {
  return new LushaClient(options);
}
