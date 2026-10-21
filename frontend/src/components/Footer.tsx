import React from 'react';
import { Database, Server, Globe } from 'lucide-react';
import type { SourceStatus } from '../types/dashboard';

interface FooterProps {
  sourceStatus?: SourceStatus;
  lastRefresh?: string;
}

export const Footer: React.FC<FooterProps> = ({ sourceStatus, lastRefresh }) => {
  return (
    <footer className="mt-12 border-t border-slate-200 bg-white py-6 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-6 h-6 rounded bg-slate-900 text-white font-bold text-[10px]">
              ST
            </div>
            <div>
              <p className="font-semibold text-slate-800">
                Stellantis | General Assembly Shop Operations Control
              </p>
              <p className="text-[11px] text-slate-500">
                LHD Assessment Model • 7 Independent Tables & Synchronized Visual Projections
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[11px]">
            <div className="flex items-center space-x-1.5 text-slate-600">
              <Database className="w-3.5 h-3.5 text-blue-600" />
              <span>Source: <strong className="font-mono text-slate-800">{sourceStatus?.file_name || 'Station_Assessment_Dashboard.xlsx'}</strong></span>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-600">
              <Server className="w-3.5 h-3.5 text-purple-600" />
              <span>Backend: FastAPI (Python 3.11)</span>
            </div>

            <div className="flex items-center space-x-1.5 text-slate-600">
              <Globe className="w-3.5 h-3.5 text-emerald-600" />
              <span>Frontend: React + Vite + Tailwind</span>
            </div>
          </div>

          <div className="text-[11px] text-slate-400">
            Last Sync: <span className="font-mono text-slate-700">{lastRefresh || 'Active'}</span>
          </div>

        </div>
      </div>
    </footer>
  );
};
