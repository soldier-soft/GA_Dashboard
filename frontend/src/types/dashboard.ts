export interface TableRow {
  id: string;
  category: string;
  value: number;
  percentage?: number;
  excel_cell_ref?: string;
  excel_formula?: string;
  is_placeholder?: boolean;
}

export interface TableSummary {
  impacted?: number;
  completed?: number;
  in_progress?: number;
  completion_rate?: number;
  total_wpi_points?: number;
  highest_category?: string;
  closure_rate?: number;
  total_actions?: number;
  row_count?: number;
  total_sum?: number;
  has_placeholders?: boolean;
  [key: string]: any;
}

export interface TableData {
  id: string;
  title: string;
  subtitle?: string;
  category_header: string;
  value_header: string;
  is_excel_source: boolean;
  is_editable: boolean;
  chart_type: 'donut' | 'column' | 'bar';
  chart_color?: string;
  description?: string;
  rows: TableRow[];
  total: number;
  summary: TableSummary;
}

export interface KPIItem {
  id: string;
  label: string;
  value: number | string;
  formatted: string;
  subtext?: string;
  status: 'success' | 'warning' | 'info' | 'neutral';
  icon?: string;
}

export interface DiscrepancyNotice {
  id: string;
  severity: 'warning' | 'info';
  title: string;
  description: string;
  table_id: string;
  raw_details: Record<string, any>;
}

export interface SourceStatus {
  source_type: 'local_excel' | 'graph_onedrive' | 'custom_upload';
  file_name: string;
  file_path?: string;
  last_synced: string;
  file_modified_time?: string;
  is_connected: boolean;
  sync_interval_seconds: number;
  message: string;
  onedrive_link?: string;
}

export interface DashboardResponse {
  kpis: KPIItem[];
  tables: TableData[];
  source_status: SourceStatus;
  discrepancies: DiscrepancyNotice[];
  last_refresh: string;
  data_quality_score: number;
}

export interface RowCreate {
  category: string;
  value: number;
  is_placeholder?: boolean;
}

export interface RowUpdate {
  category?: string;
  value?: number;
}

export interface TableUpdate {
  title?: string;
  subtitle?: string;
  category_header?: string;
  value_header?: string;
  chart_type?: 'donut' | 'column' | 'bar';
  chart_color?: string;
  description?: string;
}
