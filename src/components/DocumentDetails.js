import React, { useState } from 'react';
import { Eye, X, Copy, Download, FileText, BarChart3 } from 'lucide-react';

export default function DocumentDetails({
  selectedDoc,
  isMobile = false,
  onBack
}) {
  const [activeTab, setActiveTab] = useState('overview');

  const getConfidenceBadge = (confidence) => {
    const conf = parseFloat(confidence) * 100;
    if (conf >= 90) return { label: 'Excellent', color: 'bg-emerald-500/20 text-emerald-400', bar: 'bg-emerald-500' };
    if (conf >= 75) return { label: 'Good', color: 'bg-blue-500/20 text-blue-400', bar: 'bg-blue-500' };
    if (conf >= 60) return { label: 'Fair', color: 'bg-amber-500/20 text-amber-400', bar: 'bg-amber-500' };
    return { label: 'Low', color: 'bg-red-500/20 text-red-400', bar: 'bg-red-500' };
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  if (isMobile) {
    return (
      <div className="flex flex-col h-full bg-slate-900/50">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 flex-shrink-0">
          <h3 className="text-lg font-bold text-white">Details</h3>
          <button
            onClick={onBack}
            className="p-1.5 hover:bg-slate-800/50 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {selectedDoc ? (
          <>
            {/* Tabs */}
            <div className="flex border-b border-slate-700/50 bg-slate-900/30 flex-shrink-0 overflow-x-auto">
              <button
                onClick={() => setActiveTab('overview')}
                className={`flex-1 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'overview'
                    ? 'text-blue-400 border-b-2 border-blue-500'
                    : 'text-slate-400 border-b-2 border-transparent hover:text-slate-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab('data')}
                className={`flex-1 px-4 py-3 text-sm font-semibold whitespace-nowrap transition-all ${
                  activeTab === 'data'
                    ? 'text-blue-400 border-b-2 border-blue-500'
                    : 'text-slate-400 border-b-2 border-transparent hover:text-slate-300'
                }`}
              >
                Extracted Data
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {activeTab === 'overview' && (
                <div className="space-y-4">
                  {/* Header Card */}
                  <div className={`bg-gradient-to-br ${selectedDoc.color} rounded-xl p-4 text-white`}>
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-4xl">{selectedDoc.icon}</span>
                      <span className="px-2 py-1 rounded text-xs font-bold bg-white/20">
                        {selectedDoc.type}
                      </span>
                    </div>
                    <h3 className="font-semibold truncate">{selectedDoc.name}</h3>
                    <p className="text-xs text-white/80 mt-2">{selectedDoc.uploadDate}</p>
                  </div>

                  {/* Confidence */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-slate-400 text-xs font-medium">Confidence Score</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getConfidenceBadge(selectedDoc.confidence).color}`}>
                        {getConfidenceBadge(selectedDoc.confidence).label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${getConfidenceBadge(selectedDoc.confidence).bar}`}
                        style={{ width: `${parseFloat(selectedDoc.confidence) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      {(parseFloat(selectedDoc.confidence) * 100).toFixed(0)}% accuracy
                    </p>
                  </div>

                  {/* Metadata */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
                      Information
                    </h4>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">File Size</span>
                        <span className="text-white font-semibold">{selectedDoc.size}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-700/30 pt-2.5">
                        <span className="text-slate-400">Upload Date</span>
                        <span className="text-white font-semibold">{selectedDoc.uploadDate}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-700/30 pt-2.5">
                        <span className="text-slate-400">Processing Time</span>
                        <span className="text-white font-semibold">{selectedDoc.processingTime}</span>
                      </div>
                      <div className="flex justify-between items-center border-t border-slate-700/30 pt-2.5">
                        <span className="text-slate-400">Characters</span>
                        <span className="text-white font-semibold">{selectedDoc.totalCharacters.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'data' && (
                <div className="space-y-2">
                  {Object.keys(selectedDoc.extractedData).length > 0 ? (
                    Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                      <div key={key} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 group hover:border-slate-600/80 transition">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-400 text-xs mb-1.5 font-semibold uppercase tracking-wide">{key}</p>
                            <p className="text-white text-sm break-words font-medium">{value}</p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(value)}
                            className="p-1.5 rounded opacity-0 group-hover:opacity-100 transition bg-slate-700/50 hover:bg-slate-600 flex-shrink-0 text-slate-400 hover:text-white"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="text-slate-400 text-sm">No data extracted</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <Eye className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
            <p className="text-slate-400 text-sm">No document selected</p>
          </div>
        )}
      </div>
    );
  }

  // Desktop View
  return (
    <div className="h-full bg-slate-900/50 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-700/30 flex-shrink-0">
        <h2 className="text-xl font-bold text-white">Document Details</h2>
      </div>

      {selectedDoc ? (
        <>
          {/* Tabs */}
          <div className="flex border-b border-slate-700/30 bg-slate-900/30 px-6 flex-shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === 'overview'
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-4 h-4" />
                <span>Overview</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('data')}
              className={`px-4 py-3 text-sm font-semibold transition-all border-b-2 ${
                activeTab === 'data'
                  ? 'text-blue-400 border-blue-500'
                  : 'text-slate-400 border-transparent hover:text-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Extracted Data</span>
              </div>
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="p-6 space-y-4">
                {/* Header Card */}
                <div className={`bg-gradient-to-br ${selectedDoc.color} rounded-xl p-6 text-white`}>
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-5xl">{selectedDoc.icon}</span>
                    <span className="px-3 py-1 rounded-lg text-xs font-bold bg-white/20">
                      {selectedDoc.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg truncate">{selectedDoc.name}</h3>
                  <p className="text-sm text-white/80 mt-2">{selectedDoc.uploadDate}</p>
                </div>

                {/* Confidence Score */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-slate-300 text-sm font-semibold">Confidence Score</span>
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${getConfidenceBadge(selectedDoc.confidence).color}`}>
                      {getConfidenceBadge(selectedDoc.confidence).label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${getConfidenceBadge(selectedDoc.confidence).bar}`}
                      style={{ width: `${parseFloat(selectedDoc.confidence) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400">
                    {(parseFloat(selectedDoc.confidence) * 100).toFixed(0)}% extraction accuracy
                  </p>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      File Size
                    </p>
                    <p className="text-white font-semibold">{selectedDoc.size}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Processing Time
                    </p>
                    <p className="text-white font-semibold">{selectedDoc.processingTime}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Upload Date
                    </p>
                    <p className="text-white font-semibold text-sm">{selectedDoc.uploadDate}</p>
                  </div>
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                      Characters
                    </p>
                    <p className="text-white font-semibold">{selectedDoc.totalCharacters.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="p-6">
                <div className="space-y-3">
                  {Object.keys(selectedDoc.extractedData).length > 0 ? (
                    Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                      <div
                        key={key}
                        className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 group hover:border-slate-600/80 hover:bg-slate-800/70 transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                              {key}
                            </p>
                            <p className="text-white break-words font-medium leading-relaxed">
                              {value}
                            </p>
                          </div>
                          <button
                            onClick={() => copyToClipboard(value)}
                            className="p-2 rounded-lg opacity-0 group-hover:opacity-100 transition bg-slate-700/50 hover:bg-slate-600 flex-shrink-0 text-slate-400 hover:text-white"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-16">
                      <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                      <p className="text-slate-400">No data extracted from this document</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Eye className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
          <p className="text-slate-400 text-lg">Select a document to view details</p>
        </div>
      )}
    </div>
  );
}