import { config } from "../../config";
import { withSpan, setSpanAttributes } from "../../lib/otel-tracer";
import { captureExceptionWithZdrCheck } from "../../services/sentry";

import {
  type Document,
  getPDFMaxPages,
  scrapeOptions,
  type ScrapeOptions,
} from "../../controllers/v2/types";
import { logger as _logger } from "../../lib/logger";
import {
  BrowserCookie,
  buildFallbackList,
  Engine,
  EngineScrapeResult,
  getEngineMaxReasonableTime,
  scrapeURLWithEngine,
  shouldUseIndex,
} from "./engines";
import { parseMarkdown } from "../../lib/html-to-markdown";
import { hasFormatOfType } from "../../lib/format-utils";
import {
  ActionError,
  AgentIndexOnlyError,
  EngineError,
  NoEnginesLeftError,
  SiteError,
  UnsupportedFileError,
  SSLError,
  PDFInsufficientTimeError,
  PDFOCRRequiredError,
  IndexMissError,
  NoCachedDataError,
  LockdownMissError,
  DNSResolutionError,
  ZDRViolationError,
  PDFPrefetchFailed,
  DocumentPrefetchFailed,
  FEPageLoadFailed,
  EngineSnipedError,
  WaterfallNextEngineSignal,
  EngineUnsuccessfulError,
  ProxySelectionError,
  BrandingNotSupportedError,
  XTwitterConfigurationError,
} from "./error";
import { executeTransformers } from "./transformers";
import { LLMRefusalError } from "./transformers/llmExtract";
import { shouldCheckRobots } from "./shouldCheckRobots";
import { CostTracking } from "../../lib/cost-tracking";
import { useIndex } from "../../services/index";
import {
  fetchRobotsTxt,
  createRobotsChecker,
  isUrlAllowedByRobots,
} from "../../lib/robots-txt";
import { getCrawl } from "../../lib/crawl-redis";
import {
  AbortInstance,
  AbortManager,
  AbortManagerThrownError,
} from "./lib/abortManager";
import {
  ScrapeJobTimeoutError,
  CrawlDenialError,
  ActionsNotSupportedError,
} from "../../lib/error";
import { htmlTransform } from "./lib/removeUnwantedElements";
import { postprocessors } from "./postprocessors";
import { rewriteUrl } from "./lib/rewriteUrl";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { buildMetaObject, Meta } from "./lib/meta";
import { FeatureFlag } from "./lib/feature-flags";
import { ScrapeUrlResponse } from ".";
import { InternalOptions } from "./lib/internal-options";

// The meta object contains all required information to perform a scrape.
// For example, the scrape ID, URL, options, feature flags, logs that occur while scraping.
// The meta object is usually immutable, except for the logs array, and in edge cases (e.g. a new feature is suddenly required)
// Having a meta object that is treated as immutable helps the code stay clean and easily tracable,
// while also retaining the benefits that WebScraper had from its OOP design.

type EngineScrapeResultWithContext = {
  engine: Engine;
  unsupportedFeatures: Set<FeatureFlag>;
  result: EngineScrapeResult;
};

const MAX_HTML_SIZE_FOR_MARKDOWN_CHECK = 300 * 1024; // 300KB

async function scrapeURLLoopIter(
  meta: Meta,
  engine: Engine,
  snipeAbort,
): Promise<EngineScrapeResult> {
  const abort = meta.abort.child(snipeAbort);
  try {
    const engineResult = await scrapeURLWithEngine(
      {
        ...meta,
        abort,
      },
      engine,
    );

    const hasMarkdown = hasFormatOfType(meta.options.formats, "markdown");
    const hasChangeTracking = hasFormatOfType(
      meta.options.formats,
      "changeTracking",
    );
    const hasJson = hasFormatOfType(meta.options.formats, "json");
    const hasSummary = hasFormatOfType(meta.options.formats, "summary");
    const hasQuestion = hasFormatOfType(meta.options.formats, "question");
    const hasHighlights = hasFormatOfType(meta.options.formats, "highlights");
    const hasQuery = hasFormatOfType(meta.options.formats, "query");
    const needsMarkdown =
      hasMarkdown ||
      hasChangeTracking ||
      hasJson ||
      hasSummary ||
      hasQuestion ||
      hasHighlights ||
      hasQuery;

    let checkMarkdown: string;
    const htmlSize = engineResult.html?.length ?? 0;
    const shouldSkipMarkdownCheck = htmlSize > MAX_HTML_SIZE_FOR_MARKDOWN_CHECK;

    if (
      meta.internalOptions.teamId === "sitemap" ||
      meta.internalOptions.teamId === "robots-txt"
    ) {
      checkMarkdown = engineResult.html?.trim() ?? "";
    } else if (!needsMarkdown) {
      checkMarkdown = engineResult.html?.trim() ?? "";
    } else if (shouldSkipMarkdownCheck) {
      // Skip markdown conversion for large HTML to avoid slowdowns
      meta.logger.debug(
        "Skipping markdown conversion for quality check due to large HTML size",
        {
          htmlSize,
          threshold: MAX_HTML_SIZE_FOR_MARKDOWN_CHECK,
        },
      );
      checkMarkdown = engineResult.html?.trim() ?? "";
    } else {
      const requestId = meta.id || meta.internalOptions.crawlId;
      const zeroDataRetention = meta.internalOptions.zeroDataRetention;

      checkMarkdown = await parseMarkdown(
        await htmlTransform(
          engineResult.html,
          meta.url,
          scrapeOptions.parse({ onlyMainContent: false }),
        ),
        { logger: meta.logger, requestId, zeroDataRetention },
      );
    }

    // Success factors
    const isLongEnough = checkMarkdown.trim().length > 0;
    const isGoodStatusCode =
      (engineResult.statusCode >= 200 && engineResult.statusCode < 300) ||
      engineResult.statusCode === 304;
    const hasNoPageError = engineResult.error === undefined;
    const isLikelyProxyError = [401, 403, 429].includes(
      engineResult.statusCode,
    );

    if (
      isLikelyProxyError &&
      meta.options.proxy === "auto" &&
      !meta.featureFlags.has("stealthProxy")
    ) {
      meta.logger.info(
        "Scrape via " +
          engine +
          " deemed unsuccessful due to proxy inadequacy. Adding stealthProxy flag.",
        {
          factors: { isLongEnough, isGoodStatusCode, hasNoPageError },
          statusCode: engineResult.statusCode,
          length: engineResult.html?.trim().length ?? 0,
        },
      );
      throw new AddFeatureError(["stealthProxy"]);
    }

    // NOTE: TODO: what to do when status code is bad is tough...
    // we cannot just rely on text because error messages can be brief and not hit the limit
    // should we just use all the fallbacks and pick the one with the longest text? - mogery
    if (isLongEnough || !isGoodStatusCode) {
      meta.logger.info("Scrape via " + engine + " deemed successful.", {
        factors: { isLongEnough, isGoodStatusCode, hasNoPageError },
      });
      return engineResult;
    } else {
      meta.logger.warn("Scrape via " + engine + " deemed unsuccessful.", {
        factors: { isLongEnough, isGoodStatusCode, hasNoPageError },
        length: engineResult.html?.trim().length ?? 0,
      });
      throw new EngineUnsuccessfulError(engine);
    }
  } finally {
    abort?.dispose();
  }
}

class WrappedEngineError extends Error {
  name = "WrappedEngineError";
  public engine: Engine;
  public error: any;

  constructor(engine: Engine, error: any) {
    super("WrappedEngineError");
    this.engine = engine;
    this.error = error;
  }
}

async function scrapeURLLoop(meta: Meta): Promise<ScrapeUrlResponse> {
  return withSpan("scrape.engine_loop", async span => {
    meta.logger.info(
      `Scraping URL ${JSON.stringify(meta.rewrittenUrl ?? meta.url)}...`,
    );

    setSpanAttributes(span, {
      "engine.url": meta.rewrittenUrl ?? meta.url,
      "engine.features": Array.from(meta.featureFlags).join(","),
    });

    if (meta.internalOptions.zeroDataRetention) {
      if (meta.featureFlags.has("screenshot")) {
        throw new ZDRViolationError("screenshot");
      }

      if (meta.featureFlags.has("screenshot@fullScreen")) {
        throw new ZDRViolationError("screenshot@fullScreen");
      }

      if (
        meta.options.actions &&
        meta.options.actions.find(x => x.type === "screenshot")
      ) {
        throw new ZDRViolationError("screenshot action");
      }

      if (
        meta.options.actions &&
        meta.options.actions.find(x => x.type === "pdf")
      ) {
        throw new ZDRViolationError("pdf action");
      }
    }

    // TODO: handle sitemap data, see WebScraper/index.ts:280
    // TODO: ScrapeEvents

    const fallbackList = await buildFallbackList(meta);

    // Check if actions are requested but no engines support them
    if (meta.featureFlags.has("actions")) {
      if (
        fallbackList.length === 0 ||
        fallbackList.every(engine => engine.unsupportedFeatures.has("actions"))
      ) {
        throw new ActionsNotSupportedError(
          "Actions are not supported by any available engines. Actions require Fire Engine (fire-engine) to be enabled.",
        );
      }
    }

    setSpanAttributes(span, {
      "engine.fallback_list": fallbackList.map(f => f.engine).join(","),
    });

    const snipeAbortController = new AbortController();
    const snipeAbort: AbortInstance = {
      signal: snipeAbortController.signal,
      tier: "engine",
      throwable() {
        return new EngineSnipedError();
      },
    };

    type EngineBundlePromise = {
      engine: Engine;
      unsupportedFeatures: Set<FeatureFlag>;
      promise: Promise<EngineScrapeResultWithContext>;
    };

    const remainingEngines = [...fallbackList];
    let enginePromises: EngineBundlePromise[] = [];
    const enginesAttempted: string[] = [];

    meta.abort.throwIfAborted();

    let result: EngineScrapeResultWithContext | null = null;

    while (remainingEngines.length > 0) {
      const { engine, unsupportedFeatures } = remainingEngines.shift()!;
      enginesAttempted.push(engine);

      const waitUntilWaterfall =
        getEngineMaxReasonableTime(meta, engine) +
        config.SCRAPEURL_ENGINE_WATERFALL_DELAY_MS;

      if (
        !isFinite(waitUntilWaterfall) ||
        isNaN(waitUntilWaterfall) ||
        waitUntilWaterfall <= 0
      ) {
        meta.logger.warn("Invalid waitUntilWaterfall value", {
          waitUntilWaterfall,
          timeout: meta.options.timeout,
          actions: !!meta.options.actions,
          hasJson: !!meta.options.formats?.find(x => x.type === "json"),
          remainingEngines: remainingEngines.length,
        });
      }

      meta.logger.info("Scraping via " + engine + "...", {
        waitUntilWaterfall,
      });

      enginePromises.push({
        engine,
        unsupportedFeatures,
        promise: (async () => {
          try {
            return {
              engine,
              unsupportedFeatures,
              result: await scrapeURLLoopIter(meta, engine, snipeAbort),
            };
          } catch (error) {
            throw new WrappedEngineError(engine, error);
          }
        })(),
      });

      while (true) {
        let timeouts: NodeJS.Timeout[] = [];
        try {
          result = await Promise.race([
            ...enginePromises.map(x => x.promise),
            ...(remainingEngines.length > 0
              ? [
                  new Promise<EngineScrapeResultWithContext>((_, reject) => {
                    timeouts.push(
                      setTimeout(() => {
                        reject(new WaterfallNextEngineSignal());
                      }, waitUntilWaterfall),
                    );
                  }),
                ]
              : []),
            new Promise<EngineScrapeResultWithContext>((_, reject) => {
              timeouts.push(
                setTimeout(() => {
                  try {
                    meta.abort.throwIfAborted();

                    // Fallback error if above doesn't throw
                    const usingDefaultTimeout =
                      meta.abort.scrapeTimeout() === undefined;
                    throw new ScrapeJobTimeoutError(
                      usingDefaultTimeout
                        ? "Scrape timed out due to maximum length of 5 minutes"
                        : "Scrape timed out",
                    );
                  } catch (error) {
                    reject(error);
                  }
                }, meta.abort.scrapeTimeout() ?? 300000),
              );
            }),
          ]);
          break;
        } catch (error) {
          if (error instanceof WrappedEngineError) {
            if (error.engine === "x-twitter") {
              meta.logger.warn("X/Twitter scrape failed fatally.", {
                error: error.error,
              });
              throw error.error;
            } else if (error.error instanceof EngineError) {
              meta.logger.warn(
                "Engine " + error.engine + " could not scrape the page.",
                {
                  error: error.error,
                },
              );
            } else if (error.error instanceof IndexMissError) {
              meta.logger.warn(
                "Engine " +
                  error.engine +
                  " could not find the page in the index.",
                {
                  error: error.error,
                },
              );
            } else if (
              error.error instanceof SiteError ||
              error.error instanceof SSLError ||
              error.error instanceof DNSResolutionError ||
              error.error instanceof ActionError ||
              error.error instanceof UnsupportedFileError ||
              error.error instanceof PDFOCRRequiredError ||
              error.error instanceof PDFInsufficientTimeError ||
              error.error instanceof ProxySelectionError ||
              error.error instanceof NoCachedDataError ||
              error.error instanceof AgentIndexOnlyError ||
              error.error instanceof XTwitterConfigurationError
            ) {
              throw error.error;
            } else if (error.error instanceof LLMRefusalError) {
              meta.logger.warn("LLM refusal encountered", {
                error: error.error,
              });
              throw error.error;
            } else if (error.error instanceof FEPageLoadFailed) {
              // This is the internal timeout bug on f-e and should be treated as an EngineError.
              meta.logger.warn("FEPageLoadFailed encountered", {
                error: error.error,
              });
            } else if (error.error instanceof AbortManagerThrownError) {
              if (error.error.tier === "engine") {
                meta.logger.warn(
                  "Engine " + error.engine + " timed out while scraping.",
                  { error: error.error },
                );
              } else {
                throw error.error;
              }
            } else {
              meta.logger.warn(
                "An unexpected error happened while scraping with " +
                  error.engine +
                  ".",
                { error },
              );
            }

            // Filter out the failed engine
            enginePromises = enginePromises.filter(
              x => x.engine !== error.engine,
            );

            // If we don't have any engines waterfalled, let's waterfall the next engine
            if (enginePromises.length === 0) {
              break;
            }

            // Otherwise, just keep racing
          } else if (error instanceof WaterfallNextEngineSignal) {
            // It's time to waterfall the next engine
            break;
          } else if (error instanceof ScrapeJobTimeoutError) {
            throw error;
          } else if (error instanceof AbortManagerThrownError) {
            if (error.tier === "engine") {
              meta.logger.warn(
                "Engine-scoped timeout error received here. Weird!",
                { error },
              );
            }

            throw error;
          } else {
            meta.logger.warn("Unexpected error while racing engines", {
              error,
            });
            throw error;
          }
        } finally {
          for (const to of timeouts) {
            clearTimeout(to);
          }
        }
      }

      if (result === null) {
        meta.logger.info("Waterfalling to next engine...", {
          waitUntilWaterfall,
        });
      } else {
        break;
      }
    }

    snipeAbortController.abort();

    if (result === null) {
      setSpanAttributes(span, {
        "engine.no_engines_left": true,
        "engine.engines_attempted": enginesAttempted.join(","),
      });
      if (meta.options.lockdown) {
        throw new LockdownMissError();
      }
      throw new NoEnginesLeftError(fallbackList.map(x => x.engine));
    }

    // Set winner engine attributes
    setSpanAttributes(span, {
      "engine.winner": result.engine,
      "engine.engines_attempted": enginesAttempted.join(","),
      "engine.unsupported_features":
        result.unsupportedFeatures.size > 0
          ? Array.from(result.unsupportedFeatures).join(",")
          : undefined,
    });

    meta.winnerEngine = result.engine;
    let engineResult: EngineScrapeResult = result.result;
    meta.audioCookies = (
      engineResult as { audioCookies?: BrowserCookie[] }
    ).audioCookies;

    for (const postprocessor of postprocessors) {
      if (
        postprocessor.shouldRun(
          meta,
          new URL(engineResult.url),
          engineResult.postprocessorsUsed,
        )
      ) {
        meta.logger.info("Running postprocessor " + postprocessor.name);
        try {
          engineResult = await postprocessor.run(
            {
              ...meta,
              logger: meta.logger.child({
                method: "postprocessors/" + postprocessor.name,
              }),
            },
            engineResult,
          );
        } catch (error) {
          meta.logger.warn(
            "Failed to run postprocessor " + postprocessor.name,
            {
              error,
            },
          );
        }
      }
    }

    let document: Document = {
      markdown: engineResult.markdown,
      rawHtml: engineResult.html,
      screenshot: engineResult.screenshot,
      actions: engineResult.actions,
      branding: engineResult.branding,
      metadata: {
        sourceURL: meta.internalOptions.unnormalizedSourceURL ?? meta.url,
        url: engineResult.url,
        statusCode: engineResult.statusCode,
        error: engineResult.error,
        numPages: engineResult.pdfMetadata?.numPages,
        ...(engineResult.pdfMetadata?.title
          ? { title: engineResult.pdfMetadata.title }
          : {}),
        contentType: engineResult.contentType,
        timezone: engineResult.timezone,
        proxyUsed: engineResult.proxyUsed ?? "basic",
        ...(fallbackList.find(x =>
          ["index", "index;documents"].includes(x.engine),
        )
          ? engineResult.cacheInfo
            ? {
                cacheState: "hit",
                cachedAt: engineResult.cacheInfo.created_at.toISOString(),
              }
            : {
                cacheState: "miss",
              }
          : {}),
        postprocessorsUsed: engineResult.postprocessorsUsed,
      },
    };

    if (result.unsupportedFeatures.size > 0) {
      const warning = `The engine used does not support the following features: ${[...result.unsupportedFeatures].join(", ")} -- your scrape may be partial.`;
      meta.logger.warn(warning, {
        engine: result.engine,
        unsupportedFeatures: result.unsupportedFeatures,
      });
      document.warning =
        document.warning !== undefined
          ? document.warning + " " + warning
          : warning;
    }

    // NOTE: for sitemap, we don't need all the transformers, need to skip unused ones
    document = await executeTransformers(meta, document);

    // Set final span attributes
    setSpanAttributes(span, {
      "engine.final_status_code": document.metadata.statusCode,
      "engine.final_url": document.metadata.url,
      "engine.content_type": document.metadata.contentType,
      "engine.proxy_used": document.metadata.proxyUsed,
      "engine.cache_state": document.metadata.cacheState,
      "engine.postprocessors_used": engineResult.postprocessorsUsed?.join(","),
    });

    return {
      success: true,
      document,
      unsupportedFeatures: result.unsupportedFeatures,
    };
  });
}

export async function scrapeURL(
  id: string,
  url: string,
  options: ScrapeOptions,
  internalOptions: InternalOptions,
  costTracking: CostTracking,
): Promise<ScrapeUrlResponse> {
  return withSpan("scrape.pipeline", async span => {
    const meta = await buildMetaObject(
      id,
      url,
      options,
      internalOptions,
      costTracking,
    );

    const startTime = Date.now();

    // Set initial span attributes
    setSpanAttributes(span, {
      "scrape.id": id,
      "scrape.url": url,
      "scrape.team_id": internalOptions.teamId,
      "scrape.crawl_id": internalOptions.crawlId,
      "scrape.zero_data_retention": internalOptions.zeroDataRetention,
      "scrape.force_engine": Array.isArray(internalOptions.forceEngine)
        ? internalOptions.forceEngine.join(",")
        : internalOptions.forceEngine,
      "scrape.features": Array.from(meta.featureFlags).join(","),
    });

    meta.logger.info("scrapeURL entered");

    if (meta.rewrittenUrl) {
      meta.logger.info("Rewriting URL");
      setSpanAttributes(span, {
        "scrape.rewritten_url": meta.rewrittenUrl,
      });
    }

    if (internalOptions.isPreCrawl === true) {
      setSpanAttributes(span, {
        "scrape.is_precrawl": true,
      });
    }

    if (shouldCheckRobots(options, internalOptions)) {
      await withSpan("scrape.robots_check", async robotsSpan => {
        const urlToCheck = meta.rewrittenUrl || meta.url;
        meta.logger.info("Checking robots.txt", { url: urlToCheck });

        const urlObj = new URL(urlToCheck);
        const isRobotsTxtPath = urlObj.pathname === "/robots.txt";

        setSpanAttributes(robotsSpan, {
          "robots.url": urlToCheck,
          "robots.is_robots_txt_path": isRobotsTxtPath,
        });

        if (!isRobotsTxtPath) {
          try {
            let robotsTxt: string | undefined;
            if (internalOptions.crawlId) {
              const crawl = await getCrawl(internalOptions.crawlId);
              robotsTxt = crawl?.robots;
            }

            if (!robotsTxt) {
              const { content } = await fetchRobotsTxt(
                {
                  url: urlToCheck,
                  zeroDataRetention: internalOptions.zeroDataRetention || false,
                  location: options.location,
                },
                id,
                meta.logger,
                meta.abort.asSignal(),
              );
              robotsTxt = content;
            }

            const checker = createRobotsChecker(urlToCheck, robotsTxt);
            const isAllowed = isUrlAllowedByRobots(urlToCheck, checker.robots);

            setSpanAttributes(robotsSpan, {
              "robots.allowed": isAllowed,
            });

            if (!isAllowed) {
              meta.logger.info("URL blocked by robots.txt", {
                url: urlToCheck,
              });
              setSpanAttributes(span, {
                "scrape.blocked_by_robots": true,
              });
              throw new CrawlDenialError("URL blocked by robots.txt");
            }
          } catch (error) {
            if (error instanceof CrawlDenialError) {
              throw error;
            }
            meta.logger.debug("Failed to fetch robots.txt, allowing scrape", {
              error,
              url: urlToCheck,
            });
            setSpanAttributes(robotsSpan, {
              "robots.fetch_failed": true,
            });
          }
        }
      }).catch(error => {
        if (error.message === "URL blocked by robots.txt") {
          return {
            success: false,
            error,
          };
        }
        throw error;
      });
    }

    try {
      const result: ScrapeUrlResponse = await scrapeURLLoop(meta);

      meta.logger.debug("scrapeURL metrics", {
        module: "scrapeURL/metrics",
        timeTaken: Date.now() - startTime,
        maxAgeValid: (meta.options.maxAge ?? 0) > 0,
        shouldUseIndex: shouldUseIndex(meta),
        success: result.success,
        indexHit:
          result.success && result.document.metadata.cacheState === "hit",
      });

      if (useIndex) {
        meta.logger.debug("scrapeURL index metrics", {
          module: "scrapeURL/index-metrics",
          timeTaken: Date.now() - startTime,
          changeTrackingEnabled: !!hasFormatOfType(
            meta.options.formats,
            "changeTracking",
          ),
          summaryEnabled: !!hasFormatOfType(meta.options.formats, "summary"),
          jsonEnabled: !!hasFormatOfType(meta.options.formats, "json"),
          screenshotEnabled: !!hasFormatOfType(
            meta.options.formats,
            "screenshot",
          ),
          imagesEnabled: !!hasFormatOfType(meta.options.formats, "images"),
          brandingEnabled: !!hasFormatOfType(meta.options.formats, "branding"),
          pdfMaxPages: getPDFMaxPages(meta.options.parsers),
          maxAge: meta.options.maxAge,
          headers: meta.options.headers
            ? Object.keys(meta.options.headers).length
            : 0,
          actions: meta.options.actions?.length ?? 0,
          proxy: meta.options.proxy,
          success: result.success,
          indexHit:
            result.success && result.document.metadata.cacheState === "hit",
        });
      }

      setSpanAttributes(span, {
        "scrape.success": true,
        "scrape.duration_ms": Date.now() - startTime,
        "scrape.index_hit":
          result.success && result.document.metadata.cacheState === "hit",
      });

      return result;
    } catch (error) {
      // if (Object.values(meta.results).length > 0 && Object.values(meta.results).every(x => x.state === "error" && x.error instanceof FEPageLoadFailed)) {
      //   throw new FEPageLoadFailed();
      // } else
      meta.logger.debug("scrapeURL metrics", {
        module: "scrapeURL/metrics",
        timeTaken: Date.now() - startTime,
        maxAgeValid: (meta.options.maxAge ?? 0) > 0,
        shouldUseIndex: shouldUseIndex(meta),
        success: false,
        indexHit: false,
      });

      if (useIndex) {
        meta.logger.debug("scrapeURL index metrics", {
          module: "scrapeURL/index-metrics",
          timeTaken: Date.now() - startTime,
          changeTrackingEnabled: !!hasFormatOfType(
            meta.options.formats,
            "changeTracking",
          ),
          summaryEnabled: !!hasFormatOfType(meta.options.formats, "summary"),
          jsonEnabled: !!hasFormatOfType(meta.options.formats, "json"),
          screenshotEnabled: !!hasFormatOfType(
            meta.options.formats,
            "screenshot",
          ),
          imagesEnabled: !!hasFormatOfType(meta.options.formats, "images"),
          brandingEnabled: !!hasFormatOfType(meta.options.formats, "branding"),
          pdfMaxPages: getPDFMaxPages(meta.options.parsers),
          maxAge: meta.options.maxAge,
          headers: meta.options.headers
            ? Object.keys(meta.options.headers).length
            : 0,
          actions: meta.options.actions?.length ?? 0,
          proxy: meta.options.proxy,
          success: false,
          indexHit: false,
        });
      }

      // Set error attributes on span
      let errorType = "unknown";
      if (error instanceof NoEnginesLeftError) {
        errorType = "NoEnginesLeftError";
        meta.logger.warn("scrapeURL: All scraping engines failed!", { error });
      } else if (error instanceof LLMRefusalError) {
        errorType = "LLMRefusalError";
        meta.logger.warn("scrapeURL: LLM refused to extract content", {
          error,
        });
      } else if (
        error instanceof Error &&
        error.message.includes("Invalid schema for response_format")
      ) {
        errorType = "LLMSchemaError";
        // TODO: separate into custom error
        meta.logger.warn("scrapeURL: LLM schema error", { error });
        // TODO: results?
      } else if (error instanceof SiteError) {
        errorType = "SiteError";
        meta.logger.warn("scrapeURL: Site failed to load in browser", {
          error,
        });
      } else if (error instanceof SSLError) {
        errorType = "SSLError";
        meta.logger.warn("scrapeURL: SSL error", { error });
      } else if (error instanceof ActionError) {
        errorType = "ActionError";
        meta.logger.warn("scrapeURL: Action(s) failed to complete", { error });
      } else if (error instanceof UnsupportedFileError) {
        errorType = "UnsupportedFileError";
        meta.logger.warn("scrapeURL: Tried to scrape unsupported file", {
          error,
        });
      } else if (error instanceof PDFInsufficientTimeError) {
        errorType = "PDFInsufficientTimeError";
        meta.logger.warn("scrapeURL: Insufficient time to process PDF", {
          error,
        });
      } else if (error instanceof PDFOCRRequiredError) {
        errorType = "PDFOCRRequiredError";
        meta.logger.warn(
          "scrapeURL: PDF requires OCR but fast mode was requested",
          {
            error,
          },
        );
      } else if (error instanceof PDFPrefetchFailed) {
        errorType = "PDFPrefetchFailed";
        meta.logger.warn(
          "scrapeURL: Failed to prefetch PDF that is protected by anti-bot",
          { error },
        );
      } else if (error instanceof DocumentPrefetchFailed) {
        errorType = "DocumentPrefetchFailed";
        meta.logger.warn(
          "scrapeURL: Failed to prefetch document that is protected by anti-bot",
          { error },
        );
      } else if (error instanceof BrandingNotSupportedError) {
        errorType = "BrandingNotSupportedError";
        meta.logger.warn("scrapeURL: Branding not supported for this content", {
          error,
        });
      } else if (error instanceof ProxySelectionError) {
        errorType = "ProxySelectionError";
        meta.logger.warn("scrapeURL: Proxy selection error", { error });
      } else if (error instanceof DNSResolutionError) {
        errorType = "DNSResolutionError";
        meta.logger.warn("scrapeURL: DNS resolution error", { error });
      } else if (error instanceof AbortManagerThrownError) {
        errorType = "AbortManagerThrownError";
        throw error.inner;
      } else {
        captureExceptionWithZdrCheck(error, {
          extra: {
            zeroDataRetention: internalOptions.zeroDataRetention ?? false,
          },
        });
        meta.logger.error("scrapeURL: Unexpected error happened", { error });
        // TODO: results?
      }

      setSpanAttributes(span, {
        "scrape.success": false,
        "scrape.error": error instanceof Error ? error.message : String(error),
        "scrape.error_type": errorType,
        "scrape.duration_ms": Date.now() - startTime,
      });

      return {
        success: false,
        error,
      };
    }
  });
}
