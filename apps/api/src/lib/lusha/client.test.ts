import { config } from "../../config";
import { LushaClient, LushaConfigurationError, LushaError } from "./client";

const originalConfig = {
  LUSHA_API_KEY: config.LUSHA_API_KEY,
  LUSHA_BASE_URL: config.LUSHA_BASE_URL,
  LUSHA_TIMEOUT_MS: config.LUSHA_TIMEOUT_MS,
};

describe("LushaClient", () => {
  afterEach(() => {
    config.LUSHA_API_KEY = originalConfig.LUSHA_API_KEY;
    config.LUSHA_BASE_URL = originalConfig.LUSHA_BASE_URL;
    config.LUSHA_TIMEOUT_MS = originalConfig.LUSHA_TIMEOUT_MS;
    vi.restoreAllMocks();
  });

  it("sends the api_key header and parses account usage responses", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          credits: { remaining: 42 },
        }),
        { status: 200 },
      );
    });

    const client = new LushaClient({
      apiKey: "lusha-test-key",
      baseUrl: "https://api.lusha.com",
      fetchImpl: fetchImpl as typeof fetch,
    });

    const result = await client.getAccountUsage();

    expect(result).toEqual({ credits: { remaining: 42 } });
    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.lusha.com/v3/account/usage",
      expect.objectContaining({
        method: "GET",
        headers: expect.objectContaining({
          api_key: "lusha-test-key",
          Accept: "application/json",
        }),
      }),
    );
  });

  it("normalizes Lusha error responses", async () => {
    const fetchImpl = vi.fn(async () => {
      return new Response(JSON.stringify({ message: "Rate limit exceeded" }), {
        status: 429,
        headers: { "retry-after": "12" },
      });
    });

    const client = new LushaClient({
      apiKey: "lusha-test-key",
      baseUrl: "https://api.lusha.com",
      fetchImpl: fetchImpl as typeof fetch,
    });

    await expect(client.searchContacts({ contacts: [] })).rejects.toMatchObject(
      {
        name: "LushaError",
        message: "Rate limit exceeded",
        status: 429,
        endpoint: "/v3/contacts/search",
        retryAfter: "12",
      } satisfies Partial<LushaError>,
    );
  });

  it("fails fast when no API key is configured", () => {
    config.LUSHA_API_KEY = "";

    expect(() => new LushaClient()).toThrow(LushaConfigurationError);
  });
});
