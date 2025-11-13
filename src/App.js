import React, { useState } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Eye, Download, Trash2 } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  const documentTypes = [
    { name: 'Invoice', color: 'bg-blue-500', icon: '📄' },
    { name: 'Receipt', color: 'bg-green-500', icon: '🧾' },
    { name: 'Contract', color: 'bg-purple-500', icon: '📋' },
    { name: 'ID Document', color: 'bg-orange-500', icon: '🪪' },
    { name: 'Form', color: 'bg-pink-500', icon: '📝' },
  ];

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setProcessing(true);

    for (const file of files) {
      const reader = new FileReader();
      
      reader.onload = async (event) => {
        const fileData = event.target.result;
        
        // Simulate OCR and AI processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const docType = documentTypes[Math.floor(Math.random() * documentTypes.length)];
        const confidence = (Math.random() * 0.3 + 0.7).toFixed(2);
        
        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: docType.name,
          color: docType.color,
          icon: docType.icon,
          size: (file.size / 1024).toFixed(2) + ' KB',
          uploadDate: new Date().toLocaleDateString(),
          confidence: confidence,
          status: 'processed',
          preview: fileData,
          extractedData: generateMockData(docType.name)
        };
        
        setDocuments(prev => [newDoc, ...prev]);
      };
      
      reader.readAsDataURL(file);
    }
    
    setProcessing(false);
  };

  const generateMockData = (type) => {
    const mockData = {
      'Invoice': {
        'Invoice Number': 'INV-2024-' + Math.floor(Math.random() * 10000),
        'Date': new Date().toLocaleDateString(),
        'Amount': '$' + (Math.random() * 5000 + 500).toFixed(2),
        'Vendor': 'Acme Corporation',
        'Status': 'Paid'
      },
      'Receipt': {
        'Receipt Number': 'RCP-' + Math.floor(Math.random() * 10000),
        'Date': new Date().toLocaleDateString(),
        'Total': '$' + (Math.random() * 500 + 50).toFixed(2),
        'Payment Method': 'Credit Card',
        'Store': 'Tech Store'
      },
      'Contract': {
        'Contract ID': 'CNT-' + Math.floor(Math.random() * 10000),
        'Parties': 'Company A & Company B',
        'Start Date': new Date().toLocaleDateString(),
        'Duration': '12 months',
        'Value': '$' + (Math.random() * 50000 + 10000).toFixed(2)
      },
      'ID Document': {
        'Document Type': 'Passport',
        'ID Number': 'P' + Math.floor(Math.random() * 1000000),
        'Issue Date': new Date(2020, 0, 1).toLocaleDateString(),
        'Expiry Date': new Date(2030, 0, 1).toLocaleDateString(),
        'Nationality': 'US'
      },
      'Form': {
        'Form Type': 'Application Form',
        'Form Number': 'F-' + Math.floor(Math.random() * 10000),
        'Applicant': 'John Doe',
        'Submission Date': new Date().toLocaleDateString(),
        'Status': 'Pending Review'
      }
    };
    
    return mockData[type] || {};
  };

  const deleteDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const stats = {
    total: documents.length,
    processed: documents.filter(d => d.status === 'processed').length,
    avgConfidence: documents.length > 0 
      ? (documents.reduce((sum, d) => sum + parseFloat(d.confidence), 0) / documents.length * 100).toFixed(0)
      : 0
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-3 rounded-xl">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Document Processing System</h1>
                <p className="text-slate-400 text-sm mt-1">AI-powered OCR and document extraction</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Total Documents</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.total}</p>
              </div>
              <FileText className="w-12 h-12 text-blue-500 opacity-50" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Processed</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.processed}</p>
              </div>
              <Check className="w-12 h-12 text-green-500 opacity-50" />
            </div>
          </div>
          
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm">Avg Confidence</p>
                <p className="text-3xl font-bold text-white mt-2">{stats.avgConfidence}%</p>
              </div>
              <AlertCircle className="w-12 h-12 text-purple-500 opacity-50" />
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 mb-8">
          <label className="cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              disabled={processing}
            />
            <div className="border-2 border-dashed border-slate-600 rounded-xl p-12 text-center hover:border-blue-500 transition-all duration-300 hover:bg-slate-700/30">
              {processing ? (
                <div className="flex flex-col items-center space-y-4">
                  <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />
                  <p className="text-slate-300 text-lg">Processing documents...</p>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-4">
                  <Upload className="w-16 h-16 text-slate-400" />
                  <div>
                    <p className="text-slate-300 text-lg font-medium">Drop files here or click to upload</p>
                    <p className="text-slate-500 text-sm mt-2">Support for images and PDF documents</p>
                  </div>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Documents Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Documents List */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-2xl font-bold text-white mb-4">Documents</h2>
            
            {documents.length === 0 ? (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
                <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">No documents uploaded yet</p>
                <p className="text-slate-500 text-sm mt-2">Upload your first document to get started</p>
              </div>
            ) : (
              documents.map(doc => (
                <div
                  key={doc.id}
                  className={`bg-slate-800/50 backdrop-blur-sm border rounded-xl p-6 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer ${
                    selectedDoc?.id === doc.id ? 'border-blue-500 ring-2 ring-blue-500/20' : 'border-slate-700/50'
                  }`}
                  onClick={() => setSelectedDoc(doc)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className={`${doc.color} p-3 rounded-lg text-2xl`}>
                        {doc.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold text-lg">{doc.name}</h3>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-slate-400">
                          <span className="flex items-center space-x-1">
                            <span className={`w-2 h-2 rounded-full ${doc.color}`}></span>
                            <span>{doc.type}</span>
                          </span>
                          <span>{doc.size}</span>
                          <span>{doc.uploadDate}</span>
                        </div>
                        <div className="mt-3 flex items-center space-x-2">
                          <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${parseFloat(doc.confidence) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-slate-400">{(parseFloat(doc.confidence) * 100).toFixed(0)}%</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDoc(doc);
                        }}
                        className="p-2 hover:bg-slate-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-5 h-5 text-slate-400" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteDocument(doc.id);
                        }}
                        className="p-2 hover:bg-red-900/30 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-5 h-5 text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Document Details */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold text-white mb-4">Document Details</h2>
            
            {selectedDoc ? (
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-white">Extracted Data</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${selectedDoc.color} text-white`}>
                    {selectedDoc.type}
                  </span>
                </div>

                <div className="space-y-4">
                  {Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                    <div key={key} className="border-b border-slate-700 pb-3">
                      <p className="text-slate-400 text-sm mb-1">{key}</p>
                      <p className="text-white font-medium">{value}</p>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-700">
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">Confidence Score</span>
                    <span className="text-white font-medium">{(parseFloat(selectedDoc.confidence) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-400">File Size</span>
                    <span className="text-white font-medium">{selectedDoc.size}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-400">Upload Date</span>
                    <span className="text-white font-medium">{selectedDoc.uploadDate}</span>
                  </div>
                </div>

                <button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 flex items-center justify-center space-x-2">
                  <Download className="w-5 h-5" />
                  <span>Export Data</span>
                </button>
              </div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-700/50 rounded-xl p-12 text-center">
                <Eye className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400">Select a document to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}