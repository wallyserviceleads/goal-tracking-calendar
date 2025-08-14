// === CONFIG ===
// Option 1 (recommended): Publish your sheet to the web as CSV and paste the URL below.
const SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vT0SMcrtzhSiXYrdCnYX2Uk2I_bF4Uss2riC_8d6RkbAV1pU1G6FUTN0kWVnF5C7h1nmQiv06-h461Z/pub?output=csv"; // e.g. https://docs.google.com/spreadsheets/d/1CG0WEyf-sEz8_3Y6jGzU0fZlEomb7w1P/export?format=csv&gid=0

// Option 2: If the sheet is shared publicly (anyone with link), you can often use export?format=csv directly:
const SHEET_ID = "1CG0WEyf-sEz8_3Y6jGzU0fZlEomb7w1P"; // your Google Sheet ID
const SHEET_GID = 0; // first tab; change if needed
const FALLBACK_CSV = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;

// Column headers expected in the CSV (case-sensitive):
// Date, Service, Amount, Status, Customer Name, SourceId

// UI defaults
const DEFAULT_YEARLY_GOAL = 500000;
const DEFAULT_INCLUDE_SATURDAY = true;
const DEFAULT_WORKING_PACE = true;

window.APP_CONFIG = {
  SHEET_CSV_URL,
  FALLBACK_CSV,
  DEFAULT_YEARLY_GOAL,
  DEFAULT_INCLUDE_SATURDAY,
  DEFAULT_WORKING_PACE,
};
