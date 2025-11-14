// ============================================
// 1. App.js
// ============================================
import React, { useState, useEffect } from 'react';
import MainLayout from './layouts/MainLayout';
import * as pdfjsLib from 'pdfjs-dist';
import { extractTextFromPDF, analyzeDocumentType, extractStructuredData } from './utils';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.394/build/pdf.worker.min.mjs';

const MAX_FILE_SIZE = 50 * 1024 * 1024;

const originalConsoleWarn = console.warn;
console.warn = (...args) => {
  const message = args[0]?.toString() || '';
  if (message.includes('TT:') || message.includes('font')) return;
  originalConsoleWarn.apply(console, args);
};

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [progressText, setProgressText] = useState('');
  const [isMobile, setIsMobile] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setProcessing(true);

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressText(`Processing file ${i + 1} of ${files.length}: ${file.name}`);

      try {
        if (file.type !== 'application/pdf') {
          setProgressText(`✗ Invalid file type: ${file.name} (PDF only)`);
          continue;
        }

        if (file.size > MAX_FILE_SIZE) {
          setProgressText(`✗ File too large: ${file.name} (Max 50MB)`);
          continue;
        }

        let extractedText = '';
        let previewUrl = URL.createObjectURL(file);
        const startTime = Date.now();

        extractedText = await extractTextFromPDF(file, setProgressText);

        const processingTime = ((Date.now() - startTime) / 1000).toFixed(1);
        const docType = analyzeDocumentType(extractedText);

        let confidence = Math.min(
          0.95,
          Math.max(0.5, extractedText.length / 500)
        );

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
          rawText: extractedText.substring(0, 2000),
          processingTime: processingTime + 's',
          totalCharacters: extractedText.length,
          fullText: extractedText
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
    e.target.value = '';
  };

  const deleteDocument = (id) => {
    const docToDelete = documents.find(doc => doc.id === id);
    if (docToDelete?.preview) {
      URL.revokeObjectURL(docToDelete.preview);
    }
    setDocuments(prev => prev.filter(doc => doc.id !== id));
    if (selectedDoc?.id === id) {
      setSelectedDoc(null);
      setChatMessages([]);
    }
  };

  return (
    <MainLayout
      documents={documents}
      processing={processing}
      progressText={progressText}
      selectedDoc={selectedDoc}
      isMobile={isMobile}
      chatMessages={chatMessages}
      onFileUpload={handleFileUpload}
      onDocumentSelect={setSelectedDoc}
      onDocumentDelete={deleteDocument}
      onChatUpdate={setChatMessages}
      onBack={() => {
        setSelectedDoc(null);
        setChatMessages([]);
      }}
    />
  );
}



