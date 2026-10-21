import os
import json
import uuid
from typing import Dict, List, Optional
from app.models import TableData, TableRow, TableUpdate, RowCreate, RowUpdate

DEFAULT_STORE_PATH = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))),
    "data",
    "tables_store.json"
)

# Standard initial placeholder templates for Tables 5-7 following Table 4 pattern
DEFAULT_CUSTOM_TABLES: Dict[str, Dict] = {
    "table-5": {
        "id": "table-5",
        "title": "Table 5 — Quality & Defect Containment",
        "subtitle": "Station Defect Verification & Containment Flags (Configurable)",
        "category_header": "Quality Category",
        "value_header": "Data",
        "is_excel_source": False,
        "is_editable": True,
        "chart_type": "bar",
        "chart_color": "#8b5cf6",
        "description": "Configurable operational table tracking station-level assembly quality verification checkpoints. Sample categories are editable placeholders.",
        "rows": [
            {"id": "t5-row-1", "category": "Torque & Fastener Verification", "value": 14.0, "is_placeholder": True},
            {"id": "t5-row-2", "category": "Vision System Inspection", "value": 8.0, "is_placeholder": True},
            {"id": "t5-row-3", "category": "Gap & Flush Alignment", "value": 12.0, "is_placeholder": True},
            {"id": "t5-row-4", "category": "Electrical / CAN Bus Check", "value": 5.0, "is_placeholder": True}
        ]
    },
    "table-6": {
        "id": "table-6",
        "title": "Table 6 — Logistics & Material Flow",
        "subtitle": "Line-Side Material Delivery & Kitting Shortages (Configurable)",
        "category_header": "Logistics Category",
        "value_header": "Data",
        "is_excel_source": False,
        "is_editable": True,
        "chart_type": "column",
        "chart_color": "#06b6d4",
        "description": "Configurable operational table monitoring line-side feed, kitting shortages, and container replenishment. Sample categories are editable placeholders.",
        "rows": [
            {"id": "t6-row-1", "category": "AGV Delivery Delays", "value": 9.0, "is_placeholder": True},
            {"id": "t6-row-2", "category": "Kitting Part Shortages", "value": 4.0, "is_placeholder": True},
            {"id": "t6-row-3", "category": "Sequencing Discrepancies", "value": 2.0, "is_placeholder": True},
            {"id": "t6-row-4", "category": "Buffer Rack Capacity", "value": 3.0, "is_placeholder": True}
        ]
    },
    "table-7": {
        "id": "table-7",
        "title": "Table 7 — Equipment & Maintenance Alerts",
        "subtitle": "Tooling Reliability & Preventive Alerts (Configurable)",
        "category_header": "Maintenance Category",
        "value_header": "Data",
        "is_excel_source": False,
        "is_editable": True,
        "chart_type": "bar",
        "chart_color": "#ec4899",
        "description": "Configurable operational table tracking equipment health, pneumatic integrity, and calibration cycles. Sample categories are editable placeholders.",
        "rows": [
            {"id": "t7-row-1", "category": "Pneumatic / Air Pressure", "value": 6.0, "is_placeholder": True},
            {"id": "t7-row-2", "category": "Weld Gun / Nutrunner Calibration", "value": 8.0, "is_placeholder": True},
            {"id": "t7-row-3", "category": "Conveyor & Pallet Indexing", "value": 3.0, "is_placeholder": True},
            {"id": "t7-row-4", "category": "Robotic Safety Interlocks", "value": 2.0, "is_placeholder": True}
        ]
    }
}

class StorageService:
    def __init__(self, store_path: str = DEFAULT_STORE_PATH):
        self.store_path = store_path
        self._ensure_store()

    def _ensure_store(self):
        os.makedirs(os.path.dirname(self.store_path), exist_ok=True)
        if not os.path.exists(self.store_path):
            with open(self.store_path, "w", encoding="utf-8") as f:
                json.dump(DEFAULT_CUSTOM_TABLES, f, indent=2)

    def _read_store(self) -> Dict[str, Dict]:
        try:
            with open(self.store_path, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return DEFAULT_CUSTOM_TABLES

    def _write_store(self, data: Dict[str, Dict]):
        with open(self.store_path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)

    def get_custom_tables(self) -> Dict[str, TableData]:
        raw_tables = self._read_store()
        result = {}
        for tid, tdict in raw_tables.items():
            rows_list = []
            total = 0.0
            for r in tdict.get("rows", []):
                val = float(r.get("value", 0.0))
                total += val
                rows_list.append(TableRow(
                    id=r.get("id", str(uuid.uuid4())[:8]),
                    category=str(r.get("category", "")),
                    value=val,
                    percentage=0.0,
                    is_placeholder=bool(r.get("is_placeholder", False))
                ))
            
            # calculate percentage safely
            for r in rows_list:
                r.percentage = round((r.value / total), 4) if total > 0 else 0.0

            result[tid] = TableData(
                id=tdict.get("id", tid),
                title=tdict.get("title", f"Table {tid}"),
                subtitle=tdict.get("subtitle"),
                category_header=tdict.get("category_header", "Category"),
                value_header=tdict.get("value_header", "Data"),
                is_excel_source=False,
                is_editable=True,
                chart_type=tdict.get("chart_type", "bar"),
                chart_color=tdict.get("chart_color", "#8b5cf6"),
                description=tdict.get("description"),
                rows=rows_list,
                total=total,
                summary={
                    "row_count": len(rows_list),
                    "total_sum": total,
                    "has_placeholders": any(r.is_placeholder for r in rows_list)
                }
            )
        return result

    def get_table(self, table_id: str) -> Optional[TableData]:
        tables = self.get_custom_tables()
        return tables.get(table_id)

    def update_table_meta(self, table_id: str, update: TableUpdate) -> Optional[TableData]:
        store = self._read_store()
        if table_id not in store:
            return None
        
        t = store[table_id]
        if update.title is not None:
            t["title"] = update.title
        if update.subtitle is not None:
            t["subtitle"] = update.subtitle
        if update.category_header is not None:
            t["category_header"] = update.category_header
        if update.value_header is not None:
            t["value_header"] = update.value_header
        if update.chart_type is not None:
            t["chart_type"] = update.chart_type
        if update.chart_color is not None:
            t["chart_color"] = update.chart_color
        if update.description is not None:
            t["description"] = update.description
            
        self._write_store(store)
        return self.get_table(table_id)

    def add_row(self, table_id: str, row_in: RowCreate) -> Optional[TableData]:
        store = self._read_store()
        if table_id not in store:
            return None
        
        new_row = {
            "id": f"{table_id}-row-{str(uuid.uuid4())[:8]}",
            "category": row_in.category,
            "value": float(row_in.value),
            "is_placeholder": row_in.is_placeholder
        }
        store[table_id].setdefault("rows", []).append(new_row)
        self._write_store(store)
        return self.get_table(table_id)

    def update_row(self, table_id: str, row_id: str, row_in: RowUpdate) -> Optional[TableData]:
        store = self._read_store()
        if table_id not in store:
            return None
        
        rows = store[table_id].get("rows", [])
        found = False
        for r in rows:
            if r.get("id") == row_id:
                if row_in.category is not None:
                    r["category"] = row_in.category
                    # Editing category clears placeholder mark
                    r["is_placeholder"] = False
                if row_in.value is not None:
                    r["value"] = float(row_in.value)
                    r["is_placeholder"] = False
                found = True
                break
        
        if not found:
            return None
            
        self._write_store(store)
        return self.get_table(table_id)

    def delete_row(self, table_id: str, row_id: str) -> Optional[TableData]:
        store = self._read_store()
        if table_id not in store:
            return None
        
        rows = store[table_id].get("rows", [])
        store[table_id]["rows"] = [r for r in rows if r.get("id") != row_id]
        self._write_store(store)
        return self.get_table(table_id)

    def reset_custom_table(self, table_id: str) -> Optional[TableData]:
        if table_id not in DEFAULT_CUSTOM_TABLES:
            return None
        store = self._read_store()
        store[table_id] = json.loads(json.dumps(DEFAULT_CUSTOM_TABLES[table_id]))
        self._write_store(store)
        return self.get_table(table_id)
