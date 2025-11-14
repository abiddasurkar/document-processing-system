// ============================================
// 3. DocumentUpload.js
// ============================================
import React from 'react';
import { Upload, Trash2, ChevronRight, Loader2, FileText } from 'lucide-react';

export default function DocumentUpload({
  documents,
  processing,
  progressText,
  selectedDoc,
  onFileUpload,
  onDocumentSelect,
  onDocumentDelete,
  onChatClear,
  isMobile = false
}) {
  const handleDocumentClick = (doc) => {
    onDocumentSelect(doc);
    onChatClear();
  };

  const handleFileChange = (e) => {
    onFileUpload(e);
  };

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'p-4' : 'p-6'}`}>
      {/* Upload Section */}
      <div className={`${isMobile ? 'mb-6' : 'mb-8'}`}>
        <h2 className={`font-bold text-white ${isMobile ? 'text-lg mb-2' : 'text-2xl mb-4'}`}>
          Upload Documents
        </h2>
        <p className="text-slate-400 text-sm">PDF files only</p>
      </div>

      {/* Drop Zone */}
      <label className="cursor-pointer flex-1 flex flex-col mb-6 group">
        <input
          type="file"
          multiple
          accept=".pdf"
          onChange={handleFileChange}
          className="hidden"
          disabled={processing}
        />
        <div className="flex-1 border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-all duration-300 hover:bg-blue-500/5 group flex flex-col items-center justify-center">
          {processing ? (
            <div className="flex flex-col items-center space-y-3">
              <Loader2 className="w-10 h-10 lg:w-12 lg:h-12 text-blue-500 animate-spin" />
              <div>
                <p className="text-white text-sm font-semibold">Processing...</p>
                {progressText && (
                  <p className="text-blue-400 text-xs mt-2 font-medium line-clamp-2">
                    {progressText}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-3">
              <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-xl group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition">
                <Upload className="w-8 h-8 lg:w-10 lg:h-10 text-blue-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold">Drop PDFs here</p>
                <p className="text-slate-400 text-xs mt-1">
                  {isMobile ? 'or tap to upload' : 'or click to upload'}
                </p>
              </div>
            </div>
          )}
        </div>
      </label>

      {/* Documents List */}
      <div className="border-t border-slate-700/50 pt-6 flex-1 overflow-y-auto">
        <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
          Processed ({documents.length})
        </h3>
        <div className="space-y-2">
          {documents.map(doc => (
            <div
              key={doc.id}
              onClick={() => handleDocumentClick(doc)}
              className={`group bg-slate-800/40 backdrop-blur-sm border-2 rounded-xl p-3 cursor-pointer transition-all duration-300 ${
                selectedDoc?.id === doc.id
                  ? 'border-blue-500 bg-slate-800/60 shadow-lg shadow-blue-500/20'
                  : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className={`${doc.bg} p-2 rounded-lg text-lg flex-shrink-0`}>
                  {doc.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-semibold truncate">{doc.name}</p>
                  <p className="text-slate-400 text-xs">{doc.type} • {doc.size}</p>
                </div>
                <div className="flex items-center space-x-1 flex-shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDocumentDelete(doc.id);
                    }}
                    className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-red-400" />
                  </button>
                  <ChevronRight className="w-4 h-4 text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>
          ))}
          {documents.length === 0 && (
            <div className="text-center py-8">
              <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
              <p className="text-slate-500 text-xs">No documents yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
