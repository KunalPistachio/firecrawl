# Company Research Debug Log

## 2026-06-30

### UI Productization Pass

Observed:
- The first workbench was functional but felt like a technical scrape console.
- A follow-up design check showed the settings sidebar still made the app diverge from the mockups.
- Specialist UX, GTM/RevOps, marketing, and product-owner reviews converged on the same gap: the app needed saved account-list workflows, reusable views, contacts/exports work areas, and less setup noise.

Change:
- Added workspace navigation, top command actions, a data-quality strip, a cleaner company table heading, and a selected-company snapshot area.
- Converted the left side into a narrow dark navigation rail.
- Moved API/key controls into a compact connection dock inside the Command Center workspace.
- Added browser-local saved account lists, recent runs, saved views, contacts workspace, export packages, and a domain lookup flow.

Trace:
- App shell, layout, and browser state live in `apps/api/src/controllers/v2/custom/ui.ts`.

Verification:
- Deployed API-only local preview container `firecrawl-api-run-product` on `localhost:3002`.
- UI smoke confirmed Command Center, nav rail, connection dock, Bulk Research Upload, Company Table, Website Snapshot, and Data Quality markers.
- Playwright product-flow smoke confirmed sample preview, saved run, lookup, selected-company detail switching, saved view, contacts/export areas, and no client-side errors.
- Latest screenshots:
  - `docs/company-research/mockups/company-research-product-final.png`
  - `docs/company-research/mockups/company-research-product-viewport.png`

### Mail Server Column Empty

Observed:
- MX endpoint worked in direct smoke tests when `x-custom-api-key: local-dev` was supplied.
- UI could leave mail-server data blank if the Custom key field was not set.

Cause:
- Domain inspection was initially placed behind the custom-key middleware.
- The UI called it with `auth: "custom"`.

Fix:
- Moved `POST /v2/custom/research/domains/inspect` before the custom-key middleware.
- Changed UI domain inspection calls to `auth: "none"`.
- Updated `mxCell` to show visible failure states instead of a dash.

Verification:
- No-key POST to `/v2/custom/research/domains/inspect` returns MX providers.
- `google.com` now classifies as `Google Workspace`.
- `microsoft.com` classifies as `Microsoft 365`.

### Google MX Classified As Other

Observed:
- `google.com` returned an MX record but provider was `Other`.

Cause:
- Classifier handled `aspmx.l.google.com` and `googlemail.com`, but not `smtp.google.com`.

Fix:
- Added `smtp.google.com` to Google Workspace classification.

### Full Docker Build Timeout

Observed:
- Full `docker compose build api` and standalone TypeScript compile were slow/time-limited in this environment.

Current local-preview approach:
- Transpile changed TypeScript modules into `apps/api/dist`.
- Mount those runtime JS files into an API-only Docker container.
- Keep source files and tests as the source of truth.
- Use `docs/company-research/playwright-product-smoke.js` inside the Playwright container for repeatable browser-flow verification.

Follow-up:
- Return to full image rebuild once the product surface stabilizes or when CI is available.

## Debug Checklist

When a result field is missing:

1. Check whether the field exists in raw row data.
2. Check domain-inspection response for backend fields.
3. Check scrape response shape under `response.data`.
4. Check normalization/extraction functions.
5. Check table column visibility.
6. Check export mapping.
7. Add a focused test before patching if the bug can recur.
