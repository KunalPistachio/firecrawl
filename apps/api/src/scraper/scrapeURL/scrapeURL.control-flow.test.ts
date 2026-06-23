import "dotenv/config";
import type { Mock } from "vitest";

import { config } from "../../config";
config.ENV = "test";

import { scrapeOptions } from "../../controllers/v2/types";
import { CostTracking } from "../../lib/cost-tracking";
import { EngineError } from "./error";

const {
  buildFallbackListMock,
  scrapeURLWithEngineMock,
  scrapePDFMock,
  scrapeDocumentMock,
} = vi.hoisted(() => ({
  buildFallbackListMock: vi.fn(),
  scrapeURLWithEngineMock: vi.fn(),
  scrapePDFMock: vi.fn(),
  scrapeDocumentMock: vi.fn(),
}));

vi.mock("./engines", async importOriginal => {
  const actual = await importOriginal<typeof import("./engines")>();
  return {
    ...actual,
    buildFallbackList: buildFallbackListMock,
    scrapeURLWithEngine: scrapeURLWithEngineMock,
    shouldUseIndex: vi.fn(() => false),
  };
});

vi.mock("./postprocessors", () => ({
  postprocessors: [],
}));

vi.mock("./transformers", () => ({
  executeTransformers: vi.fn((_meta, document) => document),
}));

vi.mock("./engines/pdf", async importOriginal => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    scrapePDF: scrapePDFMock,
  };
});

vi.mock("./engines/document", async importOriginal => {
  const actual = (await importOriginal()) as object;
  return {
    ...actual,
    scrapeDocument: scrapeDocumentMock,
  };
});

vi.mock("../../lib/html-to-markdown", () => ({
  parseMarkdown: vi.fn(async html => html),
}));

import { scrapeURL } from ".";

function engineResult(overrides: Record<string, unknown> = {}) {
  return {
    url: "https://example.com",
    html: "<main>ok</main>",
    statusCode: 200,
    proxyUsed: "basic",
    ...overrides,
  };
}

describe("scrapeURL main engine control flow", () => {
  beforeEach(() => {
    buildFallbackListMock.mockReset();
    scrapeURLWithEngineMock.mockReset();
    scrapePDFMock.mockReset();
    scrapeDocumentMock.mockReset();
  });

  it("does not waterfall to another main engine when the selected main engine fails", async () => {
    buildFallbackListMock.mockResolvedValue([
      { engine: "fire-engine;chrome-cdp", unsupportedFeatures: new Set() },
      { engine: "fetch", unsupportedFeatures: new Set() },
    ]);
    scrapeURLWithEngineMock.mockRejectedValue(new EngineError("failed"));

    const out = await scrapeURL(
      "test:no-waterfall",
      "https://example.com",
      scrapeOptions.parse({ maxAge: 0 }),
      { teamId: "test" },
      new CostTracking(),
    );

    expect(out.success).toBe(false);
    expect(scrapeURLWithEngineMock).toHaveBeenCalledTimes(1);
    expect(scrapeURLWithEngineMock.mock.calls[0][1]).toBe(
      "fire-engine;chrome-cdp",
    );
  });

  it("retries the selected main engine with enhanced proxy when required", async () => {
    buildFallbackListMock.mockResolvedValue([
      { engine: "fire-engine;chrome-cdp", unsupportedFeatures: new Set() },
      { engine: "fetch", unsupportedFeatures: new Set() },
    ]);
    (scrapeURLWithEngineMock as Mock)
      .mockResolvedValueOnce(
        engineResult({
          html: "<main>blocked</main>",
          statusCode: 403,
          proxyUsed: "basic",
        }),
      )
      .mockResolvedValueOnce(
        engineResult({
          html: "<main>enhanced ok</main>",
          statusCode: 200,
          proxyUsed: "stealth",
        }),
      );

    const out = await scrapeURL(
      "test:enhanced-retry",
      "https://example.com",
      scrapeOptions.parse({ maxAge: 0, proxy: "auto" }),
      { teamId: "test" },
      new CostTracking(),
    );

    expect(out.success).toBe(true);
    expect(scrapeURLWithEngineMock).toHaveBeenCalledTimes(2);
    expect(scrapeURLWithEngineMock.mock.calls.map(call => call[1])).toEqual([
      "fire-engine;chrome-cdp",
      "fire-engine;chrome-cdp;stealth",
    ]);
  });

  it("runs PDF processing on binary content returned by the main engine", async () => {
    buildFallbackListMock.mockResolvedValue([
      { engine: "fetch", unsupportedFeatures: new Set() },
      { engine: "pdf", unsupportedFeatures: new Set() },
    ]);
    const fetchedPdf = engineResult({
      html: "%PDF-1.4",
      bodyBuffer: Buffer.from("%PDF-1.4"),
      contentType: "application/pdf",
    });
    scrapeURLWithEngineMock.mockResolvedValue(fetchedPdf);
    scrapePDFMock.mockResolvedValue(
      engineResult({
        markdown: "processed pdf",
        html: "<main>processed pdf</main>",
        contentType: "application/pdf",
      }),
    );

    const out = await scrapeURL(
      "test:pdf-postprocessor",
      "https://example.com/file.pdf",
      scrapeOptions.parse({ maxAge: 0 }),
      { teamId: "test" },
      new CostTracking(),
    );

    expect(out.success).toBe(true);
    expect(scrapeURLWithEngineMock).toHaveBeenCalledTimes(1);
    expect(scrapeURLWithEngineMock.mock.calls[0][1]).toBe("fetch");
    expect(scrapePDFMock).toHaveBeenCalledWith(expect.any(Object), fetchedPdf);
  });

  it("passes uploaded PDF bytes to the configured main engine", async () => {
    buildFallbackListMock.mockResolvedValue([
      { engine: "fetch", unsupportedFeatures: new Set() },
    ]);
    const fetchedPdf = engineResult({
      html: "%PDF-1.4",
      bodyBuffer: Buffer.from("%PDF-1.4"),
      contentType: "application/pdf",
    });
    scrapeURLWithEngineMock.mockResolvedValue(fetchedPdf);
    scrapePDFMock.mockResolvedValue(
      engineResult({
        markdown: "uploaded pdf",
        html: "<main>uploaded pdf</main>",
        contentType: "application/pdf",
      }),
    );

    const uploadedBuffer = Buffer.from("%PDF-1.4 uploaded");
    const out = await scrapeURL(
      "test:uploaded-pdf",
      "https://parse.firecrawl.dev/uploads/upload.pdf",
      scrapeOptions.parse({ maxAge: 0 }),
      {
        teamId: "test",
        forceEngine: "fetch",
        uploadedFile: {
          filename: "upload.pdf",
          contentType: "application/pdf",
          buffer: uploadedBuffer,
          kind: "pdf",
        },
      },
      new CostTracking(),
    );

    expect(out.success).toBe(true);
    expect(scrapeURLWithEngineMock).toHaveBeenCalledTimes(1);
    expect(scrapeURLWithEngineMock.mock.calls[0][0].fetchPrefetch).toEqual(
      expect.objectContaining({
        bodyBuffer: uploadedBuffer,
        contentType: "application/pdf",
      }),
    );
  });

  it("runs document processing on binary content returned by the main engine", async () => {
    buildFallbackListMock.mockResolvedValue([
      { engine: "fetch", unsupportedFeatures: new Set() },
      { engine: "document", unsupportedFeatures: new Set() },
    ]);
    const fetchedDocument = engineResult({
      html: "PK fake docx",
      bodyBuffer: Buffer.from("PK fake docx"),
      contentType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    scrapeURLWithEngineMock.mockResolvedValue(fetchedDocument);
    scrapeDocumentMock.mockResolvedValue(
      engineResult({
        markdown: "processed document",
        html: "<main>processed document</main>",
        contentType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    );

    const out = await scrapeURL(
      "test:document-postprocessor",
      "https://example.com/file.docx",
      scrapeOptions.parse({ maxAge: 0 }),
      { teamId: "test" },
      new CostTracking(),
    );

    expect(out.success).toBe(true);
    expect(scrapeURLWithEngineMock).toHaveBeenCalledTimes(1);
    expect(scrapeURLWithEngineMock.mock.calls[0][1]).toBe("fetch");
    expect(scrapeDocumentMock).toHaveBeenCalledWith(
      expect.any(Object),
      fetchedDocument,
    );
  });
});
