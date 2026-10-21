import React from 'react';
import { Cloud, X, ExternalLink, ShieldCheck, CheckCircle2, Key } from 'lucide-react';
import type { SourceStatus } from '../types/dashboard';

interface CloudSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  sourceStatus?: SourceStatus;
}

export const CloudSyncModal: React.FC<CloudSyncModalProps> = ({
  isOpen,
  onClose,
  sourceStatus
}) => {
  if (!isOpen) return null;

  const onedriveLink =
    sourceStatus?.onedrive_link ||
    'https://1drv.ms/x/c/6e343e4ed189eaf3/IQD8Y2ntB6CWSJyhBbRFmJaMAYGy5YwQiXxAgPiyZJOJqSE?e=NTegEw';

  const isGraphConfigured = sourceStatus?.source_type === 'graph_onedrive';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <Cloud className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              OneDrive / Microsoft Graph Cloud Sync
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* Current Status Box */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-500 text-[10px]">
                Active Data Source
              </span>
              <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded text-[11px] font-semibold ${
                isGraphConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
              }`}>
                {isGraphConfigured ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Microsoft Graph Connected</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-3 h-3 text-blue-600" />
                    <span>Local Authoritative Excel (Active)</span>
                  </>
                )}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1">
              <div>
                <span className="text-slate-400">Workbook File:</span>
                <p className="font-mono font-semibold text-slate-800 truncate">
                  {sourceStatus?.file_name || 'Station_Assessment_Dashboard.xlsx'}
                </p>
              </div>
              <div>
                <span className="text-slate-400">Last Synchronized:</span>
                <p className="font-mono text-slate-800">
                  {sourceStatus?.last_synced || 'Just now'}
                </p>
              </div>
            </div>

            <p className="text-slate-600 text-[11px] pt-1">
              {sourceStatus?.message}
            </p>
          </div>

          {/* Public OneDrive Workbook Link */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Shared OneDrive Web Link
            </label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                readOnly
                value={onedriveLink}
                className="w-full text-xs font-mono px-3 py-1.5 rounded border border-slate-200 bg-slate-50 text-slate-600"
              />
              <a
                href={onedriveLink}
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white flex items-center space-x-1 shrink-0 font-medium"
              >
                <span>Open</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Microsoft Graph API Configuration Instructions */}
          <div className="p-3.5 rounded-lg bg-blue-50/70 border border-blue-200 text-blue-900 space-y-2">
            <div className="flex items-center space-x-1.5 font-bold text-xs text-blue-950">
              <Key className="w-4 h-4 text-blue-700" />
              <span>How to Configure Direct Cloud Sync</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800">
              For enterprise production deployment on Render, configure the following environment variables in the backend:
            </p>
            <div className="bg-slate-900 text-slate-200 p-2.5 rounded font-mono text-[10px] space-y-1">
              <div>MICROSOFT_TENANT_ID=your-tenant-uuid</div>
              <div>MICROSOFT_CLIENT_ID=your-app-client-id</div>
              <div>MICROSOFT_CLIENT_SECRET=your-client-secret</div>
              <div>ONEDRIVE_ITEM_ID=your-onedrive-driveitem-id</div>
            </div>
            <p className="text-[10px] text-blue-700">
              * Per security requirements, Microsoft secrets are never stored or exposed in the frontend.
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-md bg-slate-800 text-white font-medium hover:bg-slate-700"
            >
              Done
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
