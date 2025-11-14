
// ============================================
// 5. AIChat.js
// ============================================
import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, Loader2 } from 'lucide-react';

const HF_INFERENCE_URL = 'https://router.huggingface.co/hf-inference';

export default function AIChat({
  selectedDoc,
  chatMessages,
  onChatUpdate,
  isMobile = false
}) {
  const [chatInput, setChatInput] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const sendAIMessage = async () => {
    if (!chatInput.trim() || !selectedDoc) return;

    const userMessage = chatInput;
    setChatInput('');

    onChatUpdate(prev => [...prev, { role: 'user', content: userMessage }]);
    setAiLoading(true);

    try {
      const textToAnalyze = `Document: ${selectedDoc.name} (${selectedDoc.type})\n\nExtracted Data:\n${Object.entries(selectedDoc.extractedData).map(([k, v]) => `${k}: ${v}`).join('\n')}\n\nRaw Text:\n${selectedDoc.rawText}\n\nUser Question: ${userMessage}`;

      const response = await fetch(HF_INFERENCE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: textToAnalyze,
          parameters: {
            max_new_tokens: 500,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      let aiResponse = '';

      if (result[0]?.generated_text) {
        aiResponse = result[0].generated_text;
      } else if (result.generated_text) {
        aiResponse = result.generated_text;
      } else if (result.error) {
        aiResponse = `Error: ${result.error}`;
      } else {
        aiResponse = 'I received your message but had trouble processing it.';
      }

      onChatUpdate(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      console.error('AI chat error:', error);
      const fallbackResponses = [
        `Based on the document, I can see this is a ${selectedDoc.type}. How can I help you with it?`,
        `I've analyzed your ${selectedDoc.type}. What specific information would you like to know?`,
        `This appears to be a ${selectedDoc.type} document. What would you like me to explain?`
      ];
      const fallbackResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

      onChatUpdate(prev => [...prev, {
        role: 'assistant',
        content: fallbackResponse + " (Note: AI service temporarily unavailable)"
      }]);
    }

    setAiLoading(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendAIMessage();
    }
  };

  return (
    <div className={`flex flex-col h-full ${isMobile ? 'bg-slate-900/50' : 'bg-slate-900/30'}`}>
      {/* Header */}
      <div className={`${isMobile ? 'p-4' : 'p-6'} border-b border-slate-700/30 flex-shrink-0`}>
        <div className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5 text-blue-400" />
          <h2 className={`font-bold text-white ${isMobile ? 'text-lg' : 'text-xl'}`}>
            AI Assistant
          </h2>
        </div>
        {selectedDoc && (
          <p className="text-xs text-slate-400 mt-1">Analyzing: {selectedDoc.name}</p>
        )}
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col">
        {selectedDoc ? (
          <>
            {chatMessages.length === 0 && (
              <div className="flex-1 flex items-center justify-center text-center p-6">
                <div>
                  <MessageCircle className="w-12 h-12 text-slate-600 mx-auto mb-3 opacity-50" />
                  <p className="text-slate-400 text-sm">Ask questions about this document</p>
                  <p className="text-slate-500 text-xs mt-1">Start with something like: "What is this document about?"</p>
                </div>
              </div>
            )}

            <div className={`${isMobile ? 'p-4' : 'p-6'} space-y-3 overflow-y-auto flex-1`}>
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fadeIn`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md ${isMobile ? 'px-3 py-2' : 'px-4 py-3'} rounded-lg text-sm ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/20'
                        : 'bg-slate-800/70 text-slate-100 border border-slate-700/50'
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words leading-relaxed">{msg.content}</p>
                  </div>
                </div>
              ))}

              {aiLoading && (
                <div className="flex justify-start animate-fadeIn">
                  <div className="bg-slate-800/70 border border-slate-700/50 px-4 py-3 rounded-lg flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />
                    <span className="text-xs text-slate-300">AI is thinking...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
            <MessageCircle className="w-16 h-16 text-slate-600 mb-4 opacity-50" />
            <p className="text-slate-400 text-sm">Select a document to start chatting</p>
          </div>
        )}
      </div>

      {/* Input Area */}
      {selectedDoc && (
        <div className={`border-t border-slate-700/30 bg-slate-900/50 backdrop-blur-sm flex-shrink-0 ${isMobile ? 'p-4' : 'p-6'}`}>
          <div className="flex gap-3">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask about the document..."
              className="flex-1 bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition"
              disabled={aiLoading}
            />
            <button
              onClick={sendAIMessage}
              disabled={aiLoading || !chatInput.trim()}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-slate-700 disabled:to-slate-700 text-white p-2 rounded-lg transition-all duration-200 flex-shrink-0 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 disabled:shadow-none"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}