import express, { NextFunction, Request, Response } from "express";
import request from "supertest";
import { config } from "../../../config";
import { createLushaClient } from "../../../lib/lusha/client";
import { inspectDomains } from "../../../lib/research/domain-inspection";
import { customRouter } from "../../../routes/custom";

vi.mock("../../../lib/lusha/client", () => {
  class LushaConfigurationError extends Error {
    constructor(message: string) {
      super(message);
      this.name = "LushaConfigurationError";
    }
  }

  class LushaError extends Error {
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

  return {
    createLushaClient: vi.fn(),
    LushaConfigurationError,
    LushaError,
  };
});

vi.mock("../../../lib/research/domain-inspection", () => ({
  inspectDomains: vi.fn(),
}));

const originalConfig = {
  CUSTOM_API_KEY: config.CUSTOM_API_KEY,
  LUSHA_API_KEY: config.LUSHA_API_KEY,
  LUSHA_BASE_URL: config.LUSHA_BASE_URL,
  LUSHA_TIMEOUT_MS: config.LUSHA_TIMEOUT_MS,
};

function testApp() {
  const app = express();
  app.use(express.json());
  app.use("/v2/custom", customRouter);
  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    res.status(500).json({
      success: false,
      error: err instanceof Error ? err.message : String(err),
    });
  });
  return app;
}

const createLushaClientMock = vi.mocked(createLushaClient);
const inspectDomainsMock = vi.mocked(inspectDomains);

function mockLushaClient() {
  const client = {
    getAccountUsage: vi.fn(),
    searchContacts: vi.fn(),
    enrichContacts: vi.fn(),
    searchAndEnrichContacts: vi.fn(),
    searchCompanies: vi.fn(),
    enrichCompanies: vi.fn(),
    searchAndEnrichCompanies: vi.fn(),
  };

  createLushaClientMock.mockReturnValue(client as any);
  return client;
}

describe("custom Lusha routes", () => {
  beforeEach(() => {
    config.CUSTOM_API_KEY = "custom-test-key";
    config.LUSHA_API_KEY = "lusha-test-key";
    config.LUSHA_BASE_URL = "https://api.lusha.com";
    config.LUSHA_TIMEOUT_MS = 30000;
  });

  afterEach(() => {
    config.CUSTOM_API_KEY = originalConfig.CUSTOM_API_KEY;
    config.LUSHA_API_KEY = originalConfig.LUSHA_API_KEY;
    config.LUSHA_BASE_URL = originalConfig.LUSHA_BASE_URL;
    config.LUSHA_TIMEOUT_MS = originalConfig.LUSHA_TIMEOUT_MS;
    vi.clearAllMocks();
  });

  it("serves the local workbench without the custom API key", async () => {
    const response = await request(testApp()).get("/v2/custom");

    expect(response.statusCode).toBe(200);
    expect(response.headers["content-type"]).toContain("text/html");
    expect(response.text).toContain("Local Firecrawl Workbench");
    expect(response.text).toContain("Company Research");
    expect(response.text).toContain("Command Center");
    expect(response.text).toContain("New List");
    expect(response.text).toContain("Save List");
    expect(response.text).toContain("Recent Runs");
    expect(response.text).toContain("Contacts Workspace");
    expect(response.text).toContain("Export Packages");
    expect(response.text).toContain("Settings and providers");
    expect(response.text).toContain("Bulk Research");
    expect(response.text).toContain("Company Table");
    expect(response.text).toContain("Website Snapshot");
    expect(response.text).toContain("Data Quality");
    expect(response.text).toContain("Smart keywords");
    expect(response.text).toContain("Search or paste a domain");
    expect(response.text).toContain("Run Research");
    expect(response.text).toContain("MX provider");
    expect(response.text).toContain("Mail Server");
    expect(response.text).toContain("Domain status");
    expect(response.text).toContain("Contact emails");
    expect(response.text).toContain("Cleaned view");
    expect(response.text).toContain("Contact Emails");
    expect(response.text).toContain("MX Records");
  });

  it("rejects requests without the custom API key", async () => {
    const response = await request(testApp()).get(
      "/v2/custom/lusha/account/usage",
    );

    expect(response.statusCode).toBe(401);
    expect(response.body.success).toBe(false);
  });

  it("proxies account usage through the Lusha client", async () => {
    const client = mockLushaClient();
    client.getAccountUsage.mockResolvedValue({ credits: { remaining: 17 } });

    const response = await request(testApp())
      .get("/v2/custom/lusha/account/usage")
      .set("x-custom-api-key", "custom-test-key");

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.provider).toEqual({
      name: "lusha",
      endpoint: "/v3/account/usage",
    });
    expect(response.body.data).toEqual({ credits: { remaining: 17 } });
    expect(createLushaClientMock).toHaveBeenCalledOnce();
    expect(client.getAccountUsage).toHaveBeenCalledOnce();
  });

  it("serves domain inspection without the custom API key", async () => {
    inspectDomainsMock.mockResolvedValue([
      {
        input: "example.com",
        domain: "example.com",
        mx: {
          status: "found",
          provider: "Google Workspace",
          records: [{ exchange: "aspmx.l.google.com", priority: 1 }],
        },
        website: {
          status: "active",
          startUrl: "https://example.com",
          finalUrl: "https://example.com",
          statusCode: 200,
          redirects: [],
        },
        elapsedMs: 12,
      },
    ]);

    const response = await request(testApp())
      .post("/v2/custom/research/domains/inspect")
      .send({
        domains: ["example.com"],
        checkMx: true,
        checkWebsite: false,
        timeoutMs: 5000,
      });

    expect(response.statusCode).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data[0].mx.provider).toBe("Google Workspace");
    expect(inspectDomainsMock).toHaveBeenCalledWith(["example.com"], {
      checkMx: true,
      checkWebsite: false,
      timeoutMs: 5000,
      concurrency: undefined,
    });
  });

  it("requires explicit spend confirmation for contact search-and-enrich", async () => {
    const client = mockLushaClient();

    const response = await request(testApp())
      .post("/v2/custom/lusha/contacts/search-and-enrich")
      .set("x-custom-api-key", "custom-test-key")
      .send({
        contacts: [
          {
            firstName: "Orit",
            lastName: "Shilvock",
            companyDomain: "lusha.com",
          },
        ],
        reveal: ["emails"],
      });

    expect(response.statusCode).toBe(400);
    expect(response.body.success).toBe(false);
    expect(client.searchAndEnrichContacts).not.toHaveBeenCalled();
  });

  it("strips confirmSpend before forwarding paid contact requests", async () => {
    const client = mockLushaClient();
    client.searchAndEnrichContacts.mockResolvedValue({
      requestId: "req_123",
      results: [],
      billing: { creditsCharged: 0, resultsReturned: 0 },
    });

    const response = await request(testApp())
      .post("/v2/custom/lusha/contacts/search-and-enrich")
      .set("x-custom-api-key", "custom-test-key")
      .send({
        confirmSpend: true,
        contacts: [
          {
            firstName: "Orit",
            lastName: "Shilvock",
            companyDomain: "lusha.com",
          },
        ],
        reveal: ["emails"],
      });

    expect(response.statusCode).toBe(200);
    expect(client.searchAndEnrichContacts).toHaveBeenCalledWith({
      contacts: [
        {
          firstName: "Orit",
          lastName: "Shilvock",
          companyDomain: "lusha.com",
        },
      ],
      reveal: ["emails"],
    });
  });
});
