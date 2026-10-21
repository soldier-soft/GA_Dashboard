import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  RotateCcw,
  Search,
  Lock,
  Sparkles
} from 'lucide-react';
import type { TableData, TableRow, RowCreate, RowUpdate, TableUpdate } from '../types/dashboard';

interface TableDataViewProps {
  table: TableData;
  onAddRow: (tableId: string, row: RowCreate) => Promise<void>;
  onUpdateRow: (tableId: string, rowId: string, update: RowUpdate) => Promise<void>;
  onDeleteRow: (tableId: string, rowId: string) => Promise<void>;
  onUpdateTableMeta: (tableId: string, update: TableUpdate) => Promise<void>;
  onResetTable: (tableId: string) => Promise<void>;
  onExportCsv: (tableId: string) => void;
}

export const TableDataView: React.FC<TableDataViewProps> = ({
  table,
  onAddRow,
  onUpdateRow,
  onDeleteRow,
  onUpdateTableMeta,
  onResetTable,
  onExportCsv
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState('');
  const [newValue, setNewValue] = useState<string>('');

  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [editCategory, setEditCategory] = useState('');
  const [editValue, setEditValue] = useState<string>('');

  const [isEditingMeta, setIsEditingMeta] = useState(false);
  const [metaTitle, setMetaTitle] = useState(table.title);
  const [metaCategoryHeader, setMetaCategoryHeader] = useState(table.category_header);
  const [metaValueHeader, setMetaValueHeader] = useState(table.value_header);
  const [metaChartType, setMetaChartType] = useState(table.chart_type);

  // Filter rows by search term
  const filteredRows = table.rows.filter(r =>
    r.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartAdd = () => {
    setIsAdding(true);
    setNewCategory('');
    setNewValue('');
  };

  const handleSaveAdd = async () => {
    if (!newCategory.trim()) return;
    const val = parseFloat(newValue) || 0;
    await onAddRow(table.id, {
      category: newCategory.trim(),
      value: val,
      is_placeholder: false
    });
    setIsAdding(false);
    setNewCategory('');
    setNewValue('');
  };

  const handleStartEdit = (row: TableRow) => {
    setEditingRowId(row.id);
    setEditCategory(row.category);
    setEditValue(row.value.toString());
  };

  const handleSaveEdit = async (rowId: string) => {
    if (!editCategory.trim()) return;
    const val = parseFloat(editValue) || 0;
    await onUpdateRow(table.id, rowId, {
      category: editCategory.trim(),
      value: val
    });
    setEditingRowId(null);
  };

  const handleSaveMeta = async () => {
    await onUpdateTableMeta(table.id, {
      title: metaTitle,
      category_header: metaCategoryHeader,
      value_header: metaValueHeader,
      chart_type: metaChartType
    });
    setIsEditingMeta(false);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-sm overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-slate-50/70">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-200 text-slate-800">
                {table.id.toUpperCase()}
              </span>
              {table.is_excel_source ? (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  <Lock className="w-3 h-3" />
                  <span>Authoritative Excel Model</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 text-xs font-semibold px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                  <Sparkles className="w-3 h-3" />
                  <span>Configurable Shop Projection</span>
                </span>
              )}
            </div>

            {isEditingMeta ? (
              <div className="mt-2 space-y-2">
                <input
                  type="text"
                  value={metaTitle}
                  onChange={e => setMetaTitle(e.target.value)}
                  className="w-full text-base font-bold border border-blue-400 rounded px-2 py-1 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
                />
                <div className="flex flex-wrap gap-2 text-xs">
                  <input
                    type="text"
                    value={metaCategoryHeader}
                    placeholder="Category Header"
                    onChange={e => setMetaCategoryHeader(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1"
                  />
                  <input
                    type="text"
                    value={metaValueHeader}
                    placeholder="Value Header"
                    onChange={e => setMetaValueHeader(e.target.value)}
                    className="border border-slate-300 rounded px-2 py-1"
                  />
                  <select
                    value={metaChartType}
                    onChange={e => setMetaChartType(e.target.value as any)}
                    className="border border-slate-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="bar">Horizontal Bar Chart</option>
                    <option value="column">Vertical Column Chart</option>
                    <option value="donut">Donut Chart</option>
                  </select>
                  <button
                    onClick={handleSaveMeta}
                    className="px-2 py-1 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                  >
                    Save Settings
                  </button>
                  <button
                    onClick={() => setIsEditingMeta(false)}
                    className="px-2 py-1 rounded bg-slate-200 text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-base font-bold text-slate-900 mt-1 flex items-center space-x-2">
                  <span>{table.title}</span>
                  {table.is_editable && (
                    <button
                      onClick={() => {
                        setIsEditingMeta(true);
                        setMetaTitle(table.title);
                        setMetaCategoryHeader(table.category_header);
                        setMetaValueHeader(table.value_header);
                        setMetaChartType(table.chart_type);
                      }}
                      className="text-slate-400 hover:text-blue-600 p-0.5 rounded"
                      title="Edit table title, headers and chart type"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {table.subtitle || table.description}
                </p>
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Table Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Filter categories..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="text-xs pl-8 pr-3 py-1.5 rounded-md border border-slate-200 bg-white focus:outline-hidden focus:ring-1 focus:ring-blue-500 w-36 sm:w-44"
              />
            </div>

            {/* Add Row Button (For Custom Tables 5-7) */}
            {table.is_editable && (
              <button
                onClick={handleStartAdd}
                className="flex items-center space-x-1 text-xs font-semibold px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            )}

            {/* Reset to Default Template */}
            {table.is_editable && (
              <button
                onClick={() => {
                  if (confirm(`Reset ${table.title} to standard template placeholders?`)) {
                    onResetTable(table.id);
                  }
                }}
                title="Reset table to default template placeholders"
                className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}

            {/* CSV Export */}
            <button
              onClick={() => onExportCsv(table.id)}
              title="Export table data to CSV"
              className="flex items-center space-x-1 text-xs font-medium px-2.5 py-1.5 rounded-md bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>CSV</span>
            </button>
          </div>

        </div>
      </div>

      {/* Table Data Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">{table.category_header}</th>
              <th className="py-2.5 px-4 text-right">{table.value_header}</th>
              <th className="py-2.5 px-4 text-right">Percentage</th>
              {table.is_excel_source && (
                <th className="py-2.5 px-4 text-center">Excel Formula / Ref</th>
              )}
              {table.is_editable && (
                <th className="py-2.5 px-4 text-center w-24">Actions</th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs">
            {/* Adding Row Form */}
            {isAdding && (
              <tr className="bg-blue-50/60 border-b border-blue-200">
                <td className="py-2 px-4 text-center text-blue-600 font-bold">+</td>
                <td className="py-2 px-4">
                  <input
                    type="text"
                    placeholder="Enter category name..."
                    value={newCategory}
                    autoFocus
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full px-2 py-1 text-xs rounded border border-blue-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </td>
                <td className="py-2 px-4 text-right">
                  <input
                    type="number"
                    placeholder="Value"
                    value={newValue}
                    onChange={e => setNewValue(e.target.value)}
                    className="w-24 px-2 py-1 text-xs text-right rounded border border-blue-300 focus:outline-hidden focus:ring-1 focus:ring-blue-500 bg-white"
                  />
                </td>
                <td className="py-2 px-4 text-right text-slate-400 font-mono italic">
                  auto
                </td>
                <td className="py-2 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={handleSaveAdd}
                      className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      title="Save row"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                      title="Cancel"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            )}

            {filteredRows.length === 0 ? (
              <tr>
                <td
                  colSpan={table.is_excel_source ? 5 : 5}
                  className="py-8 text-center text-slate-400 text-xs italic"
                >
                  {searchTerm
                    ? `No categories matching "${searchTerm}"`
                    : 'No data rows available in this table. Click "Add Row" to create operational categories.'}
                </td>
              </tr>
            ) : (
              filteredRows.map((row, index) => {
                const isEditing = editingRowId === row.id;

                return (
                  <tr
                    key={row.id}
                    className="hover:bg-slate-50/60 transition-colors group"
                  >
                    <td className="py-2.5 px-4 text-center font-mono text-slate-400 text-[11px]">
                      {index + 1}
                    </td>

                    {/* Category Column */}
                    <td className="py-2.5 px-4 font-medium text-slate-900">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editCategory}
                          onChange={e => setEditCategory(e.target.value)}
                          className="w-full px-2 py-1 text-xs border border-blue-400 rounded focus:outline-hidden"
                        />
                      ) : (
                        <div className="flex items-center space-x-2">
                          <span>{row.category}</span>
                          {row.is_placeholder && (
                            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                              Sample Placeholder
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    {/* Value Column */}
                    <td className="py-2.5 px-4 text-right font-mono font-semibold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          className="w-24 px-2 py-1 text-xs text-right border border-blue-400 rounded focus:outline-hidden"
                        />
                      ) : (
                        row.value
                      )}
                    </td>

                    {/* Percentage Column */}
                    <td className="py-2.5 px-4 text-right font-mono text-slate-600">
                      {row.percentage !== undefined
                        ? `${(row.percentage * 100).toFixed(1)}%`
                        : '-'}
                    </td>

                    {/* Excel Formula / Cell Ref (For Tables 1-4) */}
                    {table.is_excel_source && (
                      <td className="py-2.5 px-4 text-center font-mono text-[11px] text-blue-700">
                        {row.excel_formula ? (
                          <span
                            title={`Calculated in Excel: ${row.excel_formula}`}
                            className="px-1.5 py-0.5 rounded bg-blue-50 border border-blue-200"
                          >
                            {row.excel_formula}
                          </span>
                        ) : row.excel_cell_ref ? (
                          <span className="text-slate-500">
                            {row.excel_cell_ref}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    )}

                    {/* Editable Controls (For Tables 5-7) */}
                    {table.is_editable && (
                      <td className="py-2.5 px-4 text-center">
                        {isEditing ? (
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => handleSaveEdit(row.id)}
                              className="p-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                              title="Save"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingRowId(null)}
                              className="p-1 rounded bg-slate-200 text-slate-600 hover:bg-slate-300"
                              title="Cancel"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleStartEdit(row)}
                              className="p-1 rounded text-slate-500 hover:text-blue-600 hover:bg-slate-100"
                              title="Edit row"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete "${row.category}" from ${table.title}?`)) {
                                  onDeleteRow(table.id, row.id);
                                }
                              }}
                              className="p-1 rounded text-slate-500 hover:text-rose-600 hover:bg-rose-50"
                              title="Delete row"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>

          {/* Table Footer with Calculated Totals */}
          <tfoot>
            <tr className="bg-slate-50 font-bold text-slate-900 border-t border-slate-200 text-xs">
              <td className="py-3 px-4 text-center font-mono">Σ</td>
              <td className="py-3 px-4 uppercase tracking-wide">
                Total / Baseline
              </td>
              <td className="py-3 px-4 text-right font-mono text-sm">
                {table.id === 'table-1' ? table.summary.impacted || 55 : table.total}
              </td>
              <td className="py-3 px-4 text-right font-mono">
                {table.id === 'table-1'
                  ? `${table.summary.completion_rate ?? 90.9}%`
                  : '100.0%'}
              </td>
              {table.is_excel_source && (
                <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-500">
                  {table.id === 'table-1' ? '=IFERROR(Data!B6/Data!B5,0)' : 'Data sheet'}
                </td>
              )}
              {table.is_editable && <td className="py-3 px-4"></td>}
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
