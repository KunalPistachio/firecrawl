import { resolveMx } from "node:dns/promises";
import { isIP } from "node:net";

type DomainInspectionOptions = {
  checkMx?: boolean;
  checkWebsite?: boolean;
  timeoutMs?: number;
  concurrency?: number;
};

type MxStatus = "found" | "not_found" | "error" | "skipped";
type WebsiteStatus =
  | "active"
  | "redirecting"
  | "not_found"
  | "parked"
  | "inactive"
  | "timeout"
  | "error"
  | "skipped";

export type MxInspection = {
  status: MxStatus;
  provider: string;
  records: Array<{ exchange: string; priority: number }>;
  error?: string;
};

export type WebsiteInspection = {
  status: WebsiteStatus;
  startUrl?: string;
  finalUrl?: string;
  statusCode?: number;
  redirects: Array<{ from: string; to: string; statusCode: number }>;
  error?: string;
};

export type DomainInspectionResult = {
  input: string;
  domain: string;
  mx: MxInspection;
  website: WebsiteInspection;
  elapsedMs: number;
  error?: string;
};

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_CONCURRENCY = 8;
const MAX_REDIRECTS = 6;

const skippedMx: MxInspection = {
  status: "skipped",
  provider: "Skipped",
  records: [],
};

const skippedWebsite: WebsiteInspection = {
  status: "skipped",
  redirects: [],
};

export async function inspectDomains(
  inputs: string[],
  options: DomainInspectionOptions = {},
): Promise<DomainInspectionResult[]> {
  const concurrency = Math.max(
    1,
    Math.min(options.concurrency ?? DEFAULT_CONCURRENCY, 16),
  );
  const queue = inputs.slice();
  const results: DomainInspectionResult[] = [];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length > 0) {
      const input = queue.shift();
      if (!input) continue;
      results.push(await inspectDomain(input, options));
    }
  });

  await Promise.all(workers);

  const order = new Map(inputs.map((input, index) => [input, index]));
  return results.sort(
    (a, b) => (order.get(a.input) ?? 0) - (order.get(b.input) ?? 0),
  );
}

export async function inspectDomain(
  input: string,
  options: DomainInspectionOptions = {},
): Promise<DomainInspectionResult> {
  const started = Date.now();
  try {
    const domain = normalizeDomainInput(input);
    const [mx, website] = await Promise.all([
      options.checkMx === false ? skippedMx : inspectMx(domain),
      options.checkWebsite === false
        ? skippedWebsite
        : inspectWebsite(domain, options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    ]);

    return {
      input,
      domain,
      mx,
      website,
      elapsedMs: Date.now() - started,
    };
  } catch (error) {
    return {
      input,
      domain: "",
      mx: skippedMx,
      website: {
        status: "error",
        redirects: [],
        error: errorMessage(error),
      },
      elapsedMs: Date.now() - started,
      error: errorMessage(error),
    };
  }
}

export function normalizeDomainInput(input: string): string {
  const raw = input.trim();
  if (!raw) throw new Error("Domain is empty.");

  const urlText = /^[a-z][a-z0-9+.-]*:\/\//i.test(raw)
    ? raw
    : `https://${raw}`;
  let host: string;

  try {
    host = new URL(urlText).hostname.toLowerCase();
  } catch {
    throw new Error(`Invalid domain: ${input}`);
  }

  host = host.replace(/^www\./i, "");
  if (!host || host === "localhost" || !host.includes(".") || isIP(host)) {
    throw new Error(`Unsupported domain: ${host || input}`);
  }

  return host;
}

async function inspectMx(domain: string): Promise<MxInspection> {
  try {
    const records = (await resolveMx(domain))
      .map(record => ({
        exchange: record.exchange.toLowerCase().replace(/\.$/, ""),
        priority: record.priority,
      }))
      .sort((a, b) => a.priority - b.priority || a.exchange.localeCompare(b.exchange));

    if (records.length === 0) {
      return {
        status: "not_found",
        provider: "No MX",
        records: [],
      };
    }

    return {
      status: "found",
      provider: classifyMxProvider(records.map(record => record.exchange)),
      records,
    };
  } catch (error) {
    const code = typeof error === "object" && error ? (error as any).code : "";
    if (code === "ENODATA" || code === "ENOTFOUND" || code === "NODATA") {
      return {
        status: "not_found",
        provider: "No MX",
        records: [],
      };
    }

    return {
      status: "error",
      provider: "Unknown",
      records: [],
      error: errorMessage(error),
    };
  }
}

export function classifyMxProvider(exchanges: string[]): string {
  const haystack = exchanges.join(" ").toLowerCase();

  if (
    haystack.includes("aspmx.l.google.com") ||
    haystack.includes("smtp.google.com") ||
    haystack.includes("googlemail.com")
  ) {
    return "Google Workspace";
  }
  if (
    haystack.includes("protection.outlook.com") ||
    haystack.includes("mail.protection.outlook.com") ||
    haystack.includes("outlook.com")
  ) {
    return "Microsoft 365";
  }
  if (haystack.includes("zohomail") || haystack.includes("zoho.")) {
    return "Zoho Mail";
  }
  if (haystack.includes("messagingengine.com")) {
    return "Fastmail";
  }
  if (haystack.includes("pphosted.com")) {
    return "Proofpoint";
  }
  if (haystack.includes("mimecast")) {
    return "Mimecast";
  }
  if (haystack.includes("barracudanetworks.com")) {
    return "Barracuda";
  }
  if (haystack.includes("mx.cloudflare.net")) {
    return "Cloudflare Email Routing";
  }
  if (haystack.includes("amazonses.com")) {
    return "Amazon SES";
  }
  if (haystack.includes("mailgun.org")) {
    return "Mailgun";
  }
  if (haystack.includes("sendgrid.net")) {
    return "SendGrid";
  }
  if (haystack.includes("secureserver.net")) {
    return "GoDaddy";
  }
  if (haystack.includes("mailchannels.net")) {
    return "MailChannels";
  }

  return "Other";
}

async function inspectWebsite(
  domain: string,
  timeoutMs: number,
): Promise<WebsiteInspection> {
  const attempts = [`https://${domain}`, `http://${domain}`];
  let last: WebsiteInspection | null = null;

  for (const startUrl of attempts) {
    const result = await fetchWithRedirects(startUrl, timeoutMs);
    if (result.status !== "inactive" && result.status !== "error") {
      return result;
    }
    last = result;
  }

  return (
    last ?? {
      status: "inactive",
      startUrl: attempts[0],
      redirects: [],
      error: "No website response.",
    }
  );
}

async function fetchWithRedirects(
  startUrl: string,
  timeoutMs: number,
): Promise<WebsiteInspection> {
  const redirects: WebsiteInspection["redirects"] = [];
  let currentUrl = startUrl;

  for (let i = 0; i <= MAX_REDIRECTS; i += 1) {
    let response: Response;
    try {
      response = await fetchWithTimeout(currentUrl, timeoutMs);
    } catch (error) {
      return fetchErrorStatus(startUrl, currentUrl, redirects, error);
    }

    const statusCode = response.status;
    const location = response.headers.get("location");
    if (isRedirectStatus(statusCode) && location) {
      const nextUrl = new URL(location, currentUrl).href;
      redirects.push({ from: currentUrl, to: nextUrl, statusCode });
      currentUrl = nextUrl;
      continue;
    }

    const body = await readTextSafely(response);
    const parked = looksParked(body);

    return {
      status: parked
        ? "parked"
        : classifyWebsiteStatus(statusCode, redirects.length > 0),
      startUrl,
      finalUrl: currentUrl,
      statusCode,
      redirects,
    };
  }

  return {
    status: "redirecting",
    startUrl,
    finalUrl: currentUrl,
    redirects,
    error: "Maximum redirect depth reached.",
  };
}

async function fetchWithTimeout(
  url: string,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      redirect: "manual",
      signal: controller.signal,
      headers: {
        accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "user-agent":
          "Mozilla/5.0 (compatible; LocalCompanyResearch/1.0; +https://firecrawl.dev)",
      },
    });
  } finally {
    clearTimeout(timer);
  }
}

function fetchErrorStatus(
  startUrl: string,
  finalUrl: string,
  redirects: WebsiteInspection["redirects"],
  error: unknown,
): WebsiteInspection {
  const message = errorMessage(error);
  const code = typeof error === "object" && error ? (error as any).code : "";
  const lower = message.toLowerCase();

  if ((error as any)?.name === "AbortError" || lower.includes("aborted")) {
    return {
      status: "timeout",
      startUrl,
      finalUrl,
      redirects,
      error: message,
    };
  }

  if (
    code === "ENOTFOUND" ||
    code === "EAI_AGAIN" ||
    lower.includes("enotfound") ||
    lower.includes("getaddrinfo")
  ) {
    return {
      status: "inactive",
      startUrl,
      finalUrl,
      redirects,
      error: message,
    };
  }

  return {
    status: "error",
    startUrl,
    finalUrl,
    redirects,
    error: message,
  };
}

function classifyWebsiteStatus(
  statusCode: number,
  hasRedirects: boolean,
): WebsiteStatus {
  if (statusCode === 404 || statusCode === 410) return "not_found";
  if (statusCode >= 200 && statusCode < 400) {
    return hasRedirects ? "redirecting" : "active";
  }
  if (statusCode === 401 || statusCode === 403) return "active";
  if (statusCode >= 500) return "error";
  return "active";
}

function isRedirectStatus(statusCode: number): boolean {
  return [301, 302, 303, 307, 308].includes(statusCode);
}

async function readTextSafely(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.toLowerCase().includes("text/html")) return "";

  try {
    return await response.text();
  } catch {
    return "";
  }
}

function looksParked(body: string): boolean {
  const text = body.toLowerCase();
  return [
    "domain is for sale",
    "buy this domain",
    "this domain is parked",
    "parkingcrew",
    "sedo domain parking",
    "bodis.com",
    "afternic",
    "hugedomains",
  ].some(pattern => text.includes(pattern));
}

function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}
