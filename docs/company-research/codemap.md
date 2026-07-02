# Company Research Codemap

## Entry Points

- `apps/api/src/routes/v2.ts`
  - Mounts the custom route tree under `/v2/custom`.

- `apps/api/src/routes/custom.ts`
  - Serves the local research UI.
  - Exposes local research routes.
  - Protects Lusha routes with `CUSTOM_API_KEY`.

## UI

- `apps/api/src/controllers/v2/custom/ui.ts`
  - Server-rendered HTML/CSS/JS for the local Company Research app.
  - Handles browser-side batch orchestration.
  - Calls Firecrawl `/v2/scrape`.
  - Calls `/v2/custom/research/domains/inspect`.
  - Extracts emails, phones, address-like lines, keyword matches, and summaries.
  - Renders workspace navigation, global lookup/search, metrics, data-quality strip, recent runs, result table, contacts workspace, detail snapshot, export packages, and collapsed provider settings.
  - Owns the current configurable column picker and cleaned table/export formatting.
  - Stores the current browser-local saved runs and saved views until a durable batch backend is added.

## Design References

- `docs/company-research/mockups/company-research-direction.png`
  - High-level product direction mockup for command center, result table, and company detail views.

- `docs/company-research/mockups/company-research-product-final.png`
  - Full-page Playwright capture of the current local preview after sample preview and lookup.

- `docs/company-research/mockups/company-research-product-viewport.png`
  - Viewport Playwright capture of the current local preview after lookup.

- `docs/company-research/playwright-product-smoke.js`
  - Browser-flow smoke script for sample preview, saved run, lookup selection, and screenshot capture.

## Domain Intelligence

- `apps/api/src/controllers/v2/custom/research.ts`
  - Controller for domain inspection.
  - Validates the batch request.

- `apps/api/src/lib/research/domain-inspection.ts`
  - Normalizes domain inputs.
  - Resolves MX records.
  - Classifies mail providers.
  - Checks website state and redirect chains.

- `apps/api/src/lib/research/domain-inspection.test.ts`
  - Unit coverage for normalization, MX classification, redirects, missing MX, and inactive sites.

## Lusha Integration

- `apps/api/src/lib/lusha/client.ts`
  - Lusha API client.
  - Handles usage, contact search/enrich, and company search/enrich.

- `apps/api/src/controllers/v2/custom/lusha.ts`
  - Validates Lusha request bodies.
  - Enforces `confirmSpend` on paid reveal/enrich paths.

## Tests

- `apps/api/src/controllers/v2/__tests__/custom-lusha.test.ts`
  - Custom route tests.
  - Confirms UI route is public.
  - Confirms domain inspection route is available.
  - Confirms Lusha routes remain protected and spend-gated.

## Runtime/Local Preview

- Docker preview is currently served by an API-only container.
- Latest working preview container name is recorded in `patch-notes.md`.
- Full image rebuild has been slower than single-module preview mounting; source changes remain the real tracked implementation.

## Trace Paths

### Mail Server Missing

1. UI: `inspectRows` in `ui.ts`
2. Route: `POST /v2/custom/research/domains/inspect`
3. Controller: `inspectDomainsController`
4. Service: `inspectDomains` and `inspectMx`
5. Display: `mxCell`
6. Export: `exportCsv`

### Scrape Data Looks Dirty

1. UI: `scrapeRow`
2. Normalize: `cleanText`, `cleanDisplayValue`, `cleanMarkdownLine`
3. Extract: `extractContactData`, `extractPhones`, `extractAddresses`
4. Display: result table renderers
5. Export: `csvCell`

### Lusha Spend/Access Bug

1. Route middleware: `customApiKeyMiddleware`
2. Controller: `lusha.ts`
3. Spend gate: `requireConfirmedSpend`
4. Client: `LushaClient`
