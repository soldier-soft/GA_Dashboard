from typing import List, Optional, Dict, Any, Union
from pydantic import BaseModel, Field
from datetime import datetime

class TableRow(BaseModel):
    id: str
    category: str
    value: float
    percentage: Optional[float] = None
    excel_cell_ref: Optional[str] = None
    excel_formula: Optional[str] = None
    is_placeholder: bool = False

class TableMeta(BaseModel):
    id: str
    title: str
    subtitle: Optional[str] = None
    category_header: str = "Category"
    value_header: str = "Data"
    is_excel_source: bool = False
    is_editable: bool = True
    chart_type: str = "bar" # "donut" | "column" | "bar"
    chart_color: Optional[str] = None
    description: Optional[str] = None

class TableData(TableMeta):
    rows: List[TableRow] = []
    total: float = 0.0
    summary: Dict[str, Any] = Field(default_factory=dict)

class KPIItem(BaseModel):
    id: str
    label: str
    value: Union[int, float, str]
    formatted: str
    subtext: Optional[str] = None
    status: str = "neutral" # "success" | "warning" | "info" | "neutral"
    icon: Optional[str] = None

class DiscrepancyNotice(BaseModel):
    id: str
    severity: str # "warning" | "info"
    title: str
    description: str
    table_id: str
    raw_details: Dict[str, Any] = Field(default_factory=dict)

class SourceStatus(BaseModel):
    source_type: str = "local_excel" # "local_excel" | "graph_onedrive" | "custom_upload"
    file_name: str
    file_path: Optional[str] = None
    last_synced: str
    file_modified_time: Optional[str] = None
    is_connected: bool = True
    sync_interval_seconds: int = 60
    message: str = "Operating normally from authoritative Excel source."
    onedrive_link: Optional[str] = None

class DashboardResponse(BaseModel):
    kpis: List[KPIItem]
    tables: List[TableData]
    source_status: SourceStatus
    discrepancies: List[DiscrepancyNotice]
    last_refresh: str
    data_quality_score: int = 98

class RowCreate(BaseModel):
    category: str
    value: float
    is_placeholder: bool = False

class RowUpdate(BaseModel):
    category: Optional[str] = None
    value: Optional[float] = None

class TableUpdate(BaseModel):
    title: Optional[str] = None
    subtitle: Optional[str] = None
    category_header: Optional[str] = None
    value_header: Optional[str] = None
    chart_type: Optional[str] = None
    chart_color: Optional[str] = None
    description: Optional[str] = None
