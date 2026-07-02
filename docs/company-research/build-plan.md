# Company Research App Build Plan

## Product Direction

Build a high-level company research application on top of Firecrawl. Firecrawl remains the crawling and extraction engine, while our custom layer turns bulk domains into clean, inspectable company intelligence.

Design direction mockup: `docs/company-research/mockups/company-research-direction.png`.

## Current Workflow

1. Paste or import a list of websites/domains.
2. Name the saved account list and capture campaign/owner/ICP context.
3. Preview and dedupe the source set.
4. Reopen recent saved runs or saved table views.
5. Run domain checks:
   - website active/inactive/redirecting/parked/error
   - final URL and redirect chain
   - MX records and mail provider classification
6. Scrape website content through Firecrawl.
7. Extract and normalize:
   - smart keyword matches
   - contact emails
   - all emails
   - phone numbers
   - address-like lines
   - summary/title/content signals
8. Review in a configurable company table and contacts workspace.
9. Inspect a selected company in a detail view.
10. Export CSV/JSON, contacts CSV, or HubSpot-style company CSV.

## Near-Term Build Slices

### Slice 1: High-Quality Table View

- Configurable columns for every field we collect.
- Cleaned display values so scraped HTML/markdown noise does not leak into the table.
- CSV/JSON exports that use the same normalized data.
- Better selected-company detail view with website snapshot space.

Status: in progress. The configurable column picker, cleaned export shape, workspace navigation, data-quality strip, selected-company snapshot area, saved browser-local runs, saved views, contacts workspace, and export packages have been added.

### Slice 2: Durable Batch Runs

- Persist batch runs and batch items.
- Add statuses: draft, queued, running, done, failed, skipped, cancelled.
- Add retry support and per-record errors.
- Add run history and progress tracking.

Status: planned. The UI now models saved runs in browser storage; the durable backend should replace this with committed batch/run/item records.

### Slice 3: AI Research Layer

- Use Gemini/OpenRouter for structured company profiles.
- Convert scraped markdown into normalized fields:
  - business description
  - ICP/category
  - address confidence
  - contact confidence
  - buying signals
  - risk/compliance signals
- Store model provider, model, prompt version, and raw response metadata.

### Slice 4: Lusha Enrichment

- Add selected-record enrichment.
- Add spend confirmation and caps.
- Merge Lusha people/company data into the table.
- Track credits used per run and per record.

### Slice 5: Product Polish

- Saved views.
- Column presets.
- CSV import with field mapping.
- Error drawer and debug trace.
- Company snapshot pane with screenshot capture, scraped page metadata, and final URL.

## Data Quality Principles

- Store raw provider output separately from normalized display fields.
- Keep all destructive cleaning reversible.
- Show confidence/availability, not just blank values.
- Export the cleaned fields users see in the table.
- Preserve per-record errors so failures are traceable.

## Open Decisions

- Whether local-only runs should persist to SQLite/Postgres or stay browser-local until the durable batch slice.
- Whether screenshots should be captured for every company or only selected rows.
- Whether AI extraction should run automatically or as a separate enrichment phase with spend controls.
