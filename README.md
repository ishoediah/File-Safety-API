# File Safety API

[![CI](https://github.com/ishoediah/File-Safety-API/actions/workflows/ci.yml/badge.svg)](https://github.com/ishoediah/File-Safety-API/actions/workflows/ci.yml)

A REST API that sanitizes uploaded files to remove security and privacy risks before they're stored, displayed, or shared. It strips hidden metadata from images (including GPS location), neutralizes formula-injection attacks in spreadsheets, and removes cross-site-scripting vectors from SVG files — and it detects file-type spoofing by inspecting each file's actual content rather than trusting its extension.

Files are processed entirely in memory and are **never stored**.

> **Note:** This is a structural file-sanitization service. It is **not antivirus software** and does not detect malware or viruses. It removes specific, well-defined categories of risk and is intended as one layer of a broader security strategy.

**Live on RapidAPI:** [File Safety API](https://rapidapi.com/oeditishaan/api/file-safety-api4) · **Category:** Cybersecurity

---

## About this project

This is a project made by Ishaan Oedit. At the time of writing this ( 8/29/2026 ) I am 18 years old and in my 1st year of Electrical Engineering at the Anton De Kom University of Suriname (ADEKUS). I started this project to learn more about back-end development, Application Programming Interfaces and JavaScript. In the end I did manage to learn these, but also learned more about structuring code, file-based cybersecurity attacks, databases, hosting, testing, how code should behave in production, and the legal and business side of selling APIs. I decided to take this project further from a portfolio project to an actual product that will be sold. Future plans include: Directly selling the API to customers along with self made API keys, allowing for more file sanitation options and if possible even building a business around the product. I have learned a lot from this project, and will continue to work on selling the API as an actual product.

I approached this project in structured phases — foundation, configuration, database, middleware, core detection and routing, file handlers, risk scoring, testing, documentation, and deployment — before listing it on the RapidAPI marketplace

### Use of AI

I used an AI assistant throughout this project as a learning and development aid. I wrote the code myself; the assistant's role was to explain concepts I was unfamiliar with, suggest approaches, review my code and catch issues, and act as a sounding board for design and architecture decisions — as well as helping with the non-code side of shipping a product, such as documentation and the legal and business considerations.

Every decision in this project is one I made and understand. I treated AI as a tool to accelerate my learning and to work more like I would alongside a mentor or senior developer, not as a replacement for understanding the code I write. Working effectively with these tools — while still owning and comprehending the result — was itself one of the things I set out to learn.

--

## What it does

| Input | Threat | What the API does |
|-------|--------|-------------------|
| **Images** (JPEG, PNG, WebP, GIF) | Hidden metadata leaks GPS location, device info, timestamps | Re-encodes the image, stripping all EXIF / GPS / XMP metadata |
| **Spreadsheets** (CSV) | Formula injection executes commands when opened in Excel / Sheets | Prefixes dangerous cells with an apostrophe so they're treated as text |
| **Vector graphics** (SVG) | Embedded scripts and event handlers enable XSS | Runs the SVG through a strict sanitizer, removing scripts, handlers, and external references |
| **Any file** | Malicious files disguised with a fake extension | Detects the true type from magic bytes, catching spoofed files |

Every response includes a **safety report**: the detected file type, an overall risk level (`CLEAN` → `CRITICAL`), and a list of findings describing exactly what was removed or neutralized.

---

## How it works

Each request flows through a pipeline of small, single-responsibility stages:

```
request
  → auth          (validates the caller: API key or marketplace proxy secret)
  → rateLimit     (enforces per-customer monthly limits; marketplace traffic skips this)
  → fileGuard     (checks the file is present and within the size limit)
  → detectType    (reads magic bytes to find the true file type — catches spoofing)
  → router        (routes the detected type to the correct handler)
  → handler       (image / csv / svg — performs the actual sanitization)
  → scorer        (assigns a risk level from the findings)
  → response      (returns the cleaned file, base64-encoded, plus the safety report)
```

Detection is content-based, not extension-based: a `.jpg` that is actually a PNG (or something more hostile) is identified by its real bytes. Each handler returns a consistent `{ sanitized, findings }` shape, so the route logic treats all file types uniformly, and the scorer maps finding categories (`metadata`, `formula_injection`, `xss`, `external_resource`) to severity levels centrally.

---

## Tech stack

- **Runtime:** Node.js (ES modules)
- **Web framework:** [Hono](https://hono.dev/) with `@hono/node-server`
- **Database:** Supabase (PostgreSQL) — API keys (hashed), usage counts, and request metadata
- **Image processing:** [sharp](https://sharp.pixelplumbing.com/) (libvips) — re-encoding to strip metadata
- **SVG sanitization:** [DOMPurify](https://github.com/cure53/DOMPurify) via `isomorphic-dompurify`
- **File-type detection:** [`file-type`](https://github.com/sindresorhus/file-type) (magic bytes)
- **CSV parsing:** `csv-parse` / `csv-stringify`
- **Testing:** [Vitest](https://vitest.dev/)
- **Hosting:** Railway
- **Distribution:** RapidAPI marketplace

---

## API usage

### Endpoint

```
POST /v1/sanitize
Content-Type: multipart/form-data
```

Send the file in a form field named `file`.

### Example (cURL)

```bash
curl -X POST "https://<your-endpoint>/v1/sanitize" \
  -H "Authorization: Bearer YOUR_KEY" \
  -F "file=@photo.jpg"
```
For RapidAPI the endpoint is `file-safety-api4.p.rapidapi.com`.

### Example response

```json
{
  "detectedType": "image/jpeg",
  "riskLevel": "LOW",
  "findingsCount": 2,
  "findings": [
    { "type": "exif", "category": "metadata", "action": "removed EXIF metadata" },
    { "type": "xmp",  "category": "metadata", "action": "removed XMP metadata" }
  ],
  "sanitizedFile": "/9j/4AAQSkZJRgABAQEASABIAAD...",
  "announcements": null
}
```

### Getting your file back

`sanitizedFile` is base64-encoded. Decode it to recover the cleaned file:

```javascript
// Node.js
import { writeFileSync } from "node:fs";
writeFileSync("clean.jpg", Buffer.from(data.sanitizedFile, "base64"));
```

```python
# Python
import base64
with open("clean.jpg", "wb") as f:
    f.write(base64.b64decode(data["sanitizedFile"]))
```

### Other endpoints

- `GET /v1/health` — public health check; returns `{ "status": "ok", "DB": "online" }`.
- `GET /v1/usage` — returns the caller's current-month usage, plan, and remaining calls. This is intended for **direct customers** (who have their own record in the database). Marketplace subscribers track usage through the marketplace dashboard instead, so this endpoint is not exposed on the marketplace listing.
- `GET /v1/usage` — returns the caller's current month usage, plan, and remaining calls. This is intended for **direct** customers (who have a record in the database); marketplace customers track usage through the marketplace dashboard instead.

---

## Project structure

```
src/
  index.js                 # app assembly + per-route middleware wiring
  config/                  # plans and constants
  core/
    errors.js              # error catalog + response helper
    detectType.js          # magic-byte file-type detection
    router.js              # type → handler routing
    scorer.js              # findings → risk level
  middleware/
    auth.js                # API key / proxy-secret authentication
    rateLimit.js           # monthly usage enforcement
    fileGuard.js           # file presence + size checks
  handlers/
    image.js               # metadata stripping (sharp)
    csv.js                 # formula-injection neutralization
    svg.js                 # XSS sanitization (DOMPurify)
  routes/
    sanitize.js            # the main pipeline endpoint
    health.js              # health check
    usage.js               # per-customer usage (for direct sales)
  db/                      # Supabase client, keys, usage, request logging
tests/                     # Vitest suites mirroring src/
test-fixtures/             # sample files (including a spoofed-type fixture)
```

---

## Following the flow through the code

If you want to trace a request through the codebase, here's what each file does, in the order a request touches them:

1. **`src/index.js`** — assembles the Hono app and wires each route to exactly the middleware it needs. Health is public; usage needs auth; sanitize runs the full middleware stack. This is the map of the whole API.

2. **`src/middleware/auth.js`** — identifies the caller. If the request carries the marketplace proxy secret, it's flagged as marketplace traffic and passed through. Otherwise the API key is hashed and looked up in the database, and the customer record is attached to the request.

3. **`src/middleware/rateLimit.js`** — for direct customers, checks their monthly usage against their plan limit and increments the count. Marketplace traffic skips this (the marketplace enforces its own limits).

4. **`src/middleware/fileGuard.js`** — confirms a file is actually present and within the size limit before any work begins.

5. **`src/core/detectType.js`** — reads the file's magic bytes to determine its true type. Binary formats are identified by signature; text formats (CSV, SVG) fall back to content inspection. This is what catches spoofed extensions.

6. **`src/core/router.js`** — a small lookup that maps the detected type to the handler that should process it (`image`, `csv`, or `svg`), or signals "unsupported."

7. **`src/handlers/*.js`** — the actual sanitization:
   - `image.js` reads the metadata, records what it finds, then re-encodes with sharp to strip it.
   - `csv.js` parses the rows and prefixes any formula-triggering cell with an apostrophe.
   - `svg.js` runs the markup through DOMPurify, removing scripts, handlers, and external references.
   Each returns the same shape: `{ sanitized, findings }` (or an error flag on failure).

8. **`src/core/scorer.js`** — reads the findings' categories and returns the highest severity as the overall risk level.

9. **`src/routes/sanitize.js`** — orchestrates all of the above: file → buffer → detect → route → handle → score → base64-encode → respond, with logging and a top-level try/catch so any unexpected failure returns a clean error instead of crashing.

10. **`src/db/*.js`** — the Supabase layer: the client, key lookup/hashing, usage counters, and best-effort request logging (metadata only).

11. **`src/core/errors.js`** — a single catalog of every error (code, HTTP status, description) plus a helper that returns them consistently.

Reading those files in that order is the quickest way to understand the whole system.

---

## Code walkthrough

A brief tour of what each file does, following a request from arrival to response — so the flow can be read directly from the source.

**Entry point**
- `src/index.js` — creates the Hono app and wires each route to its middleware chain. Public routes (health) get no auth; the sanitize route gets the full chain (auth → rate limit → file guard → handler). Also starts the server (guarded so tests can import the app without binding a port).

**Middleware (runs before the route handler)**
- `middleware/auth.js` — decides who the caller is. If the request carries the marketplace proxy secret, it's trusted as marketplace traffic and passes through. Otherwise it hashes the provided API key and looks it up in the database; unknown or revoked keys are rejected.
- `middleware/rateLimit.js` — for direct customers, checks the current month's usage against their plan limit and rejects once the limit is reached. Marketplace traffic skips this (the marketplace enforces quotas).
- `middleware/fileGuard.js` — confirms a file is actually present and within the allowed size for the caller's plan, rejecting early with a clear error if not.

**Core logic**
- `core/detectType.js` — inspects the file's magic bytes to determine its true type, so a file can't lie about what it is via its extension.
- `core/router.js` — maps that detected type to the right handler (image / csv / svg), or signals that the type is unsupported.
- `core/scorer.js` — takes the list of findings a handler produced and reduces it to a single overall risk level, using a central severity map.
- `core/errors.js` — the single catalog of every error (code, HTTP status, description) plus a small helper that formats and returns them consistently.

**Handlers (the actual sanitization)**
- `handlers/image.js` — re-encodes the image with `sharp`, which drops all embedded metadata (EXIF, GPS, XMP), and reports what was removed.
- `handlers/csv.js` — scans each cell and neutralizes formula-injection triggers by prefixing them with an apostrophe, recording the row/column of each.
- `handlers/svg.js` — runs the SVG through DOMPurify with a strict profile, stripping scripts, event handlers, and external references.

**Routes**
- `routes/sanitize.js` — the orchestrator: parses the upload, runs detection → routing → the chosen handler → scoring, logs request metadata, and returns the base64-encoded clean file with its safety report. Any failure is caught and returned as a consistent error.
- `routes/health.js` — checks database reachability and reports service status.
- `routes/usage.js` — returns a direct customer's usage figures.

**Data layer**
- `db/` — the Supabase client plus focused helpers for API keys, usage counts, and best-effort request-metadata logging (which never blocks a response if it fails).

## Testing

The project has a Vitest suite covering detection, routing, scoring, each handler, and the routes — including a spoofing test (a JPEG renamed `.png` that must still be detected as a JPEG) and a metadata-stripping test that re-reads a sanitized image to confirm the metadata is actually gone.

```bash
npm test
```

---

## Security notes

- API keys are stored **hashed** (SHA-256); raw keys are never persisted. This applies to direct customers; marketplace traffic is authenticated by a proxy secret instead and is never looked up or stored in the key table. This applies to **direct** customers, whose keys live in the database. **Marketplace traffic skips key storage entirely** — the marketplace issues and manages those keys, and the API authenticates that traffic with a shared proxy secret instead.
- `sharp` is pinned to a patched version with the vulnerable TIFF/VIPS loaders blocked, since the service processes untrusted image input.
- Only file **metadata** is logged (type, risk level, timestamp) — never file contents, IP addresses, or personal data — and logs are purged after 90 days.
- Dependabot is enabled for automated security updates.

---

## Privacy & terms

The service is designed to collect as little as possible: no files are stored, and only request **metadata** (file type, risk level, timestamp) is retained, for at most 90 days. Full legal documents:

- **Privacy Policy:** https://ishoediah.github.io/File-Safety-API-Legal/privacy.html
- **Terms of Service:** https://ishoediah.github.io/File-Safety-API-Legal/terms.html

The Terms describe, among other things, the nature and limitations of the service (notably that it is not antivirus software), acceptable use, and the behavior of each sanitizer.

## Status & roadmap

**Live** on RapidAPI, supporting JPEG, PNG, WebP, GIF, CSV, and SVG.

Planned: PDF support, a batch endpoint, richer GPS-coordinate reporting, zip-bomb detection, and a direct-sale website with self-serve key provisioning.

---

## License

To be released under the MIT License.