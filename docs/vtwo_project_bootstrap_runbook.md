# V.Two Ops — Project Bootstrap Runbook

Use this document to spin up a new single-file HTML app backed by Google Sheets, deployed on Cloudflare Pages, running on your Lume VM. Every step is in order. Do not skip steps.

---

## What you're building

- `index.html` — entire app: HTML, CSS, JS in one file
- `config.js` — your secrets, never committed to git
- `config.example.js` — template showing required fields, committed
- `build.js` — writes `config.js` from Cloudflare env vars at deploy time
- `.gitignore` — keeps `config.js` out of git
- Google Sheets — your database, one tab per data table
- Cloudflare Pages — hosting, connected to GitHub, auto-deploys on push
- Lume VM — where you run Claude Code and git

---

## Part 1 — Google Cloud & Sheets setup

### 1.1 Create the Google Sheet

1. Go to [sheets.google.com](https://sheets.google.com) and create a new spreadsheet
2. Name it something meaningful (e.g. "MyProject Ops Data")
3. Copy the Sheet ID from the URL — it's the long string between `/d/` and `/edit`:
   ```
   https://docs.google.com/spreadsheets/d/THIS_IS_YOUR_SHEET_ID/edit
   ```
4. Create one tab per data table your app needs. Name them exactly as your app will reference them (e.g. `candidates`, `employees`, `devices`). The first row of each tab will be column headers — the app writes these automatically on first save.

### 1.2 Create a Google Cloud project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Click the project dropdown at the top → **New Project**
3. Name it to match your app (e.g. `myproject-ops`)
4. Click **Create**

### 1.3 Enable the Sheets API

1. In your new project, go to **APIs & Services → Library**
2. Search for **Google Sheets API**
3. Click it → **Enable**

### 1.4 Create a service account

1. Go to **APIs & Services → Credentials**
2. Click **+ Create Credentials → Service Account**
3. Name it (e.g. `myproject-ops-sheets`)
4. Click **Create and Continue** → skip role → **Done**
5. Click the service account you just created
6. Go to the **Keys** tab → **Add Key → Create new key → JSON**
7. A JSON file downloads — open it and copy two values:
   - `client_email` — looks like `myproject-ops-sheets@myproject-ops.iam.gserviceaccount.com`
   - `private_key` — the long string starting with `-----BEGIN PRIVATE KEY-----`

### 1.5 Share the Sheet with the service account

1. Open your Google Sheet
2. Click **Share** (top right)
3. Paste the `client_email` from above
4. Set role to **Editor**
5. Click **Send** (ignore the "can't notify" warning)

---

## Part 2 — VM & repo setup

### 2.1 SSH into your VM

From your Mac terminal:
```bash
oliver2
```
Enter your password when prompted. You are now on the VM as `oliver`.

### 2.2 Create the project folder and git repo

```bash
mkdir -p /Users/oliver/OliverRepo/workspaces/work/projects/YOUR-PROJECT-NAME
cd /Users/oliver/OliverRepo/workspaces/work/projects/YOUR-PROJECT-NAME
git init
```

### 2.3 Create config files

Create `config.js` (your real secrets — never committed):
```bash
cat > config.js << 'EOF'
window.__ENV__ = {
  SA_EMAIL: 'your-service-account@your-project.iam.gserviceaccount.com',
  SA_KEY: `-----BEGIN PRIVATE KEY-----
paste your full private key here
-----END PRIVATE KEY-----`
};
EOF
```

> **Private key formatting:** Paste the key exactly as it appears in the JSON file. Keep the `-----BEGIN PRIVATE KEY-----` and `-----END PRIVATE KEY-----` lines. Keep all the line breaks inside.

Create `config.example.js` (safe to commit — no real secrets):
```bash
cat > config.example.js << 'EOF'
// config.example.js — copy to config.js and fill in your credentials
// config.js is gitignored and never committed

window.__ENV__ = {
  SA_EMAIL: 'your-service-account@your-project.iam.gserviceaccount.com',
  SA_KEY: `-----BEGIN PRIVATE KEY-----
<paste your private key here>
-----END PRIVATE KEY-----`
};
EOF
```

Create `build.js` (used by Cloudflare at deploy time):
```bash
cat > build.js << 'EOF'
const fs = require('fs');
const email = process.env.SA_EMAIL;
const key = (process.env.SA_KEY || '').replace(/\\n/g, '\n');
if (!email || !key) { console.error('Missing SA_EMAIL or SA_KEY'); process.exit(1); }
fs.writeFileSync('config.js', `window.__ENV__={SA_EMAIL:${JSON.stringify(email)},SA_KEY:${JSON.stringify(key)}};`);
console.log('config.js written, key length:', key.length);
EOF
```

Create `.gitignore`:
```bash
cat > .gitignore << 'EOF'
config.js
node_modules/
.DS_Store
EOF
```

Create a placeholder `index.html` so you have something to push:
```bash
echo '<!DOCTYPE html><html><body>Coming soon</body></html>' > index.html
```

### 2.4 Push to GitHub

1. Go to [github.com](https://github.com) → **New repository**
2. Name it (e.g. `myproject-ops`)
3. Set to **Private**
4. Do not initialize with README (you already have files)
5. Copy the repo URL (e.g. `git@github.com:yourusername/myproject-ops.git`)

Back in your VM terminal:
```bash
git add -A
git commit -m "init: project scaffold"
git remote add origin git@github.com:yourusername/myproject-ops.git
git push -u origin main
```

> If you get a permission error, your VM's SSH key may not be added to GitHub. Run `cat ~/.ssh/id_rsa.pub` on the VM, copy the output, and add it at github.com → Settings → SSH Keys.

---

## Part 3 — Cloudflare Pages setup

### 3.1 Connect the repo

1. Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Pages → Create a project → Connect to Git**
3. Authorize GitHub and select your repo
4. Framework preset: **None**
5. Build command: `node build.js`
6. Build output directory: `/` (root)
7. Click **Save and Deploy** — it will fail the first time because env vars aren't set yet, that's fine

### 3.2 Add environment variables

1. Go to your Pages project → **Settings → Environment Variables**
2. Add these three variables under **Production**:

| Variable | Value |
|----------|-------|
| `SA_EMAIL` | your service account email |
| `SA_KEY` | your full private key including BEGIN/END lines — replace actual line breaks with `\n` |
| `SHEET_ID` | your Google Sheet ID |

> **SA_KEY formatting for Cloudflare:** The private key needs literal `\n` characters instead of real line breaks when pasting into the Cloudflare dashboard. You can convert it by running this on your Mac:
> ```bash
> cat your-key.json | python3 -c "import json,sys; print(json.load(sys.stdin)['private_key'].replace('\n','\\n'))"
> ```

3. Click **Save**
4. Go to **Deployments → Retry deployment** — it should succeed now

### 3.3 Verify

Visit your `.pages.dev` URL. You should see your placeholder page. Any future `git push origin main` will trigger a new deploy automatically. Hard refresh with **Cmd+Shift+R** to see changes.

---

## Part 4 — The auth & Sheets code (copy into index.html)

This is the exact JWT auth and Sheets read/write pattern. Copy this into your `index.html` inside a `<script>` tag. Replace `SHEET_ID` with your actual Sheet ID or reference it from `window.__ENV__`.

```javascript
const SA_EMAIL = window.__ENV__?.SA_EMAIL || '';
const SA_KEY = window.__ENV__?.SA_KEY || '';
const SHEET_ID = 'YOUR_SHEET_ID_HERE';
const BASE = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}`;

// Token cache
let _tokenCache = { token: null, exp: 0 };

function b64url(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function pemToBytes(pem) {
  const b64 = pem.replace(/-----[^-]+-----/g, '').replace(/\s+/g, '');
  const bin = atob(b64);
  return Uint8Array.from(bin, c => c.charCodeAt(0));
}

async function getAccessToken() {
  const now = Math.floor(Date.now() / 1000);
  if (_tokenCache.token && now < _tokenCache.exp - 60) return _tokenCache.token;

  const header = b64url(new TextEncoder().encode(JSON.stringify({ alg: 'RS256', typ: 'JWT' })));
  const claim = b64url(new TextEncoder().encode(JSON.stringify({
    iss: SA_EMAIL,
    scope: 'https://www.googleapis.com/auth/spreadsheets',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now, exp: now + 3600
  })));
  const sigInput = new TextEncoder().encode(`${header}.${claim}`);

  const keyBytes = pemToBytes(SA_KEY);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', keyBytes, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['sign']
  );
  const sigBuf = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', cryptoKey, sigInput);
  const jwt = `${header}.${claim}.${b64url(sigBuf)}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    throw new Error(`Token error: ${e.error_description || res.status}`);
  }
  const d = await res.json();
  _tokenCache = { token: d.access_token, exp: now + d.expires_in };
  return d.access_token;
}

// Read a tab — returns array of objects (first row = headers)
async function sheetsGet(tab) {
  const token = await getAccessToken();
  const r = await fetch(`${BASE}/values/${encodeURIComponent(tab)}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!r.ok) throw new Error(`Read ${tab}: ${r.status}`);
  const d = await r.json();
  const rows = d.values || [];
  if (rows.length < 2) return [];
  const h = rows[0];
  return rows.slice(1).map(row => {
    const o = {};
    h.forEach((k, i) => { o[k] = row[i] ?? ''; });
    return o;
  });
}

// Write a tab — overwrites entire tab with array of objects
async function sheetsSet(tab, data) {
  const token = await getAccessToken();
  const authHeader = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // Clear first
  const clearR = await fetch(`${BASE}/values/${encodeURIComponent(tab)}:clear`, {
    method: 'POST', headers: authHeader, body: '{}'
  });
  if (!clearR.ok) {
    const err = await clearR.json().catch(() => ({}));
    throw new Error(`Clear ${tab}: ${clearR.status} ${err?.error?.message || ''}`);
  }
  if (!data.length) return;

  const headers = Object.keys(data[0]);
  const values = [headers, ...data.map(row =>
    headers.map(h => {
      const v = row[h];
      if (v === null || v === undefined) return '';
      if (typeof v === 'object') return JSON.stringify(v);
      return String(v);
    })
  )];

  const writeR = await fetch(`${BASE}/values/${encodeURIComponent(tab)}?valueInputOption=RAW`, {
    method: 'PUT', headers: authHeader, body: JSON.stringify({ values })
  });
  if (!writeR.ok) {
    const err = await writeR.json().catch(() => ({}));
    throw new Error(`Write ${tab}: ${writeR.status} ${err?.error?.message || ''}`);
  }
}
```

---

## Part 5 — Day-to-day workflow

### Pushing changes from VM to production

```bash
cd /Users/oliver/OliverRepo/workspaces/work/projects/YOUR-PROJECT-NAME
git add -A
git commit -m "description of what you changed"
git push origin main
```

Then wait ~30 seconds and hard refresh your Cloudflare URL: **Cmd+Shift+R**

### Syntax check before every commit

Run this — do not push if it prints SYNTAX ERROR:
```bash
node -e "const h=require('fs').readFileSync('index.html','utf8');new Function(h.match(/<script>([\s\S]*?)<\/script>/)[1])();console.log('OK')" 2>&1 || echo "SYNTAX ERROR"
```

### Copying a file from your Mac to the VM

From your Mac terminal (not the VM):
```bash
scp ~/Downloads/filename.html oliver@192.168.64.2:/Users/oliver/OliverRepo/workspaces/work/projects/YOUR-PROJECT-NAME/
```

### Rolling back to a previous commit

```bash
git log --oneline -10          # find the commit you want
git reset --hard COMMIT_HASH   # reset to it locally
git push origin main --force   # force push to deploy it
```

> Warning: force push rewrites history. Only do this to recover from a broken state, not as routine workflow.

---

## Part 6 — Claude Code bootstrap prompt

Paste this at the start of every new Claude Code session for a new project. Fill in the bracketed sections.

---

We are building a single-file HTML app (`index.html`) with the following architecture:

- All HTML, CSS, and JS in one file — `index.html`
- `config.js` (gitignored) contains `window.__ENV__` with `SA_EMAIL`, `SA_KEY`
- `build.js` writes `config.js` from Cloudflare environment variables at deploy time
- Google Sheets is the database — one tab per data table, accessed via service account JWT auth
- Deployed on Cloudflare Pages, connected to GitHub, auto-deploys on push to main
- Sheet ID: `[YOUR SHEET_ID]`

**Auth pattern** — already implemented in the file. Do not change `getAccessToken`, `sheetsGet`, or `sheetsSet`. These are working and stable.

**Data persistence pattern:** Every DB table maps to a Sheet tab name in `SHEET_NAMES`. On boot, `loadAll()` reads all tabs. On every mutation, call `await save('tableName')` which calls `sheetsSet`.

**Code rules — non-negotiable, follow on every file you touch:**
- No nested template literals — string concatenation only for any HTML building
- No emoji anywhere in the UI — text labels or SVG icons only
- No browser `confirm()` dialogs — use custom `showModal()` confirmations
- After every edit run this and do not commit if it fails:
  `node -e "const h=require('fs').readFileSync('index.html','utf8');new Function(h.match(/<script>([\s\S]*?)<\/script>/)[1])();console.log('OK')" 2>&1`

**Data model:**
[Paste your full schema here — every table, every field]

**Sheet tab names:**
[List each tab name exactly as it appears in your Google Sheet]

**Sections to build:**
[List every page/section of the app]

**Build order:** Scaffold shell and nav first → auth and loadAll → one section at a time, syntax check and commit after each. Do not build everything at once.

**Reference files in this repo:**
- `config.example.js` — shows the env var structure
- `build.js` — Cloudflare build script, do not modify

---

## Part 7 — Common issues & fixes

**Site stuck on Loading...**
Open browser console (Cmd+Option+J). Look for the error. Most common causes:
- Syntax error in JS → run the syntax check command above
- Google Sheets auth failing → check SA_EMAIL and SA_KEY in config.js match the service account
- Sheet not shared with service account → re-share the Sheet with the SA_EMAIL as Editor

**Private key error on Cloudflare**
The key must have `\n` instead of real line breaks in the Cloudflare env var dashboard. Run this on your Mac to convert:
```bash
python3 -c "
with open('your-downloaded-key.json') as f:
    import json
    d = json.load(f)
    print(d['private_key'].replace('\n', '\\\\n'))
"
```

**Git says "not a git repository"**
You're in the wrong directory. Run:
```bash
find ~ -name "index.html" 2>/dev/null | grep -i YOUR-PROJECT-NAME
```
Then `cd` to that path.

**Cloudflare build failing**
Check the build log in Cloudflare Pages → Deployments → click the failed deployment. Most common: `SA_KEY` env var missing or malformed.

**Force push wiped data from Google Sheet**
Git only tracks code — your Sheet data is unaffected by git operations. Open the Sheet and check File → Version history to restore any data that was overwritten by the app.
