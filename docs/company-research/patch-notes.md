# Company Research Patch Notes

## 2026-06-30

### Added

- Local Company Research app served at `/v2/custom`.
- Bulk website/domain input.
- Smart keyword matching and scoring.
- Searchable/sortable results table.
- Selected-company detail view.
- CSV/JSON export.
- Lusha custom routes and client.
- Domain inspection route:
  - MX lookup
  - mail provider classification
  - website active/redirecting/inactive/parked/error status
  - redirect chain and final URL
- Contact extraction:
  - contact emails
  - all emails
  - phone numbers
  - address-like lines
- Local UI route tests and domain-inspection tests.
- Project build docs:
  - build plan
  - codemap
  - debug log
  - patch notes
- Design reference mockup copied to `docs/company-research/mockups/company-research-direction.png`.
- Live deployed screenshot captured at `docs/company-research/mockups/company-research-live.png`.
- Product-pass full-page screenshot captured at `docs/company-research/mockups/company-research-product-final.png`.
- Product-pass viewport screenshot captured at `docs/company-research/mockups/company-research-product-viewport.png`.
- Reusable Playwright smoke script added at `docs/company-research/playwright-product-smoke.js`.
- Configurable result table column picker.
- Cleaned table display path for scraped HTML/markdown noise.
- Normalized JSON export shape.
- Mockup-inspired workspace navigation for Bulk Research, Companies, Company Detail, and Data Quality.
- Top command bar with global search, run, and CSV export actions.
- Dark left navigation rail and command-center header aligned to the design reference.
- Compact connection dock moved into the workspace so the rail is navigation-only.
- Data-quality strip for active domains, mail-server availability, redirects, and clean records.
- Selected-company website snapshot area with status, mail server, redirects, contact counts, open, and copy URL actions.
- Browser-local saved account lists with list name, campaign, owner, ICP goal, saved rows, and recent-run reopening.
- Global lookup flow that can add a pasted domain to the active list and select it.
- Saved table views for common segments and custom filters.
- Contacts workspace for extracted emails and phones.
- Export packages for companies CSV, contacts CSV, HubSpot-style company CSV, and normalized research JSON.
- Collapsed provider/settings panel so the Command Center starts with the account-list workflow.

### Fixed

- Mail-server checks no longer require the Custom key field in the UI.
- Mail Server column now shows visible failures.
- Google MX records using `smtp.google.com` classify as `Google Workspace`.

### Current Preview

- URL: `http://localhost:3002/v2/custom`
- Container: `firecrawl-api-run-product`
- Note: this is an API-only local preview container with regenerated runtime files mounted from `apps/api/dist`.

### Verification

- Focused tests: `10 passed`
- UI smoke test: `200`
  - Command Center, nav rail, saved list controls, Recent Runs, Company Table, Contacts Workspace, Export Packages, provider settings, Website Snapshot, and Data Quality markers present.
- Playwright product-flow smoke:
  - sample list preview
  - saved recent run
  - domain lookup
  - selected company detail switches to the looked-up domain
  - saved custom view
  - contacts/export work areas
  - no client-side errors
- No-key MX smoke test:
  - `google.com` => `Google Workspace`
  - `microsoft.com` => `Microsoft 365`

### Known Gaps

- Batch runs are browser-orchestrated and not yet durable.
- Address extraction is best-effort and should later use AI/structured extraction.
- Live screenshot capture is not yet integrated into the detail view.
- Column configuration is being developed toward saved views and presets.
