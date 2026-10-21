# Stellantis | General Assembly Shop Assessment Dashboard

A high-performance, responsive industrial operations web dashboard built for the **Stellantis General Assembly Shop**. The dashboard provides real-time visibility into station assessment completion, Workplace Integration (WPI), Health & Safety compliance, and functional corrective action distributions across **7 independent tables and 7 corresponding visual projections**.

---

## 1. Project Overview & Architecture

- **Authoritative Source of Truth**: Evaluated directly from the uploaded Excel model (`Station_Assessment_Dashboard.xlsx`), preserving all sheet structures, formulas, cell coordinates, and calculations.
- **7 Tables & 7 Synchronized Projections**:
  - **Table 1 — Assessment Completion**: LHD Impacted (55), Completed (50), In Progress (10), Completion Rate (90.91%). Visual: Interactive Donut / Gauge Chart.
  - **Table 2 — WPI (Workplace Integration)**: Health & Safety (23), Customer Experience (150), Logistics (16), Workplace Organization (66). Visual: Clustered Vertical Column Chart.
  - **Table 3 — Health & Safety**: Total (23), In Progress (21), Closed (2). Visual: Status Progression Column Chart.
  - **Table 4 — Action Category**: Facility (10), Process (11), Training (1). Visual: Horizontal Bar Chart.
  - **Table 5 — Quality & Defect Containment**: Configurable operational table following Table 4 template pattern with editable rows and synchronized horizontal bar chart.
  - **Table 6 — Logistics & Material Flow**: Configurable operational table following Table 4 template pattern with editable rows and synchronized vertical column chart.
  - **Table 7 — Equipment & Maintenance Alerts**: Configurable operational table following Table 4 template pattern with editable rows and synchronized horizontal bar chart.

### Technology Stack
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Recharts, Lucide React icons.
- **Backend**: Python 3.11, FastAPI, OpenPyXL, Pandas, Pydantic, Requests.
- **Persistence**: Authoritative Excel model (`.xlsx`) + JSON/SQLite persistent store for custom tables (`tables_store.json`).
- **Cloud Integration**: Microsoft Graph API service for OneDrive/SharePoint with local fallback and web upload support.

---

## 2. Excel Analysis & Discrepancy Audit

During Phase 1 workbook inspection of `Station_Assessment_Dashboard_Exact_Layout (1).xlsx`:
1. **Formula Audit**:
   - `Data!C5`: `=IFERROR(B5/$B$5,0)` -> 100%
   - `Data!C6`: `=IFERROR(B6/$B$5,0)` -> 90.91%
   - `Data!C7`: `=IFERROR(B7/$B$5,0)` -> 18.18%
   - `Dashboard!G7`: `=IFERROR(Data!B6/Data!B5,0)` -> 90.91%
2. **Reconciliation Discrepancy (Documented Faithfully)**:
   - In Table 1: Completed Stations ($50$) + In Progress Stations ($10$) = $60$, which exceeds Total Impacted Stations ($55$) by $5$.
   - **Handling**: Per Stellantis guidelines, the system does not force reconciliation or alter raw numbers. It renders source values faithfully and presents an informative data-quality notice.

---

## 3. Getting Started Locally

### Prerequisites
- Python 3.11+
- Node.js v20+ and npm

### Step 1: Clone and Setup Workspace
```bash
git clone <your-repo-url>
cd sanjay
```

### Step 2: Start Backend
```powershell
# Using the provided PowerShell script
.\start_backend.ps1

# Or manually:
cd backend
py -3.11 -m pip install -r requirements.txt
py -3.11 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
The FastAPI backend will start on **`http://localhost:8000`** with interactive API docs at **`http://localhost:8000/docs`**.

### Step 3: Start Frontend
In a new terminal:
```powershell
# Using the provided PowerShell script
.\start_frontend.ps1

# Or manually:
cd frontend
npm install
npm run dev
```
Open **`http://localhost:5173`** in your browser.

---

## 4. REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Healthcheck and Excel workbook existence |
| `GET` | `/api/dashboard` | Main dashboard payload (KPIs, 7 tables, source status, discrepancies) |
| `GET` | `/api/tables` | Retrieve all 7 tables with rows and totals |
| `GET` | `/api/tables/{table_id}` | Retrieve single table by ID |
| `PUT` | `/api/tables/{table_id}` | Update table title, headers, or chart type (Tables 5–7) |
| `POST` | `/api/tables/{table_id}/rows` | Add an operational category row (Tables 5–7) |
| `PUT` | `/api/tables/{table_id}/rows/{row_id}` | Edit category or numeric count |
| `DELETE` | `/api/tables/{table_id}/rows/{row_id}` | Delete category row |
| `POST` | `/api/tables/{table_id}/reset` | Reset table to default placeholder template |
| `POST` | `/api/refresh` | Force re-read of Excel file and sync |
| `GET` | `/api/source/status` | Connection and synchronization status |
| `POST` | `/api/upload-excel` | Upload updated `.xlsx` workbook |
| `GET` | `/api/export/{table_id}` | Export table as CSV |

---

## 5. Configuring Microsoft Graph API for OneDrive / SharePoint

To link live to the OneDrive workbook (`https://1drv.ms/x/c/6e343e4ed189eaf3/...`):

1. **Register an App in Microsoft Entra ID (Azure AD)**:
   - Go to [portal.azure.com](https://portal.azure.com) -> App registrations -> New registration.
   - Note the **Application (client) ID** and **Directory (tenant) ID**.
2. **Create Client Secret**:
   - Certificates & secrets -> New client secret -> Copy the secret value.
3. **Grant API Permissions**:
   - Microsoft Graph -> Application permissions -> `Files.Read.All` or `Files.ReadWrite.All`.
   - Click **Grant admin consent**.
4. **Configure Environment Variables in Backend**:
   ```env
   MICROSOFT_TENANT_ID=<your-tenant-id>
   MICROSOFT_CLIENT_ID=<your-client-id>
   MICROSOFT_CLIENT_SECRET=<your-client-secret>
   ONEDRIVE_DRIVE_ID=<your-drive-id>
   ONEDRIVE_ITEM_ID=<your-item-id>
   ```

*If credentials are not provided, the dashboard automatically runs in Local Excel Mode with full upload capability.*

---

## 6. Deployment Guide

### Frontend Deployment (GitHub Pages)
1. Fork or push this repository to GitHub.
2. In GitHub repository settings:
   - Go to **Settings -> Pages**.
   - Under **Build and deployment -> Source**, select **GitHub Actions**.
3. Under **Settings -> Secrets and variables -> Actions**, optionally set `VITE_API_BASE_URL` to your deployed backend URL (e.g. `https://stellantis-ga-api.onrender.com`).
4. The GitHub Action in `.github/workflows/deploy.yml` will automatically build and deploy the dashboard.

### Backend Deployment (Render)
1. In [Render.com](https://render.com), click **New + -> Web Service**.
2. Connect your GitHub repository.
3. Set:
   - **Root Directory**: `backend`
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add environment variables from `.env.example` as needed.

---

## 7. Replacing Placeholder Categories in Tables 5–7

Tables 5, 6, and 7 are seeded with clearly marked sample placeholders (`Sample Placeholder` badge):
1. Navigate to the **Detailed Data-Table Inspector** below the charts.
2. Select **T5**, **T6**, or **T7**.
3. Click the **Edit (pencil)** icon on any row to replace the category name with genuine shop data and update the numeric count.
4. Or click **Add Row** to create new categories.
5. All 7 visual projection charts immediately re-index, recalculate percentages, and update in real-time.
