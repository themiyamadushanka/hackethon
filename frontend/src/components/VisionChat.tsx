'use client';

import React, { useState, useRef, useEffect } from 'react';

interface MedicationInfo {
  raw_line: string;
  humanized: string;
}

interface AnalysisData {
  success: boolean;
  mode?: string;
  extracted_text: string;
  lines: string[];
  humanized?: {
    agent_status?: string;
    medications?: MedicationInfo[];
    patient_guidance?: string[];
    empathetic_note?: string;
  };
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  timestamp: string;
  text?: string;
  imageUrl?: string;
  imageName?: string;
  imageSize?: string;
  data?: AnalysisData;
  error?: string;
}

export default function VisionChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      timestamp: 'Just now',
      text: "Hello! I am your **AI Prescription & Medical Assistant** powered by **Azure Computer Vision**.\n\nUpload or drag & drop any prescription image, handwritten doctor's note, or medicine label. I'll read the handwriting, extract the text, and give you clear instructions on dosages and schedules.",
    },
  ]);

  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to latest message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (JPG, PNG, JFIF, WEBP).');
      return;
    }
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const handleSend = async () => {
    if ((!inputText.trim() && !selectedFile) || loading) return;

    const currentText = inputText.trim();
    const currentFile = selectedFile;
    const currentPreview = previewUrl;

    // Reset composer state immediately
    setInputText('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const userMsgId = 'user-' + Date.now();
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: currentText || undefined,
      imageUrl: currentPreview || undefined,
      imageName: currentFile ? currentFile.name : undefined,
      imageSize: currentFile ? formatFileSize(currentFile.size) : undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    // If an image was uploaded, trigger Azure Vision OCR and Analysis
    if (currentFile) {
      setLoadingStep('Uploading image to Azure Computer Vision...');
      try {
        const formData = new FormData();
        formData.append('file', currentFile);

        // Simulated progress steps for better UX
        const stepTimer1 = setTimeout(() => {
          setLoadingStep('Extracting doctor handwriting with Azure Read API...');
        }, 1200);

        const stepTimer2 = setTimeout(() => {
          setLoadingStep('AI Agent interpreting medical dosages & guidance...');
        }, 2800);

        // First attempt Express Gateway (5000), fallback to FastAPI directly (8000)
        let response;
        try {
          response = await fetch('http://localhost:5000/api/v1/vision/analyze', {
            method: 'POST',
            body: formData,
          });
        } catch {
          response = await fetch('http://localhost:8000/api/v1/vision/analyze', {
            method: 'POST',
            body: formData,
          });
        }

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        const data: AnalysisData = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.extracted_text || 'Failed to process image with Azure Vision.');
        }

        const assistantMsg: ChatMessage = {
          id: 'asst-' + Date.now(),
          sender: 'assistant',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          data: data,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        setMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            error: err.message || 'Error communicating with Azure Vision service.',
          },
        ]);
      } finally {
        setLoading(false);
        setLoadingStep('');
      }
    } else {
      // Text-only follow-up question
      setLoadingStep('Consulting Medical AI Assistant...');
      setTimeout(() => {
        let answer = "I'm ready to review your prescription. Please upload an image using the 📎 button or drag & drop!";
        const lower = currentText.toLowerCase();

        if (lower.includes('amoxicillin')) {
          answer = "**Amoxicillin (500mg)**:\n- **Class**: Penicillin-type antibiotic.\n- **Instructions**: Typically taken 3 times a day (every 8 hours) after food.\n- **Important**: Complete the full course prescribed by your doctor even if you feel better.";
        } else if (lower.includes('paracetamol')) {
          answer = "**Paracetamol (500mg)**:\n- **Usage**: Pain relief and fever reduction.\n- **Instructions**: Take 1-2 tablets every 4 to 6 hours as needed. Do not exceed 4000mg (8 tablets) in 24 hours.";
        } else if (lower.includes('cetirizine')) {
          answer = "**Cetirizine (10mg)**:\n- **Usage**: Antihistamine for allergies, runny nose, or itching.\n- **Instructions**: Take 1 tablet once daily, preferably at bedtime as it may cause slight drowsiness.";
        } else if (lower.includes('side effect') || lower.includes('safety')) {
          answer = "Always take antibiotics with water and food. If you experience dizziness, rashes, or nausea, contact your physician immediately.";
        }

        setMessages((prev) => [
          ...prev,
          {
            id: 'asst-txt-' + Date.now(),
            sender: 'assistant',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            text: answer,
          },
        ]);
        setLoading(false);
        setLoadingStep('');
      }, 900);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied extracted prescription text to clipboard!');
  };

  const toggleTextToSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (isSpeaking === msgId) {
      window.speechSynthesis.cancel();
      setIsSpeaking(null);
    } else {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(null);
      setIsSpeaking(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className={`flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all duration-200 ${
        isDragging ? 'ring-4 ring-blue-500/50 bg-blue-50/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/60 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-teal-400 flex items-center justify-center text-white shadow-md text-lg">
            🩺
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              Prescription AI Scanner
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Azure Vision Live
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Extract handwriting, analyze clinical instructions & dosage schedules
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                sender: 'assistant',
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                text: "Chat cleared! Upload any prescription image or handwritten note to extract text with Azure Computer Vision.",
              },
            ]);
          }}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          🗑️ Clear Chat
        </button>
      </div>

      {/* Message Feed */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
            }`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-teal-400 border border-zinc-700'
              }`}
            >
              {msg.sender === 'user' ? '👤' : '🤖'}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-none'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/80 dark:border-zinc-700/60'
              }`}
            >
              {/* Image attachment inside user message */}
              {msg.imageUrl && (
                <div className="mb-3 rounded-xl overflow-hidden border border-white/20 bg-black/20">
                  <img
                    src={msg.imageUrl}
                    alt="Prescription"
                    className="max-h-72 w-full object-contain bg-zinc-950/40 rounded-lg"
                  />
                  {msg.imageName && (
                    <div className="px-3 py-1.5 text-[11px] bg-black/40 flex items-center justify-between">
                      <span className="truncate">{msg.imageName}</span>
                      <span className="opacity-80">{msg.imageSize}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Text message */}
              {msg.text && (
                <div className="text-sm whitespace-pre-wrap leading-relaxed">
                  {msg.text}
                </div>
              )}

              {/* Error Message */}
              {msg.error && (
                <div className="text-sm text-red-600 dark:text-red-400 font-medium">
                  ⚠️ {msg.error}
                </div>
              )}

              {/* Analysis / OCR Response */}
              {msg.data && (
                <div className="space-y-4">
                  {/* Verified Header Badge */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Extracted via Azure Vision Read API ({msg.data.lines.length} lines)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyToClipboard(msg.data?.extracted_text || '')}
                        className="text-xs px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition flex items-center gap-1"
                        title="Copy raw text"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() =>
                          toggleTextToSpeech(
                            msg.id,
                            `Prescription details: ${msg.data?.extracted_text}`
                          )
                        }
                        className="text-xs px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition flex items-center gap-1"
                        title="Read aloud"
                      >
                        {isSpeaking === msg.id ? '⏹️ Stop' : '🔊 Listen'}
                      </button>
                    </div>
                  </div>

                  {/* Humanized Structured Medications */}
                  {msg.data.humanized?.medications && msg.data.humanized.medications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                        💊 Prescribed Medications & Instructions
                      </h4>
                      <div className="grid gap-2">
                        {msg.data.humanized.medications.map((med, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm"
                          >
                            <div className="font-mono text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                              Doctor wrote: &ldquo;{med.raw_line}&rdquo;
                            </div>
                            <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100 flex items-start gap-2">
                              <span className="text-emerald-500 font-bold">✓</span>
                              {med.humanized}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Patient Guidance & Precaution */}
                  {msg.data.humanized?.patient_guidance && (
                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-300 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        ℹ️ Patient Guidance:
                      </span>
                      <ul className="list-disc list-inside space-y-0.5 pl-1 opacity-90">
                        {msg.data.humanized.patient_guidance.map((g, i) => (
                          <li key={i}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Raw Lines Dropdown */}
                  <details className="text-xs group">
                    <summary className="cursor-pointer font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 py-1 flex items-center gap-1">
                      <span>🔍 View all {msg.data.lines.length} raw extracted OCR lines</span>
                    </summary>
                    <div className="mt-2 p-3 rounded-xl bg-zinc-950 text-zinc-200 font-mono text-[11px] max-h-48 overflow-y-auto space-y-0.5 border border-zinc-800">
                      {msg.data.lines.map((line, i) => (
                        <div key={i} className="hover:bg-zinc-900 px-1 py-0.5 rounded">
                          <span className="text-zinc-500 mr-2">{i + 1}.</span>
                          {line}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-[10px] mt-2 opacity-60 text-right ${
                  msg.sender === 'user' ? 'text-blue-100' : 'text-zinc-400'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {/* Loading Spinner / Scanner State */}
        {loading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-teal-400 border border-zinc-700 flex items-center justify-center shrink-0 text-sm">
              🤖
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {loadingStep || 'Processing prescription...'}
                </span>
              </div>
              <div className="w-48 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Selected Image Preview Chip */}
      {previewUrl && (
        <div className="px-6 py-2 bg-blue-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Ready to send"
              className="w-12 h-12 object-cover rounded-lg border border-blue-400 shadow-sm"
            />
            <div>
              <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
                {selectedFile?.name}
              </p>
              <p className="text-[11px] text-zinc-500">
                {selectedFile && formatFileSize(selectedFile.size)} • Ready to scan
              </p>
            </div>
          </div>
          <button
            onClick={removeSelectedFile}
            className="text-xs px-2.5 py-1 rounded-md text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
          >
            ✕ Remove
          </button>
        </div>
      )}

      {/* Chat Composer Bar */}
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          {/* File Attachment Input (hidden) */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelect(e.target.files[0]);
              }
            }}
          />

          {/* Attach Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-blue-600 transition"
            title="Attach prescription image"
          >
            📎
          </button>

          {/* Quick Sample Image Button */}
          <button
            type="button"
            onClick={async () => {
              try {
                // Fetch images.jfif as sample
                const res = await fetch('/images.jfif');
                if (res.ok) {
                  const blob = await res.blob();
                  const file = new File([blob], 'images.jfif', { type: 'image/jpeg' });
                  handleFileSelect(file);
                } else {
                  fileInputRef.current?.click();
                }
              } catch {
                fileInputRef.current?.click();
              }
            }}
            className="hidden sm:inline-flex text-xs px-2.5 py-2 rounded-xl text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 hover:text-zinc-900 dark:hover:text-zinc-100 transition"
            title="Load sample prescription"
          >
            🖼️ Sample
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              selectedFile
                ? 'Add any question or click Send to extract text...'
                : 'Upload prescription or ask medical questions...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-blue-500 focus:bg-white dark:focus:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedFile) || loading}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition flex items-center gap-1.5"
          >
            <span>Send</span>
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
