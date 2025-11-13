# DcDaddy Fabric Ops — HackUTD 2025 · NMC² Track

> HPC work-order intelligence, dispatch routing, and automation across admin + technician personas.

Built for HackUTD’s NMC² (HPC Computing) challenge, this Next.js app is a full-ops cockpit: admins bundle and parallelize provisioning, technicians get map-aware walk orders, comms are auto-parsed into tickets, and inventory plus AI assistants close the loop for high-density NVIDIA fabrics.

---

## Feature Tour

### 1. Work-order HQ for admins **(**`app/page.tsx:1`**, `components/dashboard/*`)**
- Metric grid, ticket board (known vs ambiguous signals), quick automations, cabling visualization, and predictive inventory sit in one hero screen.  
- `TicketBoard` shows two ticket types—playbooks vs ambiguous hypotheses—wired directly to curated data in `lib/tickets/data.ts`.  
- `QuickAutomation` actions tap a rotating credential pool to simulate push-button fixes for “press a button, get creds” tasks.

### 2. Ticket intelligence + bundling **(`app/tickets/page.tsx:1`, `lib/bundling-engine.ts:1`, `lib/tickets/task-mapper.ts:1`)**
- Admin/technician tabs share filters for severity, tags, and channels.  
- Toggle “Grouped bundles” to run the BundlingEngine heuristic that weighs severity, category, location, priorities, time windows, and customer to find parallel-safe batches.  
- `mapTicketToEnhancedTask` enriches tickets with derived metadata (category, estimated duration, inferred location) before bundling.  
- Ticket rows adapt to the persona: admins see queue + SLA data, technicians see floor, distance, and personal health cautions sourced from `contexts/profile-context.tsx:1`.

### 3. Technician routing + floor plans **(`components/floor-plan/floor-plan-view.tsx:1`, `lib/floor-plan/technician-routing.ts:1`, `lib/floor-plan/pathfinding.ts:1`, `components/floor-plan/floor-cell-modal.tsx:1`, `threescene.tsx:1`)**
- Bundled tickets drive `generateTechnicianRoute`, which injects inventory pulls, elevator penalties, and distance scoring.  
- `findFacilityPath` runs a multi-floor Dijkstra search over blocked aisles, hot/cold lanes, and lift transfers.  
- Floor selection, bundle picker, route panel, legends, and cell modal expose annotations, telemetry, and 3D rack overlays. Opening a cell launches the GLTF rack sandbox so ambiguous issues can show likely causes in-context.

### 4. Field Ops AI device assistant **(`app/field-ops/page.tsx:1`, `components/field-ops/device-assistant.tsx:1`, `lib/devices/data.ts:1`, `app/api/field-ops/device-assistant/route.ts:1`)**
- Field crews can pick any staged device (H100, NVSwitch, QSFP, cooling loop, etc.) and either fire predefined prompts or ask custom questions.  
- Prompts round-trip through the Gemini API route to return safety-checked installation/troubleshooting guidance under 200 words.

### 5. Communications ingestion + ticket generator **(`app/ticketgenerator/page.tsx:1`, `app/api/tickets/from-email/route.ts:1`, `app/api/tickets/from-slack/route.ts:1`)**
- Gmail unread threads and Slack IMs are normalized into Fabric tickets via GPT-4.1 prompts.  
- The generator screen lets ops trigger inbox syncs, inspect structured payloads, and cache results into `localStorage`, which downstream pages (tickets + floor plan) read automatically.

### 6. Inventory + predictive restocking **(`app/inventory/page.tsx:1`, `app/api/inventory/route.ts:1`, `lib/mongodb.ts:1`)**
- MongoDB-backed inventory exposes depletion scoring, weekly burn, filters, multi-select facets, and search across categories/location shelves.  
- `GET /api/inventory` calculates health, weeks remaining, and warnings on the fly so panels and dashboards stay consistent.

### 7. 3D HPC rack + profile-aware UX **(`app/model/page.tsx:1`, `threescene.tsx:1`, `app/profile/page.tsx:1`)**
- A GLTF-based rack view is accessible from both the dedicated `/model` sandbox and the floor-plan modal, complete with CSS2D callouts.  
- The profile page persists technician health data locally; those constraints surface in technician tables (e.g., caution badges for multi-floor climbs).

---

## Architecture at a Glance

- **Framework:** Next.js App Router + React 19 with client components for interactive dashboards.  
- **Design system:** Hand-authored Tailwind-esque utility classes in `app/globals.css`, glassmorphism cards via `SectionCard`.  
- **State:** Lightweight React hooks + context (`ProfileProvider`) plus browser `localStorage` caching for synced tickets.  
- **Data + AI services:**  
  - MongoDB (inventory) via `lib/mongodb.ts`.  
  - Gmail OAuth helper routes (`app/api/gmail/*`) to capture refresh tokens or raw emails.  
  - Slack user-token fetches inside the server route.  
  - OpenAI GPT-4.1 (ticket normalization).  
  - Google Gemini Flash (device assistant).  
- **Pathfinding + heuristics:** Custom bundling engine, inventory-aware technician routing, and Dijkstra floor-walk calculations under `lib/floor-plan`.  
- **3D + visualization:** Three.js scene (`threescene.tsx`) dynamically imported wherever needed so the bundle modal can show rack context without blocking SSR.

---

## Directory Map

| Path | Purpose |
| --- | --- |
| `app/` | App Router pages for overview, tickets, field ops, floor plan, inventory, ticket generator, 3D model, API routes. |
| `components/dashboard` | Reusable cards for metrics, queues, comms, automations, cabling, etc. |
| `components/floor-plan` | Canvas renderer, legend, modal, bundle picker, selectors, and route panel. |
| `components/field-ops` | Device assistant + install queue primitives. |
| `components/tickets` | Table + multi-select filter UI. |
| `components/layout` | Floating nav, location switcher, profile menu. |
| `contexts/` | Profile context with local persistence. |
| `lib/` | Data loaders, bundling/routing engines, credential pool, ticket templates, floor tiles, device catalog, Mongo helper. |
| `public/` | GLTF model, textures, and icons for the HPC rack scene. |

---

## Automation & AI Pipelines

1. **Ticket ingestion**
   - Gmail unread threads → `GET /api/tickets/from-email` → OpenAI JSON mode prompt → normalized Fabric tickets saved client-side.  
   - Slack IMs → `GET /api/tickets/from-slack` → OpenAI prompt ensuring enum compliance → merged with manual backlog.
2. **Bundling + routing**
   - Tickets mapped to enhanced tasks (severity → duration, derived categories) → BundlingEngine groups them → Floor plan builds technician bundles → Routing determines best walk order, factoring inventory stops and elevator costs.
3. **Device assistant**
   - UX posts device context + question to `/api/field-ops/device-assistant` → Gemini Flash returns actionable steps.  
4. **Automation drawer**
   - “Easy tasks” buttons rotate through `credentialPool` credentials to simulate just-in-time account provisioning.
5. **Inventory**
   - MongoDB collection documents augmented with depletion heuristics and weeks-remaining math before being returned to the UI.

---

## Environment Variables

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Connection string for the `nmc.inventory` database. |
| `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI` | OAuth client used by `/api/gmail/auth` + `/api/gmail/callback`. |
| `GMAIL_REFRESH_TOKEN`, `GMAIL_OAUTH_USER` | Service account credentials for pulling unread messages. |
| `SLACK_USER_TOKEN`, `SLACK_ALLOWED_USER_ID` *(optional)* | User token + allowlist for DM ingestion. |
| `OPENAI_API_KEY` | Required by both Slack and Gmail ticket routes. |
| `GEMINI_API_KEY`, `GEMINI_API_URL` *(optional override)* | Used by the device assistant route. |

> Store these in `.env.local`. Gmail refresh tokens can be generated via `/api/gmail/auth` → Google consent → `/api/gmail/callback`.

---

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment**
   - Copy `.env.local.example` (create one if needed) and fill the variables above.  
   - Seed Mongo with sample documents that match the schema used in `app/api/inventory/route.ts:1`, or point to an existing collection.
3. **Run the dev server**
   ```bash
   npm run dev
   ```
4. **Optional integrations**
   - Hit `/ticketgenerator` to sync Gmail + Slack tickets (requires envs).  
   - Visit `/floor-plan` after syncing to see technician bundles incorporate real tickets.  
   - Open `/model` to verify the GLTF scene renders before embedding it via the floor-plan modal.

---

## Extending the Project

1. **Real work-order data** – Swap `lib/tickets/tickets.json` for live service tickets or hook up a queue via tRPC/GraphQL.  
2. **Routing accuracy** – Feed the pathfinding engine real facility geometry or add live telemetry for congestion/blocked aisles.  
3. **Automation hooks** – Replace the credential simulator with real workflow actions (Terraform, NetBox, runbooks).  
4. **Inventory analytics** – Stream inventory usage deltas from sensors/ERP instead of static Mongo docs and surface predictive restock alerts in the hero panel.  
5. **Technician safety** – Extend the profile context with wearables or fatigue signals so dispatching can avoid overworking certain crews.
