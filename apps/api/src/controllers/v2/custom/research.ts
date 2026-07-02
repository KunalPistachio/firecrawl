import { Request, Response } from "express";
import { z } from "zod";
import { inspectDomains } from "../../../lib/research/domain-inspection";

const domainInspectionRequestSchema = z.strictObject({
  domains: z.array(z.string().min(1)).min(1).max(500),
  checkMx: z.boolean().optional(),
  checkWebsite: z.boolean().optional(),
  timeoutMs: z.number().int().min(1000).max(30000).optional(),
  concurrency: z.number().int().min(1).max(16).optional(),
});

export async function inspectDomainsController(req: Request, res: Response) {
  const body = domainInspectionRequestSchema.parse(req.body);
  const data = await inspectDomains(body.domains, {
    checkMx: body.checkMx,
    checkWebsite: body.checkWebsite,
    timeoutMs: body.timeoutMs,
    concurrency: body.concurrency,
  });

  return res.status(200).json({
    success: true,
    data,
  });
}
