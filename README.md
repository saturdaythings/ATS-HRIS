# V.Two ATS/HRIS

A single-file ATS (Applicant Tracking System) and HRIS (Human Resources Information System) built with vanilla JavaScript and Google Sheets as the backend. Deployable to Cloudflare Pages with zero server infrastructure.

## Features

- **Hiring Pipeline** — Kanban board for candidates with interview tracking
- **Directory** — Employee management with device assignments
- **Onboarding/Offboarding** — Track new hire and departing employee workflows
- **Device Inventory** — Equipment management and assignment tracking
- **Reporting** — Pipeline analytics and source tracking
- **Onboarding Tracks** — Reusable task templates for new hires
- **Command Palette** — 28 actions via `+` button or Cmd+K: add/edit/delete candidates, employees, interviews, devices, onboarding runs, and tracks without navigating away from any page

## Stack

- **Frontend**: Single `index.html` (vanilla JS, no build step, no framework)
- **Database**: Google Sheets (native Google Sheets API, OAuth 2.0)
- **Hosting**: Cloudflare Pages (free tier, auto-deploys from GitHub)
- **Auth**: Google Service Account with JWT signing via Web Crypto API

## Quick Start (Local)

```bash
cp config.example.js config.js  # Add your Google Sheets service account credentials
python3 -m http.server 8080
# Open http://localhost:8080
```

## Deployment (Cloudflare Pages)

See **ARCHITECTURE.md** for full deployment instructions, including:
- Creating a Google Sheet and sharing with service account
- Setting up Cloudflare Pages environment variables
- Auto-deploy workflow via GitHub

## Files

- `index.html` — Complete working application (140KB, all-in-one)
- `build.js` — Cloudflare Pages build script (injects credentials at deploy time)
- `config.example.js` — Template for local development
- `config.js` — Generated at build time (Cloudflare) or manually for local (git-ignored)
- `ARCHITECTURE.md` — Complete technical reference
- `.gitignore` — Excludes credentials from version control

## Architecture & Design Decisions

See **ARCHITECTURE.md** for:
- How authentication works (service account JWT flow)
- Constraints and scaling limits (1-5 concurrent users)
- When to graduate to a full backend
- Deployment pattern (reusable for other internal tools)
