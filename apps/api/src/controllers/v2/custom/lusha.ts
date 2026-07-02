import { Request, Response } from "express";
import { z } from "zod";
import {
  createLushaClient,
  LushaConfigurationError,
  LushaError,
} from "../../../lib/lusha/client";

const revealFieldSchema = z.enum(["emails", "phones"]);

const searchOptionsSchema = z
  .strictObject({
    includePartialProfiles: z.boolean().optional(),
  })
  .optional();

const signalsSchema = z
  .strictObject({
    types: z.array(z.string().min(1)).min(1),
    startDate: z.string().optional(),
    maxResultsPerSignal: z.int().positive().optional(),
  })
  .optional();

const contactIdentifierSchema = z
  .strictObject({
    clientReferenceId: z.string().optional(),
    id: z.string().optional(),
    linkedinUrl: z.string().optional(),
    email: z.email().optional(),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    companyName: z.string().optional(),
    companyDomain: z.string().optional(),
  })
  .refine(
    contact =>
      !!contact.id ||
      !!contact.linkedinUrl ||
      !!contact.email ||
      (!!contact.firstName &&
        !!contact.lastName &&
        (!!contact.companyName || !!contact.companyDomain)),
    {
      message:
        "Each contact requires id, linkedinUrl, email, or firstName + lastName + companyName/companyDomain.",
    },
  );

const contactIdSchema = z.strictObject({
  clientReferenceId: z.string().optional(),
  id: z.string(),
});

const companyIdentifierSchema = z
  .strictObject({
    clientReferenceId: z.string().optional(),
    id: z.string().optional(),
    name: z.string().optional(),
    domain: z.string().optional(),
  })
  .refine(company => !!company.id || !!company.name || !!company.domain, {
    message: "Each company requires id, name, or domain.",
  });

const companyIdSchema = z.strictObject({
  clientReferenceId: z.string().optional(),
  id: z.string(),
});

const contactsSearchRequestSchema = z.strictObject({
  contacts: z.array(contactIdentifierSchema).min(1).max(100),
  options: searchOptionsSchema,
  signals: signalsSchema,
});

const contactsEnrichRequestSchema = z.strictObject({
  contacts: z.array(contactIdSchema).min(1).max(100),
  reveal: z.array(revealFieldSchema).min(1).max(2).optional(),
  confirmSpend: z.boolean().optional(),
});

const contactsSearchAndEnrichRequestSchema = z.strictObject({
  contacts: z.array(contactIdentifierSchema).min(1).max(100),
  reveal: z.array(revealFieldSchema).min(1).max(2).optional(),
  options: searchOptionsSchema,
  confirmSpend: z.boolean().optional(),
});

const companiesSearchRequestSchema = z.strictObject({
  companies: z.array(companyIdentifierSchema).min(1).max(100),
  options: searchOptionsSchema,
  signals: signalsSchema,
});

const companiesEnrichRequestSchema = z.strictObject({
  companies: z.array(companyIdSchema).min(1).max(100),
  confirmSpend: z.boolean().optional(),
});

const companiesSearchAndEnrichRequestSchema = z.strictObject({
  companies: z.array(companyIdentifierSchema).min(1).max(100),
  options: searchOptionsSchema,
  confirmSpend: z.boolean().optional(),
});

function requireConfirmedSpend(
  req: Request,
  res: Response,
): boolean | Response {
  if (req.body?.confirmSpend === true) {
    return true;
  }

  return res.status(400).json({
    success: false,
    error:
      "This Lusha endpoint can reveal paid data. Set confirmSpend: true to run it.",
  });
}

function omitConfirmSpend<T extends { confirmSpend?: boolean }>(
  value: T,
): Omit<T, "confirmSpend"> {
  const { confirmSpend: _confirmSpend, ...rest } = value;
  return rest;
}

function handleLushaError(res: Response, error: unknown): Response {
  if (error instanceof LushaConfigurationError) {
    return res.status(503).json({
      success: false,
      error: error.message,
    });
  }

  if (error instanceof LushaError) {
    return res.status(error.status).json({
      success: false,
      error: error.message,
      provider: {
        name: "lusha",
        endpoint: error.endpoint,
        status: error.status,
        retryAfter: error.retryAfter ?? undefined,
      },
      details: error.details,
    });
  }

  throw error;
}

async function callLusha(
  res: Response,
  endpoint: string,
  callback: () => Promise<unknown>,
) {
  try {
    const data = await callback();
    return res.status(200).json({
      success: true,
      provider: {
        name: "lusha",
        endpoint,
      },
      data,
    });
  } catch (error) {
    return handleLushaError(res, error);
  }
}

export async function lushaAccountUsageController(
  _req: Request,
  res: Response,
) {
  return callLusha(res, "/v3/account/usage", () =>
    createLushaClient().getAccountUsage(),
  );
}

export async function lushaContactsSearchController(
  req: Request,
  res: Response,
) {
  const body = contactsSearchRequestSchema.parse(req.body);
  return callLusha(res, "/v3/contacts/search", () =>
    createLushaClient().searchContacts(body),
  );
}

export async function lushaContactsEnrichController(
  req: Request,
  res: Response,
) {
  const confirmed = requireConfirmedSpend(req, res);
  if (confirmed !== true) return confirmed;

  const body = omitConfirmSpend(contactsEnrichRequestSchema.parse(req.body));
  return callLusha(res, "/v3/contacts/enrich", () =>
    createLushaClient().enrichContacts(body),
  );
}

export async function lushaContactsSearchAndEnrichController(
  req: Request,
  res: Response,
) {
  const confirmed = requireConfirmedSpend(req, res);
  if (confirmed !== true) return confirmed;

  const body = omitConfirmSpend(
    contactsSearchAndEnrichRequestSchema.parse(req.body),
  );
  return callLusha(res, "/v3/contacts/search-and-enrich", () =>
    createLushaClient().searchAndEnrichContacts(body),
  );
}

export async function lushaCompaniesSearchController(
  req: Request,
  res: Response,
) {
  const body = companiesSearchRequestSchema.parse(req.body);
  return callLusha(res, "/v3/companies/search", () =>
    createLushaClient().searchCompanies(body),
  );
}

export async function lushaCompaniesEnrichController(
  req: Request,
  res: Response,
) {
  const confirmed = requireConfirmedSpend(req, res);
  if (confirmed !== true) return confirmed;

  const body = omitConfirmSpend(companiesEnrichRequestSchema.parse(req.body));
  return callLusha(res, "/v3/companies/enrich", () =>
    createLushaClient().enrichCompanies(body),
  );
}

export async function lushaCompaniesSearchAndEnrichController(
  req: Request,
  res: Response,
) {
  const confirmed = requireConfirmedSpend(req, res);
  if (confirmed !== true) return confirmed;

  const body = omitConfirmSpend(
    companiesSearchAndEnrichRequestSchema.parse(req.body),
  );
  return callLusha(res, "/v3/companies/search-and-enrich", () =>
    createLushaClient().searchAndEnrichCompanies(body),
  );
}
