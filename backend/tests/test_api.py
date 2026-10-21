import os
import sys
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.excel_reader import ExcelReaderService
from app.services.storage import StorageService
from app.models import RowCreate, RowUpdate, TableUpdate
from app.routes.api import get_all_tables_list, build_kpis

def test_excel_reader_tables_1_to_4():
    reader = ExcelReaderService()
    tables, discrepancies = reader.read_workbook()
    
    assert "table-1" in tables
    assert "table-2" in tables
    assert "table-3" in tables
    assert "table-4" in tables
    
    # Table 1 tests
    t1 = tables["table-1"]
    assert t1.title == "Table 1 — Assessment Completion"
    assert t1.summary["impacted"] == 55
    assert t1.summary["completed"] == 50
    assert t1.summary["in_progress"] == 10
    assert abs(t1.summary["completion_rate"] - 90.91) < 0.1
    
    # Check Table 1 discrepancy was flagged
    assert len(discrepancies) >= 1
    assert any(d.table_id == "table-1" for d in discrepancies)
    
    # Table 2 tests
    t2 = tables["table-2"]
    assert len(t2.rows) == 4
    categories = [r.category for r in t2.rows]
    assert "Health and safety" in categories
    assert "Customer experience" in categories
    assert "Logistics" in categories
    assert "Workplace organization" in categories
    assert t2.total == 255.0
    
    # Table 3 tests
    t3 = tables["table-3"]
    assert len(t3.rows) == 3
    assert t3.total == 23.0
    
    # Table 4 tests
    t4 = tables["table-4"]
    assert len(t4.rows) == 3
    t4_cats = [r.category for r in t4.rows]
    assert "Facility" in t4_cats
    assert "Process" in t4_cats
    assert "Training" in t4_cats
    assert t4.total == 22.0

def test_custom_tables_5_to_7_independence_and_crud():
    storage = StorageService()
    custom_tables = storage.get_custom_tables()
    
    assert "table-5" in custom_tables
    assert "table-6" in custom_tables
    assert "table-7" in custom_tables
    
    # Verify Table 5, 6, 7 are independent
    assert custom_tables["table-5"].title != custom_tables["table-6"].title
    assert custom_tables["table-6"].title != custom_tables["table-7"].title
    
    # Test Adding a row to Table 5
    initial_count = len(custom_tables["table-5"].rows)
    added = storage.add_row("table-5", RowCreate(category="Ultrasonic Weld Check", value=17.0, is_placeholder=False))
    assert len(added.rows) == initial_count + 1
    new_row = next(r for r in added.rows if r.category == "Ultrasonic Weld Check")
    assert new_row.value == 17.0
    assert new_row.is_placeholder is False
    
    # Test Updating the row
    updated = storage.update_row("table-5", new_row.id, RowUpdate(category="Ultrasonic Weld Verified", value=19.0))
    up_row = next(r for r in updated.rows if r.id == new_row.id)
    assert up_row.category == "Ultrasonic Weld Verified"
    assert up_row.value == 19.0
    
    # Test Deleting the row
    deleted = storage.delete_row("table-5", new_row.id)
    assert len(deleted.rows) == initial_count
    assert not any(r.id == new_row.id for r in deleted.rows)

def test_kpi_calculations_and_data_reconciliation():
    all_tables = get_all_tables_list()
    assert len(all_tables) == 7
    kpis = build_kpis(all_tables)
    
    kpi_map = {k.id: k for k in kpis}
    assert kpi_map["kpi-impacted"].value == 55
    assert kpi_map["kpi-completed"].value == 50
    assert kpi_map["kpi-inprogress"].value == 10
    assert abs(float(kpi_map["kpi-completion-rate"].value) - 90.91) < 0.1
    assert kpi_map["kpi-wpi-total"].value == 255
    assert kpi_map["kpi-hs-total"].value == 23

if __name__ == "__main__":
    test_excel_reader_tables_1_to_4()
    print("PASS: test_excel_reader_tables_1_to_4")
    test_custom_tables_5_to_7_independence_and_crud()
    print("PASS: test_custom_tables_5_to_7_independence_and_crud")
    test_kpi_calculations_and_data_reconciliation()
    print("PASS: test_kpi_calculations_and_data_reconciliation")
    print("\nALL BACKEND UNIT TESTS PASSED!")
