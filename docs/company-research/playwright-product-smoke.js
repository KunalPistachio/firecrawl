const { chromium } = require("playwright");

const previewUrl = process.env.PREVIEW_URL || "http://firecrawl-api-run-product:3002/v2/custom";
const screenshotPath = process.env.SCREENSHOT_PATH || "/tmp/company-research-product-final.png";
const fullPage = process.env.FULL_PAGE !== "false";

(async () => {
  const errors = [];
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1300 } });

  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => {
    if (message.type() === "error") {
      errors.push(message.text());
    }
  });

  await page.goto(previewUrl, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "domcontentloaded", timeout: 60000 });

  await page.getByRole("button", { name: "Sample" }).click();
  await page.waitForTimeout(500);

  const rowsAfterSample = await page.evaluate(() => window.__companyResearchWorkbench.getRows().length);
  const savedRuns = await page.locator("#recentRunsBody tr[data-run-id]").count();

  await page.locator("#globalSearch").fill("notion.so");
  await page.getByRole("button", { name: "Lookup" }).click();
  await page.waitForTimeout(700);

  const rowsAfterLookup = await page.evaluate(() => window.__companyResearchWorkbench.getRows().length);
  const detailTitle = await page.locator("#detailTitle").textContent();
  const contactsRows = await page.locator("#contactsBody tr").count();

  await page.screenshot({ path: screenshotPath, fullPage });
  await browser.close();

  const result = {
    previewUrl,
    rowsAfterSample,
    savedRuns,
    rowsAfterLookup,
    detailTitle,
    contactsRows,
    fullPage,
    errors,
  };

  console.log(JSON.stringify(result));

  if (errors.length || detailTitle !== "notion.so" || rowsAfterLookup < 4) {
    process.exit(2);
  }
})().catch(error => {
  console.error(error.stack || error.message);
  process.exit(1);
});
