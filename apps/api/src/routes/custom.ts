import express, { NextFunction, Request, Response } from "express";
import { config } from "../config";
import {
  lushaAccountUsageController,
  lushaCompaniesEnrichController,
  lushaCompaniesSearchAndEnrichController,
  lushaCompaniesSearchController,
  lushaContactsEnrichController,
  lushaContactsSearchAndEnrichController,
  lushaContactsSearchController,
} from "../controllers/v2/custom/lusha";
import { inspectDomainsController } from "../controllers/v2/custom/research";
import { customWorkbenchController } from "../controllers/v2/custom/ui";

export const customRouter = express.Router();

function wrapCustomController(
  controller: (req: Request, res: Response) => Promise<any>,
): (req: Request, res: Response, next: NextFunction) => any {
  return (req, res, next) => {
    controller(req, res).catch(err => next(err));
  };
}

function getProvidedCustomKey(req: Request): string | undefined {
  const headerKey = req.get("x-custom-api-key");
  if (headerKey) return headerKey;

  const authorization = req.get("authorization");
  if (!authorization) return undefined;

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer") return undefined;
  return token;
}

function customApiKeyMiddleware(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  if (!config.CUSTOM_API_KEY) {
    return res.status(503).json({
      success: false,
      error: "CUSTOM_API_KEY is not configured for custom routes.",
    });
  }

  if (getProvidedCustomKey(req) !== config.CUSTOM_API_KEY) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized custom route request.",
    });
  }

  next();
}

customRouter.get("/", wrapCustomController(customWorkbenchController));
customRouter.get("/ui", wrapCustomController(customWorkbenchController));

customRouter.post(
  "/research/domains/inspect",
  wrapCustomController(inspectDomainsController),
);

customRouter.use(customApiKeyMiddleware);

customRouter.get(
  "/lusha/account/usage",
  wrapCustomController(lushaAccountUsageController),
);

customRouter.post(
  "/lusha/contacts/search",
  wrapCustomController(lushaContactsSearchController),
);
customRouter.post(
  "/lusha/contacts/enrich",
  wrapCustomController(lushaContactsEnrichController),
);
customRouter.post(
  "/lusha/contacts/search-and-enrich",
  wrapCustomController(lushaContactsSearchAndEnrichController),
);

customRouter.post(
  "/lusha/companies/search",
  wrapCustomController(lushaCompaniesSearchController),
);
customRouter.post(
  "/lusha/companies/enrich",
  wrapCustomController(lushaCompaniesEnrichController),
);
customRouter.post(
  "/lusha/companies/search-and-enrich",
  wrapCustomController(lushaCompaniesSearchAndEnrichController),
);
