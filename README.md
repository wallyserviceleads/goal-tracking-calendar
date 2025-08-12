# Goal Tracking Calendar (Columbia Dent Company)

A TV-friendly calendar that pulls **scheduled repairs + amounts** from Google Sheets and shows **daily / weekly / monthly totals**, plus goal pacing (yearly → quarterly → monthly → weekly → daily).

## Quick Start (GitHub Pages)
1. Create a new repo (e.g. `cdc-goal-tracking-calendar`) and upload these files.
2. In GitHub → **Settings** → **Pages** → *Deploy from branch* (root). Wait for the URL to go live.
3. Open `config.js` and set one of these:
   - **SHEET_CSV_URL** = the **Publish to web** CSV link *OR*
   - ensure your sheet is public link-access and use the fallback export URL (already wired).

**Expected column headers** (case-sensitive):  
`Date, Service, Amount, Status, Customer Name, SourceId`

- `Date` → `YYYY-MM-DD`
- `Amount` → number (no $ symbol)

## Google Sheets → CSV
- To publish: File → Share → **Publish to web** → *CSV*. Paste the link into `SHEET_CSV_URL` in `config.js`.
- Direct export (first tab) also works if link sharing is enabled:  
  `https://docs.google.com/spreadsheets/d/1CG0WEyf-sEz8_3Y6jGzU0fZlEomb7w1P/export?format=csv&gid=0`

## HighLevel → Sheet (recommended no‑code)
In HighLevel:
- **Workflows** → New → Trigger: *Appointments → Appointment Status* (Scheduled + Rescheduled).
- **Action**: *Google Sheets → Create Row* (map fields):
  - `Date` ← Appointment start (YYYY-MM-DD)
  - `Service` ← Service name
  - `Amount` ← Opportunity Value (or a custom field you use for price)
  - `Status` ← Appointment status
  - `Customer Name` ← Contact full name
  - `SourceId` ← Appointment ID

Add a second workflow for **Appointment Canceled/Updated** to either mark `Status` or update the row by `SourceId`.

## Targets & Toggles
- **Yearly Goal**: enter once; we compute **quarterly, monthly, weekly, daily**.
- **Include Saturday**: toggles whether Saturday is counted as a working day for daily pacing.
- **Pace by Working Days**: if on, the **daily target** = monthly target / working days of that month; if off, it uses a flat 365-day pace.

## Make it your own
- Colors live in `style.css` (`:root` variables). Brand defaults are set:
  - Black #030303, Red #FA0000, White #FFFFFF, Grey #797878

## Caveats
- The built-in CSV parser is simple—avoid commas inside fields. If you need richer data, consider publishing TSV or upgrading to a more robust parser.
- For private data without publishing, use a small proxy (Cloudflare Worker / Vercel Function) to fetch with a service account and return CSV to the browser.

## License
MIT
