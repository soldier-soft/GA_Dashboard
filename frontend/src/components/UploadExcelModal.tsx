import React, { useState } from 'react';
import { Upload, X, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';

interface UploadExcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => Promise<{ status: string; message: string }>;
  onSuccess: () => void;
}

export const UploadExcelModal: React.FC<UploadExcelModalProps> = ({
  isOpen,
  onClose,
  onUpload,
  onSuccess
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xlsm')) {
        setErrorMessage('Please select a valid Excel workbook file (.xlsx or .xlsm)');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setErrorMessage(null);
      setStatusMessage(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setErrorMessage(null);
    setStatusMessage(null);

    try {
      const res = await onUpload(selectedFile);
      setStatusMessage(res.message || 'Excel workbook uploaded and synced successfully!');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload and validate Excel file');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center space-x-2">
            <FileSpreadsheet className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-slate-900 text-sm">
              Upload Updated Excel Workbook
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs">
          <p className="text-slate-600 leading-relaxed">
            Upload an updated <strong>Station Assessment Dashboard</strong> Excel file. The backend will validate worksheet structures (<code>Data</code>, <code>Dashboard</code>), extract formulas, and update Tables 1–4.
          </p>

          <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors bg-slate-50/50">
            <input
              type="file"
              id="excel-file-input"
              accept=".xlsx,.xlsm"
              onChange={handleFileChange}
              className="hidden"
            />
            <label
              htmlFor="excel-file-input"
              className="cursor-pointer flex flex-col items-center justify-center space-y-2"
            >
              <Upload className="w-8 h-8 text-slate-400 stroke-1" />
              <span className="font-semibold text-blue-600 hover:underline">
                {selectedFile ? selectedFile.name : 'Choose an Excel file (.xlsx)'}
              </span>
              <span className="text-[11px] text-slate-400">
                {selectedFile
                  ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                  : 'or drag and drop here'}
              </span>
            </label>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-md bg-rose-50 border border-rose-200 text-rose-700 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {statusMessage && (
            <div className="p-3 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{statusMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-md border border-slate-200 text-slate-700 hover:bg-slate-100 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!selectedFile || isUploading}
              className="px-4 py-1.5 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              {isUploading ? 'Validating & Uploading...' : 'Upload & Sync'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
