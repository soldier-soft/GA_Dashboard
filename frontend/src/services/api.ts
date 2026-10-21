import type {
  DashboardResponse,
  TableData,
  RowCreate,
  RowUpdate,
  TableUpdate
} from '../types/dashboard';
import { FALLBACK_DASHBOARD_DATA } from '../data/fallbackData';

// API base URL configurable via VITE_API_BASE_URL (defaults to local FastAPI backend)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const LOCAL_STORAGE_KEY = 'stellantis_dashboard_custom_state_v1';

// Helper for local storage persistence when running in static/offline mode
function getLocalFallbackState(): DashboardResponse {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.warn('Could not read local state from localStorage', e);
  }
  return JSON.parse(JSON.stringify(FALLBACK_DASHBOARD_DATA));
}

function saveLocalFallbackState(state: DashboardResponse) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.warn('Could not write local state to localStorage', e);
  }
}

export const apiService = {
  async getDashboard(): Promise<DashboardResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: DashboardResponse = await res.json();
      saveLocalFallbackState(data);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, using persistent offline fallback data:', err);
      return getLocalFallbackState();
    }
  },

  async triggerRefresh(): Promise<DashboardResponse> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/refresh`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      saveLocalFallbackState(data);
      return data;
    } catch (err) {
      console.warn('Backend refresh failed, refreshing local state:', err);
      const state = getLocalFallbackState();
      state.last_refresh = new Date().toISOString().replace('T', ' ').slice(0, 19);
      saveLocalFallbackState(state);
      return state;
    }
  },

  async addRow(tableId: string, row: RowCreate): Promise<TableData> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${tableId}/rows`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(row),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      // Local fallback handler
      const state = getLocalFallbackState();
      const targetTable = state.tables.find(t => t.id === tableId);
      if (!targetTable) throw new Error(`Table ${tableId} not found`);
      
      const newRow = {
        id: `${tableId}-row-${Date.now().toString(36)}`,
        category: row.category,
        value: Number(row.value),
        percentage: 0,
        is_placeholder: Boolean(row.is_placeholder),
      };
      targetTable.rows.push(newRow);
      
      // recalculate total and percentages
      const newTotal = targetTable.rows.reduce((sum, r) => sum + r.value, 0);
      targetTable.total = newTotal;
      targetTable.rows.forEach(r => {
        r.percentage = newTotal > 0 ? Number((r.value / newTotal).toFixed(4)) : 0;
      });
      saveLocalFallbackState(state);
      return targetTable;
    }
  },

  async updateRow(tableId: string, rowId: string, update: RowUpdate): Promise<TableData> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${tableId}/rows/${rowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      // Local fallback handler
      const state = getLocalFallbackState();
      const targetTable = state.tables.find(t => t.id === tableId);
      if (!targetTable) throw new Error(`Table ${tableId} not found`);
      
      const targetRow = targetTable.rows.find(r => r.id === rowId);
      if (!targetRow) throw new Error(`Row ${rowId} not found`);
      
      if (update.category !== undefined) {
        targetRow.category = update.category;
        targetRow.is_placeholder = false;
      }
      if (update.value !== undefined) {
        targetRow.value = Number(update.value);
        targetRow.is_placeholder = false;
      }
      
      const newTotal = targetTable.rows.reduce((sum, r) => sum + r.value, 0);
      targetTable.total = newTotal;
      targetTable.rows.forEach(r => {
        r.percentage = newTotal > 0 ? Number((r.value / newTotal).toFixed(4)) : 0;
      });
      saveLocalFallbackState(state);
      return targetTable;
    }
  },

  async deleteRow(tableId: string, rowId: string): Promise<TableData> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${tableId}/rows/${rowId}`, {
        method: 'DELETE',
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      // Local fallback handler
      const state = getLocalFallbackState();
      const targetTable = state.tables.find(t => t.id === tableId);
      if (!targetTable) throw new Error(`Table ${tableId} not found`);
      
      targetTable.rows = targetTable.rows.filter(r => r.id !== rowId);
      const newTotal = targetTable.rows.reduce((sum, r) => sum + r.value, 0);
      targetTable.total = newTotal;
      targetTable.rows.forEach(r => {
        r.percentage = newTotal > 0 ? Number((r.value / newTotal).toFixed(4)) : 0;
      });
      saveLocalFallbackState(state);
      return targetTable;
    }
  },

  async updateTableMeta(tableId: string, update: TableUpdate): Promise<TableData> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${tableId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.detail || `HTTP ${res.status}`);
      }
      return await res.json();
    } catch (err) {
      const state = getLocalFallbackState();
      const targetTable = state.tables.find(t => t.id === tableId);
      if (!targetTable) throw new Error(`Table ${tableId} not found`);
      
      if (update.title !== undefined) targetTable.title = update.title;
      if (update.subtitle !== undefined) targetTable.subtitle = update.subtitle;
      if (update.category_header !== undefined) targetTable.category_header = update.category_header;
      if (update.value_header !== undefined) targetTable.value_header = update.value_header;
      if (update.chart_type !== undefined) targetTable.chart_type = update.chart_type;
      if (update.chart_color !== undefined) targetTable.chart_color = update.chart_color;
      if (update.description !== undefined) targetTable.description = update.description;
      
      saveLocalFallbackState(state);
      return targetTable;
    }
  },

  async resetTable(tableId: string): Promise<TableData> {
    try {
      const res = await fetch(`${API_BASE_URL}/api/tables/${tableId}/reset`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      const state = getLocalFallbackState();
      const orig = FALLBACK_DASHBOARD_DATA.tables.find(t => t.id === tableId);
      if (!orig) throw new Error(`Default template for ${tableId} not found`);
      
      const idx = state.tables.findIndex(t => t.id === tableId);
      if (idx !== -1) {
        state.tables[idx] = JSON.parse(JSON.stringify(orig));
      }
      saveLocalFallbackState(state);
      return state.tables[idx];
    }
  },

  async uploadExcel(file: File): Promise<{ status: string; message: string }> {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_BASE_URL}/api/upload-excel`, {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Upload failed');
    }
    return await res.json();
  },

  getExportUrl(tableId: string): string {
    return `${API_BASE_URL}/api/export/${tableId}`;
  }
};
