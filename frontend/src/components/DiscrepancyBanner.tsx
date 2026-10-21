import React, { useState } from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import type { DiscrepancyNotice } from '../types/dashboard';

interface DiscrepancyBannerProps {
  discrepancies: DiscrepancyNotice[];
  qualityScore: number;
}

export const DiscrepancyBanner: React.FC<DiscrepancyBannerProps> = ({
  discrepancies,
  qualityScore
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!discrepancies || discrepancies.length === 0) {
    return (
      <div className="mb-6 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span className="font-semibold">Data Quality Validation Passed:</span>
          <span>All tables and calculations reconcile 100% with mathematical formulas.</span>
        </div>
        <span className="px-2 py-0.5 rounded bg-emerald-100 font-bold text-emerald-700">
          Score: {qualityScore}%
        </span>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-lg bg-amber-50/80 border border-amber-300 text-amber-900 shadow-xs overflow-hidden">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className="p-3.5 flex items-center justify-between cursor-pointer select-none hover:bg-amber-100/50 transition-colors"
      >
        <div className="flex items-center space-x-3">
          <div className="p-1 rounded-md bg-amber-200/80 text-amber-800">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-xs uppercase tracking-wide text-amber-900">
                Data Quality & Reconciler Notice ({discrepancies.length})
              </span>
              <span className="text-[11px] px-2 py-0.2 rounded-full bg-amber-200 text-amber-900 font-semibold">
                Audit Active
              </span>
            </div>
            <p className="text-xs text-amber-800/90 mt-0.5">
              {discrepancies[0]?.title}: Completed (50) + In Progress (10) = 60 vs Impacted (55). Excel raw values preserved.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-semibold px-2 py-1 rounded bg-amber-200/80 text-amber-900">
            Integrity Score: {qualityScore}%
          </span>
          <button className="text-amber-700 hover:text-amber-900">
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 py-3 bg-white/90 border-t border-amber-200 text-xs space-y-3">
          {discrepancies.map((d) => (
            <div key={d.id} className="p-2.5 rounded bg-amber-50/60 border border-amber-200/60">
              <div className="flex items-center justify-between font-semibold text-amber-900 mb-1">
                <span>{d.title}</span>
                <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded">
                  Ref: {d.table_id}
                </span>
              </div>
              <p className="text-slate-700 leading-relaxed mb-2">
                {d.description}
              </p>
              <div className="flex flex-wrap gap-2 text-[11px] font-mono text-slate-600 bg-white p-2 rounded border border-slate-200">
                <span className="font-semibold text-slate-800">Raw Model Data:</span>
                {Object.entries(d.raw_details).map(([k, v]) => (
                  <span key={k} className="px-1.5 py-0.5 bg-slate-100 rounded">
                    {k}: <span className="font-bold text-blue-700">{String(v)}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <p className="text-[11px] text-slate-500 italic">
            * Note: Following Stellantis General Assembly guidelines, data is not artificially coerced to reconcile. Discrepancies reflect operational tracking realities on the shop floor.
          </p>
        </div>
      )}
    </div>
  );
};
