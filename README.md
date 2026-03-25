# V.Two ATS/HRIS

A single-file ATS (Applicant Tracking System) and HRIS (Human Resources Information System) prototype built with vanilla JavaScript and Google Sheets as the backend.

## Features

- **Hiring Pipeline** — Kanban board for candidates with interview tracking
- **Directory** — Employee management with device assignments
- **Onboarding/Offboarding** — Track new hire and departing employee workflows
- **Device Inventory** — Equipment management and assignment tracking
- **Reporting** — Pipeline analytics and source tracking
- **Onboarding Tracks** — Reusable task templates for new hires

## Setup

1. Copy `config.example.js` to `config.js` and add your Google Sheets credentials
2. Open `index.html` in a browser
3. All data is stored in Google Sheets (no server required)

## Architecture

- Single HTML file with embedded JavaScript and CSS
- Mock data for demo purposes
- Direct Google Sheets API integration for persistence
- Responsive split-panel UI for detail views

## Files

- `index.html` — Complete working application
- `config.example.js` — Template for credentials
- `config.js` — Local credentials (git-ignored)
- `.gitignore` — Excludes config.js from version control
