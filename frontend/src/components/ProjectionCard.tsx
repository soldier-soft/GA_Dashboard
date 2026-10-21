import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';
import type { TableData } from '../types/dashboard';
import { AlertCircle } from 'lucide-react';

interface ProjectionCardProps {
  table: TableData;
  onSelectTable?: (tableId: string) => void;
  isSelected?: boolean;
}

const INDUSTRIAL_PALETTE = ['#2563eb', '#0284c7', '#0d9488', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export const ProjectionCard: React.FC<ProjectionCardProps> = ({
  table,
  onSelectTable,
  isSelected
}) => {
  const isDonut = table.chart_type === 'donut' || table.id === 'table-1';
  const isHorizontalBar = table.chart_type === 'bar';

  // Prepare chart data
  const chartData = table.rows.map((row, idx) => ({
    name: row.category,
    value: Number(row.value),
    percentage: row.percentage ? `${(row.percentage * 100).toFixed(1)}%` : '',
    color: table.chart_color || INDUSTRIAL_PALETTE[idx % INDUSTRIAL_PALETTE.length],
    is_placeholder: row.is_placeholder
  }));

  // For Table 1 donut chart, only Completed & In Progress are slices (Total 55 is baseline)
  const donutData = table.id === 'table-1'
    ? table.rows.filter(r => r.id !== 't1-impacted').map(r => ({
        name: r.category.replace(' STATION', ''),
        value: r.value,
        color: r.id === 't1-completed' ? '#10b981' : '#f59e0b'
      }))
    : chartData;

  const totalValue = table.total;

  return (
    <div
      onClick={() => onSelectTable && onSelectTable(table.id)}
      className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden flex flex-col justify-between cursor-pointer ${
        isSelected
          ? 'border-blue-600 ring-2 ring-blue-500/20 shadow-md'
          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
      }`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-slate-200 text-slate-800">
              {table.id.toUpperCase()}
            </span>
            {table.is_excel_source ? (
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                Excel Model
              </span>
            ) : (
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                Configurable Shop Data
              </span>
            )}
          </div>
          <h2 className="text-sm font-bold text-slate-900 mt-1 truncate">
            {table.title}
          </h2>
          <p className="text-[11px] text-slate-500 truncate">
            {table.subtitle || table.description}
          </p>
        </div>

        <div className="text-right">
          <span className="text-[10px] text-slate-500 uppercase font-semibold">Total</span>
          <div className="text-lg font-extrabold text-slate-900 leading-none">
            {table.id === 'table-1' ? table.summary.impacted || 55 : totalValue}
          </div>
          {table.id === 'table-1' && (
            <span className="text-[10px] text-emerald-600 font-bold">
              {table.summary.completion_rate}% done
            </span>
          )}
        </div>
      </div>

      {/* Visual Chart Area */}
      <div className="p-4 h-56 flex items-center justify-center relative">
        {chartData.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 text-xs">
            <AlertCircle className="w-8 h-8 mb-1 stroke-1 text-slate-300" />
            <span>No operational rows configured.</span>
            <span className="text-[10px]">Add categories in the data table below.</span>
          </div>
        ) : isDonut ? (
          /* Doughnut Projection (Table 1: Station Assessment Status) */
          <div className="w-full h-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any, name: any) => [`${val} Stations`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Center readout in donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider text-[10px]">Rate</span>
              <span className="text-xl font-black text-slate-900 leading-none">
                {table.summary.completion_rate ?? 90.9}%
              </span>
              <span className="text-[10px] text-emerald-600 font-medium">Completed</span>
            </div>
          </div>
        ) : isHorizontalBar ? (
          /* Horizontal Bar Projection (Table 4, 5, 7) */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 10, right: 25, left: 10, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
              <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="name"
                width={95}
                tick={{ fontSize: 10, fill: '#334155', fontWeight: 500 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(val: any) => [`${val} Items`, table.value_header]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`bar-${index}`}
                    fill={entry.color}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          /* Vertical Column Projection (Table 2, 3, 6) */
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 15, right: 10, left: -15, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 10, fill: '#475569' }}
                interval={0}
                angle={-15}
                textAnchor="end"
                axisLine={false}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(val: any) => [`${val} Units`, table.value_header]}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', color: '#fff', fontSize: '12px' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell
                    key={`col-${index}`}
                    fill={
                      table.id === 'table-3'
                        ? entry.name.toLowerCase().includes('closed')
                          ? '#10b981'
                          : entry.name.toLowerCase().includes('progress')
                          ? '#f59e0b'
                          : '#2563eb'
                        : entry.color
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer / Quick Breakdown */}
      <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <span className="truncate">
          {table.rows.length} {table.rows.length === 1 ? 'Category' : 'Categories'}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelectTable && onSelectTable(table.id);
          }}
          className="text-blue-600 hover:text-blue-700 font-semibold text-[11px] transition-colors"
        >
          View Table Data →
        </button>
      </div>
    </div>
  );
};
