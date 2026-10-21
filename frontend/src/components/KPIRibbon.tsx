import React from 'react';
import {
  Layers,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  ShieldAlert,
  ClipboardList
} from 'lucide-react';
import type { KPIItem } from '../types/dashboard';

interface KPIRibbonProps {
  kpis: KPIItem[];
}

export const KPIRibbon: React.FC<KPIRibbonProps> = ({ kpis }) => {
  const getIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Layers': return <Layers className="w-5 h-5 text-blue-600" />;
      case 'CheckCircle2': return <CheckCircle2 className="w-5 h-5 text-emerald-600" />;
      case 'Clock': return <Clock className="w-5 h-5 text-amber-500" />;
      case 'TrendingUp': return <TrendingUp className="w-5 h-5 text-indigo-600" />;
      case 'Activity': return <Activity className="w-5 h-5 text-sky-600" />;
      case 'ShieldAlert': return <ShieldAlert className="w-5 h-5 text-rose-500" />;
      case 'ClipboardList': return <ClipboardList className="w-5 h-5 text-amber-600" />;
      default: return <Activity className="w-5 h-5 text-slate-500" />;
    }
  };

  const getStatusBorder = (status: string) => {
    switch (status) {
      case 'success': return 'border-l-4 border-l-emerald-500';
      case 'warning': return 'border-l-4 border-l-amber-500';
      case 'info': return 'border-l-4 border-l-blue-500';
      default: return 'border-l-4 border-l-slate-400';
    }
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 mb-6">
      {kpis.map((kpi) => (
        <div
          key={kpi.id}
          className={`bg-white rounded-lg p-3.5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow ${getStatusBorder(kpi.status)}`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-500 truncate">
              {kpi.label}
            </span>
            <div className="p-1.5 rounded-md bg-slate-50">
              {getIcon(kpi.icon)}
            </div>
          </div>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-bold tracking-tight text-slate-900">
              {kpi.formatted}
            </span>
          </div>
          {kpi.subtext && (
            <p className="mt-1 text-[11px] text-slate-500 truncate">
              {kpi.subtext}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};
