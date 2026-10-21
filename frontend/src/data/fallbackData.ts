import type { DashboardResponse } from '../types/dashboard';

export const FALLBACK_DASHBOARD_DATA: DashboardResponse = {
  kpis: [
    {
      id: "kpi-impacted",
      label: "LHD Impacted Stations",
      value: 55,
      formatted: "55",
      subtext: "Baseline Total Impacted",
      status: "neutral",
      icon: "Layers"
    },
    {
      id: "kpi-completed",
      label: "Completed Stations",
      value: 50,
      formatted: "50",
      subtext: "90.91% Completion Rate",
      status: "success",
      icon: "CheckCircle2"
    },
    {
      id: "kpi-inprogress",
      label: "In Progress Stations",
      value: 10,
      formatted: "10",
      subtext: "Pending Sign-off",
      status: "warning",
      icon: "Clock"
    },
    {
      id: "kpi-completion-rate",
      label: "Completion Rate",
      value: 90.91,
      formatted: "90.91%",
      subtext: "Stations Assessed / Impacted",
      status: "info",
      icon: "TrendingUp"
    },
    {
      id: "kpi-wpi-total",
      label: "Total WPI Points",
      value: 255,
      formatted: "255",
      subtext: "Across 4 WPI Categories",
      status: "neutral",
      icon: "Activity"
    },
    {
      id: "kpi-hs-total",
      label: "Health & Safety Items",
      value: 23,
      formatted: "23",
      subtext: "2 Closed / 21 In Progress",
      status: "warning",
      icon: "ShieldAlert"
    },
    {
      id: "kpi-action-total",
      label: "Action Items",
      value: 22,
      formatted: "22",
      subtext: "Facility / Process / Training",
      status: "neutral",
      icon: "ClipboardList"
    }
  ],
  tables: [
    {
      id: "table-1",
      title: "Table 1 — Assessment Completion",
      subtitle: "LHD Impacted Station Progress & Status",
      category_header: "Assessment Status",
      value_header: "Stations",
      is_excel_source: true,
      is_editable: false,
      chart_type: "donut",
      chart_color: "#2563eb",
      description: "Authoritative station assessment counts and completion rate from Excel Data sheet.",
      rows: [
        {
          id: "t1-impacted",
          category: "LHD IMPACTED STATION",
          value: 55,
          percentage: 1.0,
          excel_cell_ref: "Data!A5:C5",
          excel_formula: "=IFERROR(B5/$B$5,0)",
          is_placeholder: false
        },
        {
          id: "t1-completed",
          category: "COMPLETED STATION",
          value: 50,
          percentage: 0.9091,
          excel_cell_ref: "Data!A6:C6",
          excel_formula: "=IFERROR(B6/$B$5,0)",
          is_placeholder: false
        },
        {
          id: "t1-inprogress",
          category: "INPROGRESS STATION",
          value: 10,
          percentage: 0.1818,
          excel_cell_ref: "Data!A7:C7",
          excel_formula: "=IFERROR(B7/$B$5,0)",
          is_placeholder: false
        }
      ],
      total: 55,
      summary: {
        impacted: 55,
        completed: 50,
        in_progress: 10,
        completion_rate: 90.91
      }
    },
    {
      id: "table-2",
      title: "Table 2 — WPI",
      subtitle: "Workplace Integration by Category",
      category_header: "WPI Category",
      value_header: "Data",
      is_excel_source: true,
      is_editable: false,
      chart_type: "column",
      chart_color: "#0284c7",
      description: "Assessment distribution across Health & Safety, Customer Experience, Logistics, and Workplace Organization.",
      rows: [
        {
          id: "t2-row-1",
          category: "Health and safety",
          value: 23,
          percentage: 0.0902,
          excel_cell_ref: "Data!A11:B11",
          is_placeholder: false
        },
        {
          id: "t2-row-2",
          category: "Customer experience",
          value: 150,
          percentage: 0.5882,
          excel_cell_ref: "Data!A12:B12",
          is_placeholder: false
        },
        {
          id: "t2-row-3",
          category: "Logistics",
          value: 16,
          percentage: 0.0627,
          excel_cell_ref: "Data!A13:B13",
          is_placeholder: false
        },
        {
          id: "t2-row-4",
          category: "Workplace organization",
          value: 66,
          percentage: 0.2588,
          excel_cell_ref: "Data!A14:B14",
          is_placeholder: false
        }
      ],
      total: 255,
      summary: {
        highest_category: "Customer experience",
        total_wpi_points: 255
      }
    },
    {
      id: "table-3",
      title: "Table 3 — Health & Safety",
      subtitle: "Safety Assessment Status Breakdown",
      category_header: "Health and Safety",
      value_header: "Data",
      is_excel_source: true,
      is_editable: false,
      chart_type: "column",
      chart_color: "#10b981",
      description: "Resolution status for shop-floor Health and Safety assessments.",
      rows: [
        {
          id: "t3-total",
          category: "Total",
          value: 23,
          percentage: 1.0,
          excel_cell_ref: "Data!E5:F5",
          is_placeholder: false
        },
        {
          id: "t3-inprog",
          category: "In progress",
          value: 21,
          percentage: 0.913,
          excel_cell_ref: "Data!E6:F6",
          is_placeholder: false
        },
        {
          id: "t3-closed",
          category: "Closed",
          value: 2,
          percentage: 0.087,
          excel_cell_ref: "Data!E7:F7",
          is_placeholder: false
        }
      ],
      total: 23,
      summary: {
        closure_rate: 8.7,
        in_progress: 21,
        closed: 2
      }
    },
    {
      id: "table-4",
      title: "Table 4 — Action Category",
      subtitle: "Corrective Actions by Functional Discipline",
      category_header: "Action Category",
      value_header: "Data",
      is_excel_source: true,
      is_editable: false,
      chart_type: "bar",
      chart_color: "#f59e0b",
      description: "Categorization of corrective actions across Facility, Process, and Training (Template standard for Tables 5-7).",
      rows: [
        {
          id: "t4-row-1",
          category: "Facility",
          value: 10,
          percentage: 0.4545,
          excel_cell_ref: "Data!H5:I5",
          is_placeholder: false
        },
        {
          id: "t4-row-2",
          category: "Process",
          value: 11,
          percentage: 0.5,
          excel_cell_ref: "Data!H6:I6",
          is_placeholder: false
        },
        {
          id: "t4-row-3",
          category: "Training",
          value: 1,
          percentage: 0.0455,
          excel_cell_ref: "Data!H7:I7",
          is_placeholder: false
        }
      ],
      total: 22,
      summary: {
        dominant_category: "Process",
        total_actions: 22
      }
    },
    {
      id: "table-5",
      title: "Table 5 — Quality & Defect Containment",
      subtitle: "Station Defect Verification & Containment Flags (Configurable)",
      category_header: "Quality Category",
      value_header: "Data",
      is_excel_source: false,
      is_editable: true,
      chart_type: "bar",
      chart_color: "#8b5cf6",
      description: "Configurable operational table tracking station-level assembly quality verification checkpoints. Sample categories are editable placeholders.",
      rows: [
        { id: "t5-row-1", category: "Torque & Fastener Verification", value: 14, percentage: 0.359, is_placeholder: true },
        { id: "t5-row-2", category: "Vision System Inspection", value: 8, percentage: 0.2051, is_placeholder: true },
        { id: "t5-row-3", category: "Gap & Flush Alignment", value: 12, percentage: 0.3077, is_placeholder: true },
        { id: "t5-row-4", category: "Electrical / CAN Bus Check", value: 5, percentage: 0.1282, is_placeholder: true }
      ],
      total: 39,
      summary: {
        row_count: 4,
        total_sum: 39,
        has_placeholders: true
      }
    },
    {
      id: "table-6",
      title: "Table 6 — Logistics & Material Flow",
      subtitle: "Line-Side Material Delivery & Kitting Shortages (Configurable)",
      category_header: "Logistics Category",
      value_header: "Data",
      is_excel_source: false,
      is_editable: true,
      chart_type: "column",
      chart_color: "#06b6d4",
      description: "Configurable operational table monitoring line-side feed, kitting shortages, and container replenishment. Sample categories are editable placeholders.",
      rows: [
        { id: "t6-row-1", category: "AGV Delivery Delays", value: 9, percentage: 0.5, is_placeholder: true },
        { id: "t6-row-2", category: "Kitting Part Shortages", value: 4, percentage: 0.2222, is_placeholder: true },
        { id: "t6-row-3", category: "Sequencing Discrepancies", value: 2, percentage: 0.1111, is_placeholder: true },
        { id: "t6-row-4", category: "Buffer Rack Capacity", value: 3, percentage: 0.1667, is_placeholder: true }
      ],
      total: 18,
      summary: {
        row_count: 4,
        total_sum: 18,
        has_placeholders: true
      }
    },
    {
      id: "table-7",
      title: "Table 7 — Equipment & Maintenance Alerts",
      subtitle: "Tooling Reliability & Preventive Alerts (Configurable)",
      category_header: "Maintenance Category",
      value_header: "Data",
      is_excel_source: false,
      is_editable: true,
      chart_type: "bar",
      chart_color: "#ec4899",
      description: "Configurable operational table tracking equipment health, pneumatic integrity, and calibration cycles. Sample categories are editable placeholders.",
      rows: [
        { id: "t7-row-1", category: "Pneumatic / Air Pressure", value: 6, percentage: 0.3158, is_placeholder: true },
        { id: "t7-row-2", category: "Weld Gun / Nutrunner Calibration", value: 8, percentage: 0.4211, is_placeholder: true },
        { id: "t7-row-3", category: "Conveyor & Pallet Indexing", value: 3, percentage: 0.1579, is_placeholder: true },
        { id: "t7-row-4", category: "Robotic Safety Interlocks", value: 2, percentage: 0.1053, is_placeholder: true }
      ],
      total: 19,
      summary: {
        row_count: 4,
        total_sum: 19,
        has_placeholders: true
      }
    }
  ],
  source_status: {
    source_type: "local_excel",
    file_name: "Station_Assessment_Dashboard.xlsx",
    file_path: "backend/data/Station_Assessment_Dashboard.xlsx",
    last_synced: "2026-10-22 00:03:00",
    is_connected: true,
    sync_interval_seconds: 60,
    message: "Operating from authoritative Excel workbook model.",
    onedrive_link: "https://1drv.ms/x/c/6e343e4ed189eaf3/IQD8Y2ntB6CWSJyhBbRFmJaMAYGy5YwQiXxAgPiyZJOJqSE?e=NTegEw"
  },
  discrepancies: [
    {
      id: "disc-t1-sum-overflow",
      severity: "warning",
      title: "Assessment Counts Exceed Total Impacted Stations",
      description: "Completed Stations (50) + In Progress Stations (10) = 60, which exceeds Total LHD Impacted Stations (55) by 5 stations. Displaying faithful Excel model values without forcing reconciliation.",
      table_id: "table-1",
      raw_details: {
        total_impacted: 55,
        completed: 50,
        in_progress: 10,
        excess: 5
      }
    }
  ],
  last_refresh: "2026-10-22 00:03:00",
  data_quality_score: 96
};
