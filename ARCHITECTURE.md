# V.Two Prototype Architecture

## Pattern: Single-file HTML app + Google Sheets backend + Cloudflare Pages

This is a repeatable deployment pattern for internal tools and prototypes.
No framework, no server, no database to manage. Just a URL that works.

## Stack
- **Frontend**: Single `index.html` — all HTML, CSS, JS in one file
- **Database**: Google Sheets (one spreadsheet, one tab per data type)
- **Auth**: Google Service Account, JWT signed via Web Crypto API in the browser
- **Hosting**: Cloudflare Pages (free tier, auto-deploys from GitHub)
- **Credentials**: Injected at build time via `build.js` from Cloudflare env vars

## File Structure
```
/
├── index.html          # The entire app
├── build.js            # Cloudflare build script — writes config.js from env vars
├── config.js           # Real credentials — GITIGNORED, never committed
├── config.example.js   # Credential template for setup
├── .gitignore          # Excludes config.js
└── README.md
```

## How credentials work
- Service account JSON from Google Cloud Console
- `SA_EMAIL` and `SA_KEY` stored in Cloudflare Pages env vars
- At deploy time, `build.js` runs and writes `config.js` with those values
- `index.html` loads `config.js` via `<script src="config.js">`
- `getAccessToken()` signs a JWT using Web Crypto API and exchanges for OAuth token
- All Google Sheets reads/writes use Bearer token auth

## Google Sheets setup
- One spreadsheet per app
- Share the sheet with the service account email as Editor
- Run `setup-sheets.js` once to create all required tabs (or create them manually)
- App reads all tabs on load, falls back to seed data if tabs are empty
- All writes clear the tab and rewrite all rows (simple, no row-level updates)

## To deploy a new project using this pattern
1. Copy `index.html`, `build.js`, `config.example.js`, `.gitignore`
2. Create a new Google Sheet, share with service account
3. Create a new GitHub repo (private)
4. Connect to Cloudflare Pages, add `SA_EMAIL` and `SA_KEY` env vars
5. Push — live URL in 60 seconds

## To run locally
```bash
cp config.example.js config.js  # fill in credentials
python3 -m http.server 8080
# open http://localhost:8080
```

## Constraints & when to graduate this pattern

Works for 1-5 concurrent users (Google Sheets API rate limits)
- No user authentication (single shared workspace)
- No row-level permissions

When you need multi-user auth, role-based access, or heavy write volume
→ graduate to a proper backend (Node/Express + Postgres)
