// ============================================
// MainLayout.js - Enhanced Mobile Navigation
// ============================================
import React, { useState, useEffect } from 'react';
import { FileText, Menu, X, Settings, Bell, User, Upload, MessageSquare, Info } from 'lucide-react';
import AIChat from '../components/AIChat';
import DocumentUpload from '../components/DocumentUpload';
import DocumentDetails from '../components/DocumentDetails';

export default function MainLayout({
  documents,
  processing,
  progressText,
  selectedDoc,
  isMobile,
  chatMessages,
  onFileUpload,
  onDocumentSelect,
  onDocumentDelete,
  onChatUpdate,
  onBack
}) {
  const [mobileView, setMobileView] = useState('upload');
  const [menuOpen, setMenuOpen] = useState(false);

  // Auto-switch to details when a document is selected on mobile
  useEffect(() => {
    if (isMobile && selectedDoc && mobileView === 'upload') {
      setMobileView('details');
    }
  }, [selectedDoc, isMobile, mobileView]);

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col overflow-hidden">
      {/* ========================================
          HEADER - Fixed Height
          ======================================== */}
      <header className="bg-slate-900/60 backdrop-blur-xl border-b border-slate-700/30 flex-shrink-0 h-auto">
        <div className="flex items-center justify-between px-4 lg:px-8 py-3 lg:py-4">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 min-w-0">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg shadow-blue-500/30 flex-shrink-0">
              <FileText className="w-5 h-5 lg:w-6 lg:h-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg lg:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent truncate">
                DocScan AI
              </h1>
              <p className="text-xs lg:text-xs text-slate-400 hidden sm:block truncate">
                {documents.length} document{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          {/* Desktop Controls */}
          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/30">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-slate-300 whitespace-nowrap">Ready</span>
            </div>
            <button className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-slate-300 flex-shrink-0">
              <Bell className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-slate-300 flex-shrink-0">
              <Settings className="w-5 h-5" />
            </button>
            <button className="p-2 hover:bg-slate-800/50 rounded-lg transition text-slate-400 hover:text-slate-300 flex-shrink-0">
              <User className="w-5 h-5" />
            </button>
          </div>

          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 md:hidden flex-shrink-0"
            >
              {menuOpen ? (
                <X className="w-6 h-6 text-slate-300" />
              ) : (
                <Menu className="w-6 h-6 text-slate-300" />
              )}
            </button>
          )}
        </div>

        {/* Mobile Menu - Dropdown */}
        {isMobile && menuOpen && (
          <div className="border-t border-slate-700/30 bg-slate-900/80 px-4 py-3">
            <div className="space-y-2">
              <button
                onClick={() => {
                  setMobileView('upload');
                  setMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                  mobileView === 'upload'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Upload Documents</span>
              </button>
              {selectedDoc && (
                <>
                  <button
                    onClick={() => {
                      setMobileView('details');
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      mobileView === 'details'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <Info className="w-4 h-4" />
                    <span>Document Details</span>
                  </button>
                  <button
                    onClick={() => {
                      setMobileView('chat');
                      setMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition ${
                      mobileView === 'chat'
                        ? 'bg-blue-500/20 text-blue-300'
                        : 'text-slate-400 hover:bg-slate-800/50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>AI Chat</span>
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {/* Mobile Navigation Bar - Always Visible */}
        {isMobile && !menuOpen && selectedDoc && (
          <div className="border-t border-slate-700/30 bg-slate-900/60 px-4 py-2">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setMobileView('upload')}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition flex-1 mx-1 ${
                  mobileView === 'upload'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span className="text-xs">Upload</span>
              </button>
              <button
                onClick={() => setMobileView('details')}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition flex-1 mx-1 ${
                  mobileView === 'details'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <Info className="w-4 h-4" />
                <span className="text-xs">Details</span>
              </button>
              <button
                onClick={() => setMobileView('chat')}
                className={`flex flex-col items-center space-y-1 px-3 py-2 rounded-lg transition flex-1 mx-1 ${
                  mobileView === 'chat'
                    ? 'bg-blue-500/20 text-blue-300'
                    : 'text-slate-400 hover:bg-slate-800/50'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                <span className="text-xs">AI Chat</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ========================================
          MAIN CONTENT - Flex Fill (No Scroll)
          ======================================== */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row w-full">
        {/* ========================================
            DESKTOP LAYOUT - 3 Column
            ======================================== */}
        <div className="hidden lg:flex flex-1 overflow-hidden gap-0 w-full h-full">
          {/* Column 1: Document Upload - Fixed Width */}
          <div className="w-80 h-full flex flex-col border-r border-slate-700/30 flex-shrink-0 overflow-hidden">
            <DocumentUpload
              documents={documents}
              processing={processing}
              progressText={progressText}
              selectedDoc={selectedDoc}
              onFileUpload={onFileUpload}
              onDocumentSelect={onDocumentSelect}
              onDocumentDelete={onDocumentDelete}
              onChatClear={() => onChatUpdate([])}
            />
          </div>

          {/* Column 2: Document Details - Fixed Width */}
          <div className="w-96 h-full flex flex-col border-r border-slate-700/30 flex-shrink-0 overflow-hidden">
            <DocumentDetails selectedDoc={selectedDoc} />
          </div>

          {/* Column 3: AI Chat - Flex Fill */}
          <div className="flex-1 h-full flex flex-col overflow-hidden">
            <AIChat
              selectedDoc={selectedDoc}
              chatMessages={chatMessages}
              onChatUpdate={onChatUpdate}
            />
          </div>
        </div>

        {/* ========================================
            MOBILE LAYOUT - Tab Based
            ======================================== */}
        <div className="lg:hidden flex-1 flex flex-col overflow-hidden w-full h-full">
          {mobileView === 'upload' && (
            /* Upload View */
            <div className="flex-1 overflow-hidden flex flex-col">
              <DocumentUpload
                documents={documents}
                processing={processing}
                progressText={progressText}
                selectedDoc={selectedDoc}
                onFileUpload={onFileUpload}
                onDocumentSelect={(doc) => {
                  onDocumentSelect(doc);
                  setMobileView('details');
                }}
                onDocumentDelete={(doc) => {
                  onDocumentDelete(doc);
                  // If we're deleting the currently selected doc, go back to upload
                  if (selectedDoc && doc.id === selectedDoc.id) {
                    setMobileView('upload');
                  }
                }}
                onChatClear={() => onChatUpdate([])}
                isMobile={true}
              />
            </div>
          )}

          {mobileView === 'details' && selectedDoc && (
            /* Details View */
            <div className="flex-1 overflow-hidden flex flex-col">
              <DocumentDetails
                selectedDoc={selectedDoc}
                isMobile={true}
                onBack={() => {
                  onBack();
                  setMobileView('upload');
                }}
                onChatNavigate={() => setMobileView('chat')}
              />
            </div>
          )}

          {mobileView === 'chat' && selectedDoc && (
            /* Chat View */
            <div className="flex-1 overflow-hidden flex flex-col">
              <AIChat
                selectedDoc={selectedDoc}
                chatMessages={chatMessages}
                onChatUpdate={onChatUpdate}
                isMobile={true}
                onBack={() => setMobileView('details')}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}