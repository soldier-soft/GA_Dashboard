import os
import shutil
from datetime import datetime
from fastapi import APIRouter, HTTPException, UploadFile, File, Response
from typing import List, Dict, Any, Optional

from app.models import (
    DashboardResponse,
    TableData,
    KPIItem,
    SourceStatus,
    TableUpdate,
    RowCreate,
    RowUpdate,
    DiscrepancyNotice
)
from app.services.excel_reader import ExcelReaderService, DEFAULT_EXCEL_PATH
from app.services.storage import StorageService
from app.services.graph_service import MicrosoftGraphService

router = APIRouter(prefix="/api")

excel_service = ExcelReaderService()
storage_service = StorageService()
graph_service = MicrosoftGraphService()

def build_kpis(tables: List[TableData]) -> List[KPIItem]:
    t1 = next((t for t in tables if t.id == "table-1"), None)
    t2 = next((t for t in tables if t.id == "table-2"), None)
    t3 = next((t for t in tables if t.id == "table-3"), None)
    t4 = next((t for t in tables if t.id == "table-4"), None)

    impacted = 0
    completed = 0
    inprogress = 0
    completion_rate = 0.0

    if t1:
        impacted = int(t1.summary.get("impacted", 55))
        completed = int(t1.summary.get("completed", 50))
        inprogress = int(t1.summary.get("in_progress", 10))
        completion_rate = t1.summary.get("completion_rate", 90.91)

    t2_total = int(t2.total) if t2 else 255
    t3_total = int(t3.total) if t3 else 23
    t4_total = int(t4.total) if t4 else 22

    return [
        KPIItem(
            id="kpi-impacted",
            label="LHD Impacted Stations",
            value=impacted,
            formatted=f"{impacted}",
            subtext="Baseline Total Impacted",
            status="neutral",
            icon="Layers"
        ),
        KPIItem(
            id="kpi-completed",
            label="Completed Stations",
            value=completed,
            formatted=f"{completed}",
            subtext=f"{completion_rate}% Completion Rate",
            status="success",
            icon="CheckCircle2"
        ),
        KPIItem(
            id="kpi-inprogress",
            label="In Progress Stations",
            value=inprogress,
            formatted=f"{inprogress}",
            subtext="Pending Sign-off",
            status="warning",
            icon="Clock"
        ),
        KPIItem(
            id="kpi-completion-rate",
            label="Completion Rate",
            value=completion_rate,
            formatted=f"{completion_rate}%",
            subtext="Stations Assessed / Impacted",
            status="info" if completion_rate >= 90 else "warning",
            icon="TrendingUp"
        ),
        KPIItem(
            id="kpi-wpi-total",
            label="Total WPI Points",
            value=t2_total,
            formatted=f"{t2_total}",
            subtext="Across 4 WPI Categories",
            status="neutral",
            icon="Activity"
        ),
        KPIItem(
            id="kpi-hs-total",
            label="Health & Safety Items",
            value=t3_total,
            formatted=f"{t3_total}",
            subtext=f"{int(t3.summary.get('closed', 2) if t3 else 2)} Closed / {int(t3.summary.get('in_progress', 21) if t3 else 21)} In Progress",
            status="warning" if (t3 and t3.summary.get('in_progress', 0) > 0) else "success",
            icon="ShieldAlert"
        ),
        KPIItem(
            id="kpi-action-total",
            label="Action Items",
            value=t4_total,
            formatted=f"{t4_total}",
            subtext="Facility / Process / Training",
            status="neutral",
            icon="ClipboardList"
        )
    ]

def get_all_tables_list() -> List[TableData]:
    # Read Excel tables (1-4)
    excel_tables, _ = excel_service.read_workbook()
    # Read Custom tables (5-7)
    custom_tables = storage_service.get_custom_tables()

    ordered_ids = [f"table-{i}" for i in range(1, 8)]
    result = []
    for tid in ordered_ids:
        if tid in excel_tables:
            result.append(excel_tables[tid])
        elif tid in custom_tables:
            result.append(custom_tables[tid])
    return result

@router.get("/health")
def get_health():
    return {
        "status": "healthy",
        "service": "Stellantis General Assembly Dashboard API",
        "timestamp": datetime.now().isoformat(),
        "excel_file_exists": os.path.exists(excel_service.excel_path)
    }

@router.get("/dashboard", response_model=DashboardResponse)
def get_dashboard():
    try:
        excel_tables, discrepancies = excel_service.read_workbook()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read Excel workbook: {str(e)}")

    all_tables = get_all_tables_list()
    kpis = build_kpis(all_tables)
    file_info = excel_service.get_file_info()

    graph_status = graph_service.check_for_updates(DEFAULT_EXCEL_PATH) if graph_service.is_configured() else None

    source_status = SourceStatus(
        source_type="graph_onedrive" if graph_service.is_configured() else "local_excel",
        file_name=file_info.get("file_name", "Station_Assessment_Dashboard.xlsx"),
        file_path=file_info.get("path"),
        last_synced=excel_service.last_read_time.strftime("%Y-%m-%d %H:%M:%S"),
        file_modified_time=file_info.get("modified_time"),
        is_connected=True,
        sync_interval_seconds=60,
        message=(
            "Live connected to authoritative Excel model."
            if not graph_service.is_configured()
            else graph_status.get("message", "Connected via Microsoft Graph")
        ),
        onedrive_link=graph_service.public_onedrive_url
    )

    return DashboardResponse(
        kpis=kpis,
        tables=all_tables,
        source_status=source_status,
        discrepancies=discrepancies,
        last_refresh=datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        data_quality_score=96 if discrepancies else 100
    )

@router.get("/tables", response_model=List[TableData])
def get_tables():
    return get_all_tables_list()

@router.get("/tables/{table_id}", response_model=TableData)
def get_table(table_id: str):
    tables = get_all_tables_list()
    found = next((t for t in tables if t.id == table_id), None)
    if not found:
        raise HTTPException(status_code=404, detail=f"Table '{table_id}' not found")
    return found

@router.put("/tables/{table_id}", response_model=TableData)
def update_table_meta(table_id: str, update: TableUpdate):
    if table_id in ["table-1", "table-2", "table-3", "table-4"]:
        raise HTTPException(
            status_code=403,
            detail=f"Table '{table_id}' is derived from authoritative Excel model and its structure is protected. Edit Tables 5-7 or upload an updated Excel file."
        )
    updated = storage_service.update_table_meta(table_id, update)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Custom table '{table_id}' not found")
    return updated

@router.post("/tables/{table_id}/rows", response_model=TableData)
def add_row(table_id: str, row_in: RowCreate):
    if table_id in ["table-1", "table-2", "table-3", "table-4"]:
        raise HTTPException(
            status_code=403,
            detail=f"Table '{table_id}' is sourced directly from Excel. Rows cannot be added via API. Modify the source Excel workbook to add categories."
        )
    updated = storage_service.add_row(table_id, row_in)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Custom table '{table_id}' not found")
    return updated

@router.put("/tables/{table_id}/rows/{row_id}", response_model=TableData)
def update_row(table_id: str, row_id: str, row_in: RowUpdate):
    if table_id in ["table-1", "table-2", "table-3", "table-4"]:
        raise HTTPException(
            status_code=403,
            detail=f"Table '{table_id}' rows are locked to the Excel model. Modify the Excel Data sheet to change values."
        )
    updated = storage_service.update_row(table_id, row_id, row_in)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Row '{row_id}' in table '{table_id}' not found")
    return updated

@router.delete("/tables/{table_id}/rows/{row_id}", response_model=TableData)
def delete_row(table_id: str, row_id: str):
    if table_id in ["table-1", "table-2", "table-3", "table-4"]:
        raise HTTPException(
            status_code=403,
            detail=f"Table '{table_id}' rows cannot be deleted directly. Excel model is the single source of truth."
        )
    updated = storage_service.delete_row(table_id, row_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Row '{row_id}' in table '{table_id}' not found")
    return updated

@router.post("/tables/{table_id}/reset", response_model=TableData)
def reset_table(table_id: str):
    updated = storage_service.reset_custom_table(table_id)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Cannot reset table '{table_id}'")
    return updated

@router.post("/refresh", response_model=DashboardResponse)
def trigger_refresh():
    # Force re-read of Excel file
    excel_service.read_workbook(force=True)
    return get_dashboard()

@router.get("/source/status", response_model=SourceStatus)
def get_source_status():
    file_info = excel_service.get_file_info()
    return SourceStatus(
        source_type="graph_onedrive" if graph_service.is_configured() else "local_excel",
        file_name=file_info.get("file_name", "Station_Assessment_Dashboard.xlsx"),
        file_path=file_info.get("path"),
        last_synced=excel_service.last_read_time.strftime("%Y-%m-%d %H:%M:%S"),
        file_modified_time=file_info.get("modified_time"),
        is_connected=True,
        sync_interval_seconds=60,
        message="Local Excel workbook active and synchronized." if not graph_service.is_configured() else "OneDrive Graph synchronization active.",
        onedrive_link=graph_service.public_onedrive_url
    )

@router.post("/upload-excel")
async def upload_excel(file: UploadFile = File(...)):
    if not file.filename.endswith((".xlsx", ".xlsm")):
        raise HTTPException(status_code=400, detail="Only .xlsx or .xlsm files are supported")
    
    temp_path = DEFAULT_EXCEL_PATH + ".temp"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Test parse temp file
        temp_service = ExcelReaderService(excel_path=temp_path)
        temp_service.read_workbook(force=True)
        
        # If successful, overwrite main file
        shutil.move(temp_path, DEFAULT_EXCEL_PATH)
        excel_service.excel_path = DEFAULT_EXCEL_PATH
        excel_service.read_workbook(force=True)
        return {
            "status": "success",
            "message": f"Successfully updated Excel workbook with uploaded file: {file.filename}",
            "last_synced": datetime.now().isoformat()
        }
    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        raise HTTPException(status_code=400, detail=f"Failed to parse uploaded Excel workbook: {str(e)}")

@router.get("/export/{table_id}")
def export_table_csv(table_id: str):
    tables = get_all_tables_list()
    table = next((t for t in tables if t.id == table_id), None)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    
    csv_lines = [f"{table.category_header},{table.value_header},Percentage"]
    for r in table.rows:
        pct_str = f"{r.percentage * 100:.2f}%" if r.percentage is not None else ""
        csv_lines.append(f'"{r.category}",{r.value},{pct_str}')
    
    content = "\n".join(csv_lines)
    return Response(
        content=content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename={table_id}.csv"}
    )
