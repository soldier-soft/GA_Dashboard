import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Table as TableIcon,
  BarChart3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Header } from './components/Header';
import { KPIRibbon } from './components/KPIRibbon';
import { DiscrepancyBanner } from './components/DiscrepancyBanner';
import { ProjectionCard } from './components/ProjectionCard';
import { TableDataView } from './components/TableDataView';
import { UploadExcelModal } from './components/UploadExcelModal';
import { CloudSyncModal } from './components/CloudSyncModal';
import { Footer } from './components/Footer';

import type {
  DashboardResponse,
  RowCreate,
  RowUpdate,
  TableUpdate
} from './types/dashboard';
import { apiService } from './services/api';
import { FALLBACK_DASHBOARD_DATA } from './data/fallbackData';

export const App: React.FC = () => {
  const [data, setData] = useState<DashboardResponse>(FALLBACK_DASHBOARD_DATA);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Selection and filtering state
  const [selectedTableId, setSelectedTableId] = useState<string>('table-1');
  const [filterMode, setFilterMode] = useState<'all' | 'excel' | 'custom'>('all');
  const [globalSearch, setGlobalSearch] = useState<string>('');

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isCloudOpen, setIsCloudOpen] = useState<boolean>(false);

  // Notification / toast
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Fetch dashboard data
  const loadDashboard = useCallback(async (quiet = false) => {
    if (!quiet) setIsRefreshing(true);
    try {
      const resp = await apiService.getDashboard();
      setData(resp);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
    // Auto-refresh interval (every 60 seconds)
    const interval = setInterval(() => {
      loadDashboard(true);
    }, 60000);
    return () => clearInterval(interval);
  }, [loadDashboard]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const resp = await apiService.triggerRefresh();
      setData(resp);
      showToast('Dashboard refreshed from authoritative source!');
    } catch (err: any) {
      showToast('Refresh encountered an error, retained cached data', 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  // Row CRUD operations
  const handleAddRow = async (tableId: string, row: RowCreate) => {
    try {
      const updatedTable = await apiService.addRow(tableId, row);
      setData(prev => ({
        ...prev,
        tables: prev.tables.map(t => t.id === tableId ? updatedTable : t)
      }));
      showToast(`Added row to ${updatedTable.title}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to add row', 'error');
    }
  };

  const handleUpdateRow = async (tableId: string, rowId: string, update: RowUpdate) => {
    try {
      const updatedTable = await apiService.updateRow(tableId, rowId, update);
      setData(prev => ({
        ...prev,
        tables: prev.tables.map(t => t.id === tableId ? updatedTable : t)
      }));
      showToast(`Updated row in ${updatedTable.title}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update row', 'error');
    }
  };

  const handleDeleteRow = async (tableId: string, rowId: string) => {
    try {
      const updatedTable = await apiService.deleteRow(tableId, rowId);
      setData(prev => ({
        ...prev,
        tables: prev.tables.map(t => t.id === tableId ? updatedTable : t)
      }));
      showToast(`Deleted row from ${updatedTable.title}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to delete row', 'error');
    }
  };

  const handleUpdateTableMeta = async (tableId: string, update: TableUpdate) => {
    try {
      const updatedTable = await apiService.updateTableMeta(tableId, update);
      setData(prev => ({
        ...prev,
        tables: prev.tables.map(t => t.id === tableId ? updatedTable : t)
      }));
      showToast(`Updated settings for ${updatedTable.title}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to update table settings', 'error');
    }
  };

  const handleResetTable = async (tableId: string) => {
    try {
      const updatedTable = await apiService.resetTable(tableId);
      setData(prev => ({
        ...prev,
        tables: prev.tables.map(t => t.id === tableId ? updatedTable : t)
      }));
      showToast(`Reset ${updatedTable.title} to template placeholders`);
    } catch (err: any) {
      showToast(err.message || 'Failed to reset table', 'error');
    }
  };

  const handleExportCsv = (tableId: string) => {
    const table = data.tables.find(t => t.id === tableId);
    if (!table) return;

    const headers = [table.category_header, table.value_header, 'Percentage'];
    const rows = table.rows.map(r => [
      `"${r.category.replace(/"/g, '""')}"`,
      r.value,
      r.percentage ? `${(r.percentage * 100).toFixed(2)}%` : ''
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${table.id}_${table.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${table.title} to CSV`);
  };

  // Filter tables for projection view
  const visibleTables = data.tables.filter(table => {
    if (filterMode === 'excel') return table.is_excel_source;
    if (filterMode === 'custom') return !table.is_excel_source;
    return true;
  }).filter(table => {
    if (!globalSearch.trim()) return true;
    const query = globalSearch.toLowerCase();
    const titleMatch = table.title.toLowerCase().includes(query);
    const rowMatch = table.rows.some(r => r.category.toLowerCase().includes(query));
    return titleMatch || rowMatch;
  });

  const selectedTable = data.tables.find(t => t.id === selectedTableId) || data.tables[0];

  return (
    <div className="min-h-screen bg-slate-100/70 flex flex-col">
      {/* Header */}
      <Header
        sourceStatus={data.source_status}
        lastRefresh={data.last_refresh}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenCloudSettings={() => setIsCloudOpen(true)}
      />

      {/* Main Dashboard Canvas */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 grow w-full">
        
        {/* KPI Ribbon */}
        <KPIRibbon kpis={data.kpis} />

        {/* Data Quality & Discrepancy Banner */}
        <DiscrepancyBanner
          discrepancies={data.discrepancies}
          qualityScore={data.data_quality_score}
        />

        {/* Projections Section Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Operational Projections (7 Visual Dashboards)</span>
            </h2>
            <p className="text-xs text-slate-500">
              Tables 1–4 sourced from Excel • Tables 5–7 following Table 4 template pattern
            </p>
          </div>

          {/* Filters & Search */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Filter Toggle */}
            <div className="flex items-center p-0.5 rounded-lg bg-slate-200/80 border border-slate-300/80 text-xs font-semibold text-slate-600">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
              >
                All 7 Projections
              </button>
              <button
                onClick={() => setFilterMode('excel')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'excel' ? 'bg-white text-blue-700 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Excel Models (1–4)
              </button>
              <button
                onClick={() => setFilterMode('custom')}
                className={`px-2.5 py-1 rounded-md transition-colors ${filterMode === 'custom' ? 'bg-white text-purple-700 shadow-xs' : 'hover:text-slate-900'}`}
              >
                Configurable (5–7)
              </button>
            </div>

            {/* Global Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search projections..."
                value={globalSearch}
                onChange={e => setGlobalSearch(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-300 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-36 sm:w-48"
              />
            </div>
          </div>
        </div>

        {/* 7 Projection Visual Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {visibleTables.map(table => (
            <ProjectionCard
              key={table.id}
              table={table}
              isSelected={selectedTableId === table.id}
              onSelectTable={tid => {
                setSelectedTableId(tid);
                // Smooth scroll to table detail
                const elem = document.getElementById('table-detail-section');
                if (elem) elem.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          ))}
        </div>

        {/* Detailed Table View Section */}
        <div id="table-detail-section" className="pt-2">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center space-x-2">
                <TableIcon className="w-5 h-5 text-blue-600" />
                <span>Detailed Data-Table Inspector</span>
              </h2>
              <p className="text-xs text-slate-500">
                Inspect raw cell formulas, add/edit categories, and export table datasets
              </p>
            </div>
          </div>

          {/* Table Tab Navigation */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-3 border-b border-slate-200">
            {data.tables.map(t => (
              <button
                key={t.id}
                onClick={() => setSelectedTableId(t.id)}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-1.5 ${
                  selectedTableId === t.id
                    ? 'bg-white border-t-2 border-x border-blue-600 text-blue-700 shadow-xs'
                    : 'bg-slate-200/60 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
              >
                <span className="font-mono text-[10px] opacity-75">{t.id.replace('table-', 'T')}</span>
                <span className="truncate max-w-[150px]">{t.title.replace(/Table \d+ — /, '')}</span>
                {t.is_excel_source ? (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                )}
              </button>
            ))}
          </div>

          {/* Active Table Data View */}
          {selectedTable && (
            <TableDataView
              table={selectedTable}
              onAddRow={handleAddRow}
              onUpdateRow={handleUpdateRow}
              onDeleteRow={handleDeleteRow}
              onUpdateTableMeta={handleUpdateTableMeta}
              onResetTable={handleResetTable}
              onExportCsv={handleExportCsv}
            />
          )}
        </div>

      </main>

      {/* Modals */}
      <UploadExcelModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUpload={apiService.uploadExcel}
        onSuccess={() => {
          loadDashboard(true);
          showToast('Excel workbook synchronized successfully!');
        }}
      />

      <CloudSyncModal
        isOpen={isCloudOpen}
        onClose={() => setIsCloudOpen(false)}
        sourceStatus={data.source_status}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 px-4 py-2.5 rounded-lg shadow-lg text-xs font-semibold flex items-center space-x-2 transition-all ${
          toastMessage.type === 'error'
            ? 'bg-rose-600 text-white'
            : 'bg-slate-900 text-white border border-slate-700'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-200" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Footer */}
      <Footer
        sourceStatus={data.source_status}
        lastRefresh={data.last_refresh}
      />
    </div>
  );
};

export default App;
