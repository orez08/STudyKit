import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquare,
  Sparkles,
  Send,
  BookOpen,
  FileCheck,
  Copy,
  Check,
  RotateCcw,
  Trash2,
  AlertCircle,
  ExternalLink,
  Loader2,
  HelpCircle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { ChatMessage, DocumentItem } from '../types';
import { apiClient } from '../lib/apiClient';

interface StudyAssistantPageProps {
  initialDocumentContext?: DocumentItem | null;
}

export const StudyAssistantPage: React.FC<StudyAssistantPageProps> = ({
  initialDocumentContext,
}) => {
  const { documents, chatMessages, addChatMessage, clearChat, activeDoc, setActiveDoc } = useStudy();

  const [inputMessage, setInputMessage] = useState('');
  const [selectedDocId, setSelectedDocId] = useState<string>(
    initialDocumentContext?.id || activeDoc?.id || documents[0]?.id || ''
  );
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedDocument = documents.find((d) => d.id === selectedDocId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputMessage;
    if (!text.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
      docId: selectedDocument?.id,
      docTitle: selectedDocument?.name,
    };

    addChatMessage(userMsg);
    if (!textToSend) setInputMessage('');
    setIsTyping(true);

    try {
      const res = await apiClient.post<{ success: boolean; data: any }>('/api/ai/chat', {
        message: text,
        contextText: selectedDocument?.extractedText || '',
        documentTitle: selectedDocument?.name || '',
        history: chatMessages.slice(-6).map((m) => ({
          role: m.role,
          content: m.content,
        })),
      });

      if (!res.data) throw new Error('Invalid format returned by AI partner.');

      const assistantMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toISOString(),
        docId: selectedDocument?.id,
        docTitle: selectedDocument?.name,
        citations: res.data.citations || [],
        isGroundedInDocument: res.data.isGroundedInDocument,
        suggestedFollowUps: res.data.suggestedFollowUps || [],
      };

      addChatMessage(assistantMsg);
    } catch (err: any) {
      console.error('Study assistant error:', err);
      const friendlyError =
        err.message || 'Server is busy, please retry in a few moments.';
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: `${friendlyError}`,
        timestamp: new Date().toISOString(),
      };
      addChatMessage(errorMsg);
    } finally {
      setIsTyping(false);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="p-4 sm:p-8 max-w-5xl mx-auto space-y-6 flex flex-col h-[calc(100vh-5rem)]">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#2A2A2A] shrink-0">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#F2C230] uppercase tracking-wider mb-1">
            <MessageSquare className="w-4 h-4" />
            <span>Retrieval-Augmented Tutor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-['Outfit']">
            Ask Study Kit
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400">
            Understand difficult concepts with an AI study partner grounded in your materials.
          </p>
        </div>

        {/* Reference Document Selector */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-neutral-400">Reference:</span>
            <select
              value={selectedDocId}
              onChange={(e) => {
                setSelectedDocId(e.target.value);
                const chosen = documents.find((d) => d.id === e.target.value);
                if (chosen) setActiveDoc(chosen);
              }}
              className="bg-[#1C1C1C] border border-[#2E2E2E] rounded-lg px-3 py-1.5 text-xs text-white max-w-[200px] truncate focus:outline-none focus:border-[#F2C230]"
            >
              <option value="">No document (General tutor)</option>
              {documents.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={clearChat}
            className="p-1.5 text-neutral-400 hover:text-red-400 hover:bg-[#262626] rounded-lg transition-colors"
            title="Clear Conversation"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-4 pr-2">
        {chatMessages.map((msg) => {
          const isUser = msg.role === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 text-xs leading-relaxed ${
                isUser ? 'justify-end' : 'justify-start'
              }`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-lg bg-[#F2C230] text-black font-extrabold flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl space-y-2.5 ${
                  isUser
                    ? 'bg-[#F2C230] text-black font-medium rounded-tr-none'
                    : 'bg-[#1E1E1E] border border-[#2D2D2D] text-neutral-200 rounded-tl-none shadow-md'
                }`}
              >
                <div className="whitespace-pre-line leading-relaxed">{msg.content}</div>

                {/* Grounding & Citations Indicator */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-[#2C2C2C] flex flex-wrap items-center gap-2 text-[10px] text-neutral-400">
                    <span className="text-[#F2C230] font-semibold">Document Citations:</span>
                    {msg.citations.map((c, cIdx) => (
                      <span key={cIdx} className="bg-[#141414] px-1.5 py-0.5 rounded font-mono">
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {/* Action button: Copy */}
                {!isUser && (
                  <div className="flex items-center justify-between pt-1 text-[10px] text-neutral-400">
                    <span className="font-mono">
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="hover:text-white flex items-center gap-1 transition-colors"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span>Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                )}

                {/* Suggested follow-up buttons */}
                {!isUser && msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                  <div className="pt-3 border-t border-[#2C2C2C] space-y-1.5">
                    <span className="text-[10px] text-neutral-400 font-semibold block">
                      Suggested Follow-Ups:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.suggestedFollowUps.map((fu, fIdx) => (
                        <button
                          key={fIdx}
                          onClick={() => handleSendMessage(fu)}
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-[#272727] hover:bg-[#333333] text-neutral-200 border border-[#3A3A3A] hover:border-[#F2C230]/60 transition-all text-left"
                        >
                          {fu} →
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {isTyping && (
          <div className="flex items-center gap-3 text-xs text-neutral-400">
            <div className="w-8 h-8 rounded-lg bg-[#F2C230] text-black font-extrabold flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3.5 rounded-2xl bg-[#1E1E1E] border border-[#2D2D2D] rounded-tl-none flex items-center gap-2">
              <span className="inline-block w-2 h-2 rounded-full bg-[#F2C230] animate-pulse" />
              <span>Study Kit is consulting document evidence...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="shrink-0 pt-2 space-y-2">
        <div className="flex items-center gap-2 pb-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => handleSendMessage("Explain this concept simply, like I'm 5 years old (Feynman technique), prioritizing document evidence if available.")}
            className="px-3 py-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-[11px] text-neutral-300 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
          >
            <Sparkles className="w-3 h-3 text-[#F2C230]" />
            <span>Explain Simply (ELI5)</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Give me a memorable real-world analogy to understand the core concepts in this document.")}
            className="px-3 py-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-[11px] text-neutral-300 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
          >
            <BookOpen className="w-3 h-3 text-[#F2C230]" />
            <span>Real-World Analogy</span>
          </button>
          <button
            type="button"
            onClick={() => handleSendMessage("Break down the most important definitions, formulas, and key takeaways from the text.")}
            className="px-3 py-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#262626] border border-[#2E2E2E] text-[11px] text-neutral-300 whitespace-nowrap cursor-pointer transition-all flex items-center gap-1.5"
          >
            <FileCheck className="w-3 h-3 text-[#F2C230]" />
            <span>Key Breakdown</span>
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="relative flex items-center bg-[#1A1A1A] border border-[#333333] rounded-2xl p-2 focus-within:border-[#F2C230] transition-colors"
        >
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={
              selectedDocument
                ? `Ask anything about ${selectedDocument.name}...`
                : 'Ask any academic question or concept explanation...'
            }
            className="flex-1 bg-transparent px-4 py-2.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isTyping}
            className="px-4 py-2.5 bg-[#F2C230] hover:bg-[#e0b127] text-black font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
