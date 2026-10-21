import React from 'react';
import {
  RefreshCw,
  Upload,
  Cloud,
  Printer,
  Clock
} from 'lucide-react';
import type { SourceStatus } from '../types/dashboard';

interface HeaderProps {
  sourceStatus?: SourceStatus;
  lastRefresh: string;
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenUpload: () => void;
  onOpenCloudSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  sourceStatus,
  lastRefresh,
  isRefreshing,
  onRefresh,
  onOpenUpload,
  onOpenCloudSettings
}) => {
  const isCloud = sourceStatus?.source_type === 'graph_onedrive';

  return (
    <header className="bg-[#0b1528] text-white border-b border-slate-800 shadow-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          
          {/* Brand & Identity */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-blue-600 text-white font-bold tracking-wider shadow-inner">
              ST
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase">
                  Stellantis <span className="text-slate-400 font-normal">|</span> General Assembly Shop
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-900/60 text-blue-200 border border-blue-700/50">
                  ASSESSMENT DASHBOARD
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Station Assessment & Operations Control • 7 Tables & Projections Model
              </p>
            </div>
          </div>

          {/* Connection Status & Action Controls */}
          <div className="flex items-center space-x-3">
            {/* Sync Status Badge */}
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-md bg-slate-900/80 border border-slate-700/60 text-xs">
              <span className={`w-2 h-2 rounded-full ${sourceStatus?.is_connected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="text-slate-300 font-medium">
                {isCloud ? 'OneDrive Cloud Synced' : 'Excel Model Connected'}
              </span>
              <span className="text-slate-500">|</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 font-mono text-[11px]">
                {lastRefresh ? lastRefresh.slice(-8) : '--:--:--'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh dashboard data from Excel/OneDrive source"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Upload Excel Modal Trigger */}
            <button
              onClick={onOpenUpload}
              title="Upload new Excel workbook (.xlsx)"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Upload Excel</span>
            </button>

            {/* Cloud Settings Trigger */}
            <button
              onClick={onOpenCloudSettings}
              title="Configure Microsoft Graph API & Cloud Sync"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 hover:bg-blue-500 text-white transition-colors shadow-sm"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Cloud Source</span>
            </button>

            {/* Print / PDF Trigger */}
            <button
              onClick={() => window.print()}
              title="Print / Save PDF Dashboard Report"
              className="p-1.5 rounded-md text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
