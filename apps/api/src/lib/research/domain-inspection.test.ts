import { resolveMx } from "node:dns/promises";
import {
  classifyMxProvider,
  inspectDomain,
  normalizeDomainInput,
} from "./domain-inspection";

vi.mock("node:dns/promises", () => ({
  resolveMx: vi.fn(),
}));

const resolveMxMock = vi.mocked(resolveMx);

describe("domain inspection", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it("normalizes website inputs to domains", () => {
    expect(normalizeDomainInput("https://www.example.com/path")).toBe(
      "example.com",
    );
    expect(normalizeDomainInput("example.com")).toBe("example.com");
  });

  it("classifies common MX providers", () => {
    expect(classifyMxProvider(["aspmx.l.google.com"])).toBe(
      "Google Workspace",
    );
    expect(classifyMxProvider(["smtp.google.com"])).toBe("Google Workspace");
    expect(classifyMxProvider(["tenant.mail.protection.outlook.com"])).toBe(
      "Microsoft 365",
    );
    expect(classifyMxProvider(["mx.unknown-provider.test"])).toBe("Other");
  });

  it("detects Google MX and website redirects", async () => {
    resolveMxMock.mockResolvedValue([
      { exchange: "aspmx.l.google.com", priority: 1 },
    ]);

    const fetchMock = vi.mocked(fetch);
    fetchMock
      .mockResolvedValueOnce(
        new Response("", {
          status: 301,
          headers: { location: "https://www.example.com/" },
        }),
      )
      .mockResolvedValueOnce(
        new Response("<html><title>Example</title></html>", {
          status: 200,
          headers: { "content-type": "text/html" },
        }),
      );

    const result = await inspectDomain("example.com", { timeoutMs: 1000 });

    expect(result.domain).toBe("example.com");
    expect(result.mx.status).toBe("found");
    expect(result.mx.provider).toBe("Google Workspace");
    expect(result.website.status).toBe("redirecting");
    expect(result.website.finalUrl).toBe("https://www.example.com/");
    expect(result.website.redirects).toHaveLength(1);
  });

  it("reports missing MX and inactive websites", async () => {
    resolveMxMock.mockRejectedValue(
      Object.assign(new Error("queryMx ENOTFOUND example.invalid"), {
        code: "ENOTFOUND",
      }),
    );

    vi.mocked(fetch).mockRejectedValue(
      Object.assign(new Error("getaddrinfo ENOTFOUND example.invalid"), {
        code: "ENOTFOUND",
      }),
    );

    const result = await inspectDomain("example.invalid", { timeoutMs: 1000 });

    expect(result.mx.status).toBe("not_found");
    expect(result.mx.provider).toBe("No MX");
    expect(result.website.status).toBe("inactive");
  });
});
