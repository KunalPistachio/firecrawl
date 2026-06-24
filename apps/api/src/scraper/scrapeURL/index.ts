import { Document, ScrapeOptions } from "../../controllers/v2/types";
import { CostTracking } from "../../lib/cost-tracking";
import { setSpanAttributes, withSpan } from "../../lib/otel-tracer";
import { mainEngine, resolveSpecialEngineFromURL, shouldUseIndex } from "./engines";
import { indexEngine as _indexEngine } from "./engines/index/index";
import { EngineScrapeResult } from "./engines/types";
import { IndexMissError, ReliableRetrievalError } from "./error";
import { FeatureFlag } from "./lib/feature-flags";
import { InternalOptions } from "./lib/internal-options";
import { buildMetaObject, Meta } from "./lib/meta";
import { doRobotsCheckIfNeeded } from "./lib/robots";

export type ScrapeUrlResponse =
  | {
      success: true;
      document: Document;
      unsupportedFeatures?: Set<FeatureFlag>;
    }
  | {
      success: false;
      error: any;
    };

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
      "scrape.features": Array.from(meta.featureFlags).join(","),
    });

    meta.logger.info("scrapeURL entered");

    if (meta.rewrittenUrl) {
      meta.logger.info("Rewriting URL", { rewrittenUrl: meta.rewrittenUrl });
      setSpanAttributes(span, {
        "scrape.rewritten_url": meta.rewrittenUrl,
      });
    }

    if (internalOptions.isPreCrawl === true) {
      setSpanAttributes(span, {
        "scrape.is_precrawl": true,
      });
    }

    await doRobotsCheckIfNeeded(meta, span);

    try {
      meta.logger.info(`Scraping URL ${JSON.stringify(meta.rewrittenUrl ?? meta.url)}...`);

      if (meta.options.lockdown || meta.internalOptions.agentIndexOnly) {
        // Use only index
      } else {
        const indexEngine = shouldUseIndex(meta) ? _indexEngine : null;

        let resultFromIndex: EngineScrapeResult | null;

        if (indexEngine !== null) {
          try {
            resultFromIndex = await indexEngine.scrape(meta);
          } catch (e) {
            if (e instanceof IndexMissError) {
              resultFromIndex = null;
            } else {
              throw e;
            }
          }
        } else {
          resultFromIndex = null;
        }

        let result: EngineScrapeResult;

        if (resultFromIndex === null) {
          const specialEngine = resolveSpecialEngineFromURL(meta.rewrittenUrl ?? meta.url);

          const proxyDeterminedMeta: Meta = {
            ...meta,
            options: {
              ...meta.options,
              proxy: meta.options.proxy === "auto" ? "basic" : meta.options.proxy,
            },
          };

          if (specialEngine !== null) {
            result = await specialEngine.scrape(proxyDeterminedMeta);
          } else {
            try {
              result = await mainEngine.scrape(proxyDeterminedMeta);
            } catch (e) {
              if (e instanceof ReliableRetrievalError && meta.options.proxy === "auto") {

              } else {
                throw e;
              }
            }
          }
        } else {
          result = resultFromIndex;
        }
      }
    }
  });
}
