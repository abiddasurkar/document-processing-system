import React, { useState, useEffect, useRef } from 'react';
import { Upload, FileText, Check, AlertCircle, Loader2, Eye, Download, Trash2, ChevronRight, X, Send, MessageCircle } from 'lucide-react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs';

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('TT:') || message.includes('font')) {
    return;
  }
  originalConsoleWarn.apply(console, args);
};

const WORKER_URL = 'https://calm-haze-e5a9.dkabid5634.workers.dev/';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const documentTypes = [
    { name: 'Invoice', color: 'from-blue-500 to-blue-600', icon: '📄', bg: 'bg-blue-500/10' },
    { name: 'Receipt', color: 'from-green-500 to-green-600', icon: '🧾', bg: 'bg-green-500/10' },
    { name: 'Contract', color: 'from-purple-500 to-purple-600', icon: '📋', bg: 'bg-purple-500/10' },
    { name: 'ID Document', color: 'from-orange-500 to-orange-600', icon: '🪪', bg: 'bg-orange-500/10' },
    { name: 'Form', color: 'from-pink-500 to-pink-600', icon: '📝', bg: 'bg-pink-500/10' },
  ];

  const extractTextFromPDF = async (file) => {
    try {
      setProgressText('Loading PDF...');
      const arrayBuffer = await file.arrayBuffer();
      
      setProgressText('Parsing PDF structure...');
      const loadingTask = pdfjsLib.getDocument({ 
        data: arrayBuffer,
        verbosity: 0
      });
      const pdf = await loadingTask.promise;
      
      let fullText = '';
      const totalPages = pdf.numPages;
      
      if (totalPages === 0) {
        throw new Error('PDF has no pages');
      }
      
      for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
        setProgressText(`Processing page ${pageNum} of ${totalPages}...`);
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        
        if (textContent && textContent.items && textContent.items.length > 0) {
          const pageText = textContent.items
            .map(item => item.str || '')
            .filter(text => text.trim().length > 0)
            .join(' ');
          
          if (pageText.trim()) {
            fullText += pageText + '\n\n';
          }
        }
      }
      
      setProgressText('Text extraction complete!');
      
      if (!fullText.trim()) {
        return 'No text found - this might be a scanned PDF that requires OCR';
      }
      
      return fullText.trim();
    } catch (error) {
      console.error('PDF extraction error:', error);
      setProgressText('PDF extraction failed');
      return `Error: ${error.message}`;
    }
  };

  const analyzeDocumentType = (text) => {
    if (!text || text.length < 10) {
      return documentTypes[Math.floor(Math.random() * documentTypes.length)];
    }
    
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('invoice') || lowerText.includes('bill') || lowerText.includes('amount due')) {
      return documentTypes[0];
    } else if (lowerText.includes('receipt') || lowerText.includes('payment') || lowerText.includes('total')) {
      return documentTypes[1];
    } else if (lowerText.includes('contract') || lowerText.includes('agreement') || lowerText.includes('terms')) {
      return documentTypes[2];
    } else if (lowerText.includes('passport') || lowerText.includes('license') || lowerText.includes('id')) {
      return documentTypes[3];
    } else if (lowerText.includes('form') || lowerText.includes('application') || lowerText.includes('submit')) {
      return documentTypes[4];
    }
    
    return documentTypes[Math.floor(Math.random() * documentTypes.length)];
  };

  const extractPattern = (text, regex) => {
    const match = text.match(regex);
    return match ? match[1] : null;
  };

  const extractDate = (text, index = 0) => {
    const dateRegex = /\b(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})\b/g;
    const matches = [...text.matchAll(dateRegex)];
    return matches[index] ? matches[index][1] : null;
  };

  const extractCurrency = (text) => {
    const currencyRegex = /[\$€£]?\s?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/;
    const match = text.match(currencyRegex);
    return match ? '$' + match[1].replace(/,/g, '') : null;
  };

  const extractStructuredData = (text, docType) => {
    const data = {};
    
    if (!text || text.length < 10) {
      return generateMockData(docType.name);
    }
    
    switch(docType.name) {
      case 'Invoice':
        data['Invoice Number'] = extractPattern(text, /(?:invoice|inv)[\s#:-]*([a-z0-9-]+)/i) || `INV-${Date.now()}`;
        data['Date'] = extractDate(text) || new Date().toLocaleDateString();
        data['Amount'] = extractCurrency(text) || '$' + (Math.random() * 5000 + 500).toFixed(2);
        data['Vendor'] = extractPattern(text, /(?:from|vendor|company)[\s:]*([A-Za-z\s]+)/i) || 'Extracted Vendor';
        data['Status'] = 'Processed';
        break;
        
      case 'Receipt':
        data['Receipt Number'] = extractPattern(text, /(?:receipt|rcp)[\s#:-]*([a-z0-9-]+)/i) || `RCP-${Date.now()}`;
        data['Date'] = extractDate(text) || new Date().toLocaleDateString();
        data['Total'] = extractCurrency(text) || '$' + (Math.random() * 500 + 50).toFixed(2);
        data['Payment Method'] = 'Extracted Method';
        data['Store'] = 'Extracted Store';
        break;
        
      case 'Contract':
        data['Contract ID'] = extractPattern(text, /(?:contract|cnt)[\s#:-]*([a-z0-9-]+)/i) || `CNT-${Date.now()}`;
        data['Parties'] = 'Extracted Parties';
        data['Start Date'] = extractDate(text) || new Date().toLocaleDateString();
        data['Duration'] = '12 months';
        data['Value'] = extractCurrency(text) || '$' + (Math.random() * 50000 + 10000).toFixed(2);
        break;
        
      case 'ID Document':
        data['Document Type'] = 'Extracted ID Type';
        data['ID Number'] = extractPattern(text, /[A-Z0-9]{6,12}/) || `ID${Date.now()}`;
        data['Issue Date'] = extractDate(text) || new Date(2020, 0, 1).toLocaleDateString();
        data['Expiry Date'] = extractDate(text, 1) || new Date(2030, 0, 1).toLocaleDateString();
        data['Nationality'] = 'US';
        break;
        
      default:
        data['Document Type'] = docType.name;
        data['Extracted Text'] = text.substring(0, 200) + '...';
        break;
    }
    
    return data;
  };

  const generateMockData = (type) => {
    const mockData = {
      'Invoice': {
        'Invoice Number': 'INV-' + Date.now(),
        'Date': new Date().toLocaleDateString(),
        'Amount': '$' + (Math.random() * 5000 + 500).toFixed(2),
        'Vendor': 'Acme Corporation',
        'Status': 'Processed'
      },
      'Receipt': {
        'Receipt Number': 'RCP-' + Date.now(),
        'Date': new Date().toLocaleDateString(),
        'Total': '$' + (Math.random() * 500 + 50).toFixed(2),
        'Payment Method': 'Credit Card',
        'Store': 'Retail Store'
      },
      'Contract': {
        'Contract ID': 'CNT-' + Date.now(),
        'Parties': 'Company A & Company B',
        'Start Date': new Date().toLocaleDateString(),
        'Duration': '12 months',
        'Value': '$' + (Math.random() * 50000 + 10000).toFixed(2)
      },
      'ID Document': {
        'Document Type': 'ID Card',
        'ID Number': 'ID' + Date.now(),
        'Issue Date': new Date(2020, 0, 1).toLocaleDateString(),
        'Expiry Date': new Date(2030, 0, 1).toLocaleDateString(),
        'Nationality': 'US'
      },
      'Form': {
        'Form Type': 'Application Form',
        'Form Number': 'F-' + Date.now(),
        'Applicant': 'John Doe',
        'Submission Date': new Date().toLocaleDateString(),
        'Status': 'Pending Review'
      }
    };
    
    return mockData[type] || {};
  };

  const getConfidenceBadge = (confidence) => {
    const conf = parseFloat(confidence) * 100;
    if (conf >= 90) return { label: 'Excellent', color: 'bg-emerald-500/20 text-emerald-400' };
    if (conf >= 75) return { label: 'Good', color: 'bg-blue-500/20 text-blue-400' };
    if (conf >= 60) return { label: 'Fair', color: 'bg-amber-500/20 text-amber-400' };
    return { label: 'Low', color: 'bg-red-500/20 text-red-400' };
  };

  const sendAIMessage = async () => {
    if (!chatInput.trim() || !selectedDoc) return;

    const userMessage = chatInput;
    setChatInput('');
    
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);

    try {
      const textToAnalyze = `Document: ${selectedDoc.name} (${selectedDoc.type})\n\nExtracted Data:\n${Object.entries(selectedDoc.extractedData).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nRaw Text:\n${selectedDoc.rawText}\n\nUser Question: ${userMessage}`;

      const response = await fetch(WORKER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToAnalyze })
      });

      const result = await response.json();
      let aiResponse = '';

      if (result[0]?.generated_text) {
        aiResponse = result[0].generated_text;
      } else if (result.error) {
        aiResponse = `Error: ${result.error}`;
      } else {
        aiResponse = JSON.stringify(result);
      }

      setChatMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: `Error: ${error.message}` }]);
    }

    setAiLoading(false);
  };

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressText(`Processing file ${i + 1} of ${files.length}: ${file.name}`);
      
      try {
        let extractedText = '';
        let previewUrl = URL.createObjectURL(file);
        const startTime = Date.now();

        if (file.type === 'application/pdf') {
          extractedText = await extractTextFromPDF(file);
        } else {
          extractedText = 'Unsupported file type';
        }

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const docType = analyzeDocumentType(extractedText);
        
        let confidence;
        if (extractedText.length > 100) {
          confidence = 0.95;
        } else if (extractedText.length > 50) {
          confidence = 0.85;
        } else if (extractedText.length > 20) {
          confidence = 0.70;
        } else {
          confidence = 0.50;
        }

        const extractedData = extractStructuredData(extractedText, docType);

        const newDoc = {
          id: Date.now() + Math.random(),
          name: file.name,
          type: docType.name,
          color: docType.color,
          bg: docType.bg,
          icon: docType.icon,
          size: (file.size / 1024).toFixed(2) + ' KB',
          uploadDate: new Date().toLocaleDateString(),
          confidence: confidence,
          status: 'processed',
          preview: previewUrl,
          extractedData: extractedData,
          rawText: extractedText.substring(0, 1000) + (extractedText.length > 1000 ? '...' : ''),
          processingTime: processingTime + 's',
          totalCharacters: extractedText.length
        };

        setDocuments(prev => [newDoc, ...prev]);
        setSelectedDoc(newDoc);
        setChatMessages([]);
        setProgressText(`✓ Completed ${file.name} in ${processingTime}s`);
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
      } catch (error) {
        console.error('Error processing file:', error);
        setProgressText(`✗ Error processing ${file.name}`);
      }
    }

    setProcessing(false);
    setProgressText('');
  };

  const deleteDocument = (id, e) => {
    if (e) e.stopPropagation();
    const docToDelete = documents.find(doc => doc.id === id);
    if (docToDelete && docToDelete.preview) {
      URL.revokeObjectURL(docToDelete.preview);
    }
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
      setChatMessages([]);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col lg:flex-row overflow-hidden">
      {/* MOBILE: Header */}
      <header className="lg:hidden bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-20">
        <div className="px-4 py-3">
          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">DocScan AI</h1>
              <p className="text-slate-400 text-xs">{documents.length} documents</p>
            </div>
          </div>
        </div>
      </header>

      {/* DESKTOP LAYOUT */}
      <div className="hidden lg:flex flex-1 overflow-hidden gap-0">
        {/* LEFT: Upload Panel */}
        <div className="w-1/3 border-r border-slate-700/50 overflow-y-auto flex flex-col">
          <div className="p-6 flex flex-col h-full">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white">Upload Documents</h2>
              <p className="text-slate-400 text-sm mt-1">PDF files</p>
            </div>
            
            <label className="cursor-pointer flex-1 flex flex-col mb-6">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={processing}
              />
              <div className="flex-1 border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-all duration-300 hover:bg-blue-500/5 group flex flex-col items-center justify-center">
                {processing ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <div>
                      <p className="text-white text-sm font-semibold">Processing...</p>
                      {progressText && (
                        <p className="text-blue-400 text-xs mt-2 font-medium">{progressText}</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-xl">
                      <Upload className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Drop files here</p>
                      <p className="text-slate-400 text-xs mt-1">or click to upload</p>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Documents List */}
            <div className="border-t border-slate-700/50 pt-6">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Processed ({documents.length})
              </h3>
              <div className="space-y-2">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setChatMessages([]);
                    }}
                    className={`group bg-slate-800/40 backdrop-blur-sm border-2 rounded-xl p-3 cursor-pointer transition-all duration-300 ${
                      selectedDoc?.id === doc.id 
                        ? 'border-blue-500 bg-slate-800/60' 
                        : 'border-slate-700/50 hover:border-slate-600 hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${doc.bg} p-2 rounded-lg text-lg flex-shrink-0`}>
                        {doc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{doc.name}</p>
                        <p className="text-slate-400 text-xs">{doc.type}</p>
                      </div>
                      <button
                        onClick={(e) => deleteDocument(doc.id, e)}
                        className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors flex-shrink-0"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-red-400" />
                      </button>
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-6">No documents uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* MIDDLE: Details Panel */}
        <div className="w-1/3 border-r border-slate-700/50 overflow-y-auto flex flex-col">
          <div className="p-6 flex flex-col h-full">
            <h2 className="text-xl font-bold text-white mb-6">Document Details</h2>

            {selectedDoc ? (
              <div className="flex-1 flex flex-col space-y-4">
                {/* Header Card */}
                <div className={`bg-gradient-to-br ${selectedDoc.color} rounded-xl p-4 text-white`}>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-3xl">{selectedDoc.icon}</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold bg-white/20`}>
                      {selectedDoc.type}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm truncate">{selectedDoc.name}</h3>
                  <p className="text-xs text-white/80 mt-1">{selectedDoc.size} • {selectedDoc.uploadDate}</p>
                </div>

                {/* Confidence Score */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-400 text-xs font-medium">Confidence</span>
                    <span className={`px-2 py-1 rounded text-xs font-bold ${getConfidenceBadge(selectedDoc.confidence).color}`}>
                      {getConfidenceBadge(selectedDoc.confidence).label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-700/50 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${selectedDoc.color} transition-all duration-700`}
                      style={{ width: `${parseFloat(selectedDoc.confidence) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-slate-400 mt-2">{(parseFloat(selectedDoc.confidence) * 100).toFixed(0)}%</p>
                </div>

                {/* Extracted Data */}
                <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                  <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">Data</h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                      <div key={key} className="bg-slate-700/30 rounded p-2">
                        <p className="text-slate-400 text-xs mb-0.5">{key}</p>
                        <p className="text-white text-xs font-semibold break-words">{value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Text Preview */}
                {selectedDoc.rawText && (
                  <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-4">
                    <h4 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Preview</h4>
                    <div className="bg-slate-900/50 p-3 rounded max-h-32 overflow-y-auto border border-slate-700/50">
                      <p className="text-slate-300 text-xs whitespace-pre-wrap font-mono leading-relaxed">
                        {selectedDoc.rawText}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <Eye className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
                <p className="text-slate-400 text-sm">No document selected</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: AI Chat Panel */}
        <div className="w-1/3 overflow-y-auto flex flex-col">
          <div className="p-6 flex flex-col h-full">
            <div className="flex items-center space-x-2 mb-6">
              <MessageCircle className="w-5 h-5 text-blue-400" />
              <h2 className="text-xl font-bold text-white">AI Assistant</h2>
            </div>

            {selectedDoc ? (
              <>
                {/* Chat Messages */}
                <div className="flex-1 flex flex-col space-y-3 mb-4 overflow-y-auto">
                  {chatMessages.length === 0 && (
                    <div className="flex items-center justify-center h-full text-center">
                      <p className="text-slate-400 text-sm">Ask questions about this document...</p>
                    </div>
                  )}
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs px-4 py-2 rounded-lg text-sm ${
                        msg.role === 'user'
                          ? 'bg-blue-500/30 text-blue-100'
                          : 'bg-slate-700/50 text-slate-200'
                      }`}>
                        <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {aiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-slate-700/50 px-4 py-2 rounded-lg">
                        <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendAIMessage()}
                    placeholder="Ask about the document..."
                    className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    disabled={aiLoading}
                  />
                  <button
                    onClick={sendAIMessage}
                    disabled={aiLoading || !chatInput.trim()}
                    className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center">
                <MessageCircle className="w-12 h-12 text-slate-600 mb-3 opacity-50" />
                <p className="text-slate-400 text-sm">Select a document to chat</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MOBILE LAYOUT - Simplified */}
      <div className="lg:hidden flex-1 flex flex-col overflow-hidden">
        {!selectedDoc ? (
          <div className="flex-1 flex flex-col p-4 overflow-y-auto">
            <label className="cursor-pointer flex-1 flex flex-col mb-6">
              <input
                type="file"
                multiple
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                disabled={processing}
              />
              <div className="flex-1 border-2 border-dashed border-slate-600 rounded-2xl p-8 text-center hover:border-blue-500 transition-all duration-300 hover:bg-blue-500/5 group flex flex-col items-center justify-center">
                {processing ? (
                  <div className="flex flex-col items-center space-y-3">
                    <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                    <p className="text-white text-sm font-semibold">Processing...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center space-y-3">
                    <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 p-4 rounded-xl">
                      <Upload className="w-10 h-10 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-semibold">Drop files here</p>
                      <p className="text-slate-400 text-xs mt-1">or tap to upload</p>
                    </div>
                  </div>
                )}
              </div>
            </label>

            {/* Documents List */}
            <div className="flex-1 min-h-0">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Processed ({documents.length})
              </h3>
              <div className="space-y-2 overflow-y-auto max-h-full">
                {documents.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => {
                      setSelectedDoc(doc);
                      setChatMessages([]);
                    }}
                    className="group bg-slate-800/40 backdrop-blur-sm border-2 border-slate-700/50 rounded-xl p-3 cursor-pointer transition-all duration-300 active:border-blue-500 active:bg-slate-800/60"
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`${doc.bg} p-2 rounded-lg text-lg flex-shrink-0`}>
                        {doc.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{doc.name}</p>
                        <p className="text-slate-400 text-xs">{doc.type}</p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-500 flex-shrink-0" />
                    </div>
                  </div>
                ))}
                {documents.length === 0 && (
                  <p className="text-slate-500 text-xs text-center py-8">No documents uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Details Tab
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Back Button */}
            <button
              onClick={() => {
                setSelectedDoc(null);
                setChatMessages([]);
              }}
              className="flex items-center space-x-2 text-slate-400 hover:text-white p-4 pb-2 transition-colors border-b border-slate-700/50"
            >
              <X className="w-5 h-5" />
              <span className="text-sm font-medium">Back to Upload</span>
            </button>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Tabs */}
              <div className="flex border-b border-slate-700/50">
                <button className="flex-1 px-4 py-3 text-sm font-semibold text-blue-400 border-b-2 border-blue-500">Details</button>
                <button className="flex-1 px-4 py-3 text-sm font-semibold text-slate-400">Chat</button>
              </div>

              {/* Details Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                  {/* Header Card */}
                  <div className={`bg-gradient-to-br ${selectedDoc.color} rounded-xl p-4 text-white`}>
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-2xl">{selectedDoc.icon}</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold bg-white/20`}>
                        {selectedDoc.type}
                      </span>
                    </div>
                    <h3 className="font-semibold text-sm truncate">{selectedDoc.name}</h3>
                    <p className="text-xs text-white/80 mt-1">{selectedDoc.size}</p>
                  </div>

                  {/* Confidence */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-slate-400 text-xs font-medium">Confidence</span>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${getConfidenceBadge(selectedDoc.confidence).color}`}>
                        {getConfidenceBadge(selectedDoc.confidence).label}
                      </span>
                    </div>
                    <div className="w-full bg-slate-700/50 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${selectedDoc.color}`}
                        style={{ width: `${parseFloat(selectedDoc.confidence) * 100}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Data */}
                  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3">
                    <h4 className="text-slate-400 text-xs font-semibold uppercase mb-2">Data</h4>
                    <div className="space-y-2">
                      {Object.entries(selectedDoc.extractedData).map(([key, value]) => (
                        <div key={key} className="bg-slate-700/30 rounded p-2">
                          <p className="text-slate-400 text-xs mb-0.5">{key}</p>
                          <p className="text-white text-xs font-semibold break-words">{value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}