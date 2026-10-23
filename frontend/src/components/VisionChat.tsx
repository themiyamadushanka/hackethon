'use client';

import React, { useState, useRef, useEffect } from 'react';

interface LeafDiagnosis {
  crop_type: string;
  disease_name: string;
  causative_agent: string;
  severity: string;
  visual_symptoms: string;
  detected_tags: string[];
  organic_treatment: string[];
  chemical_treatment: string[];
  prevention: string[];
  sinhala_summary?: string;
  empathetic_note?: string;
}

interface AnalysisData {
  success: boolean;
  mode?: string;
  caption?: string;
  tags?: { name: string; confidence: number }[];
  diagnosis?: LeafDiagnosis;
  lines?: string[];
  extracted_text?: string;
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
      text: "🌱 **Welcome to AgroVision AI — Crop & Leaf Health Doctor!**\n\nI use **Azure Computer Vision** to inspect leaves, analyze fungal spots, leaf curl, and chlorosis. Upload or drag & drop a photo of any crop leaf (Tomato, Tea, Paddy, Chili, Potato, etc.) to get an instant diagnosis and treatment plan.",
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

    if (currentFile) {
      setLoadingStep('Uploading leaf photo to Azure Computer Vision...');
      try {
        const formData = new FormData();
        formData.append('file', currentFile);

        const stepTimer1 = setTimeout(() => {
          setLoadingStep('Azure Vision analyzing leaf lesions, discolorations & tags...');
        }, 1200);

        const stepTimer2 = setTimeout(() => {
          setLoadingStep('Agro AI Agent diagnosing plant pathology & remedies...');
        }, 2600);

        // Call FastAPI directly on port 8000 for instant response (< 3 seconds), with fallbacks
        let response;
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 9000);
          response = await fetch('http://localhost:8000/api/v1/vision/analyze', {
            method: 'POST',
            body: formData,
            signal: controller.signal,
          });
          clearTimeout(timeoutId);
          if (!response.ok) throw new Error('Port 8000 returned non-200');
        } catch {
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 9000);
            response = await fetch('/api/v1/vision/analyze', {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) throw new Error('Relative fetch returned non-200');
          } catch {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 9000);
            response = await fetch('http://localhost:5000/api/v1/vision/analyze', {
              method: 'POST',
              body: formData,
              signal: controller.signal,
            });
            clearTimeout(timeoutId);
          }
        }

        clearTimeout(stepTimer1);
        clearTimeout(stepTimer2);

        const data: AnalysisData = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.caption || 'Failed to analyze leaf with Azure Vision.');
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
      setLoadingStep('Consulting Agricultural AI Agent...');
      setTimeout(() => {
        let answer = "Please upload a photo of your crop leaf using the 📎 button or drag & drop so I can analyze it with Azure Computer Vision!";
        const lower = currentText.toLowerCase();

        if (lower.includes('neem') || lower.includes('organic')) {
          answer = "🌿 **Organic Neem Oil Recipe**:\n- Mix 5ml pure cold-pressed neem oil + 2ml mild liquid soap in 1 liter of lukewarm water.\n- Shake vigorously and spray in the early morning or evening to avoid leaf burn.\n- Safe for pollinators and highly effective against mites, aphids, and fungal spores.";
        } else if (lower.includes('water') || lower.includes('spray')) {
          answer = "💧 **Best Spraying Practice**:\n- Never spray in direct midday sun to prevent leaf scorching.\n- Spray under-sides of leaves where fungal spores and sucking insects hide.\n- Avoid overhead watering; drip irrigation at the root zone prevents 80% of fungal blights.";
        } else if (lower.includes('tea') || lower.includes('blister')) {
          answer = "🍵 **Tea Blister Blight (Exobasidium vexans)**:\n- Frequent during monsoonal mist and shade.\n- Prune overhead shade trees to allow 6-8 hours of direct sunlight.\n- Spray Copper Hydroxide or Propiconazole immediately after morning dew dries.";
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
      }, 700);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied agricultural diagnosis to clipboard!');
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
      className={`flex flex-col h-[calc(100vh-5rem)] max-w-5xl mx-auto rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-950/60 shadow-2xl overflow-hidden transition-all duration-200 ${
        isDragging ? 'ring-4 ring-emerald-500/50 bg-emerald-50/20' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50/40 dark:bg-zinc-950/70 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-green-600 to-teal-400 flex items-center justify-center text-white shadow-md text-lg">
            🌱
          </div>
          <div>
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              AgroVision AI — Crop & Leaf Doctor
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                Azure Computer Vision
              </span>
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Plant pathology visual inspection, disease detection & organic remedies
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setMessages([
              {
                id: 'welcome',
                sender: 'assistant',
                timestamp: 'Just now',
                text: "Chat cleared! Upload any crop leaf photo to diagnose plant health using Azure Computer Vision.",
              },
            ]);
          }}
          className="text-xs px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
        >
          🗑️ Clear
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
                  ? 'bg-emerald-600 text-white'
                  : 'bg-zinc-800 text-emerald-400 border border-emerald-800/60'
              }`}
            >
              {msg.sender === 'user' ? '👨‍🌾' : '🌿'}
            </div>

            {/* Bubble Content */}
            <div
              className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 shadow-sm ${
                msg.sender === 'user'
                  ? 'bg-emerald-600 text-white rounded-tr-none'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-zinc-100 rounded-tl-none border border-zinc-200/80 dark:border-zinc-700/60'
              }`}
            >
              {/* Image attachment inside user message */}
              {msg.imageUrl && (
                <div className="mb-3 rounded-xl overflow-hidden border border-white/20 bg-black/20">
                  <img
                    src={msg.imageUrl}
                    alt="Plant Leaf"
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

              {/* Agricultural Diagnosis Response */}
              {msg.data?.diagnosis && (
                <div className="space-y-4">
                  {/* Diagnosis Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-700">
                    <div>
                      <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                        🌾 {msg.data.diagnosis.crop_type}
                      </span>
                      <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        {msg.data.diagnosis.disease_name}
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          {msg.data.diagnosis.severity}
                        </span>
                      </h3>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          copyToClipboard(
                            `${msg.data?.diagnosis?.crop_type} - ${msg.data?.diagnosis?.disease_name}\nSymptoms: ${msg.data?.diagnosis?.visual_symptoms}\nRemedies:\n${msg.data?.diagnosis?.organic_treatment.join('\n')}`
                          )
                        }
                        className="text-xs px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition flex items-center gap-1"
                        title="Copy diagnostic report"
                      >
                        📋 Copy
                      </button>
                      <button
                        onClick={() =>
                          toggleTextToSpeech(
                            msg.id,
                            `Diagnosis: ${msg.data?.diagnosis?.disease_name} in ${msg.data?.diagnosis?.crop_type}. Recommended organic treatment: ${msg.data?.diagnosis?.organic_treatment[0]}`
                          )
                        }
                        className="text-xs px-2.5 py-1 rounded bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition flex items-center gap-1"
                        title="Listen to diagnosis"
                      >
                        {isSpeaking === msg.id ? '⏹️ Stop' : '🔊 Listen'}
                      </button>
                    </div>
                  </div>

                  {/* Visual Symptoms Detected by Azure */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                      👁️ Azure Visual Inspection:
                    </span>{' '}
                    <span className="text-zinc-800 dark:text-zinc-200">
                      {msg.data.diagnosis.visual_symptoms}
                    </span>
                  </div>

                  {/* Azure Visual Tags Cloud */}
                  {msg.data.tags && msg.data.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 items-center">
                      <span className="text-[11px] text-zinc-500 mr-1">Azure Tags:</span>
                      {msg.data.tags.map((t, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900"
                        >
                          #{typeof t === 'string' ? t : t.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Sinhala Guidance for Local Farmers */}
                  {msg.data.diagnosis.sinhala_summary && (
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-900 dark:text-emerald-200 space-y-1">
                      <span className="font-bold flex items-center gap-1">
                        🇱🇰 ගොවි උපදෙස (Sinhala Summary):
                      </span>
                      <p className="leading-relaxed">{msg.data.diagnosis.sinhala_summary}</p>
                    </div>
                  )}

                  {/* Organic & Eco-Friendly Treatments */}
                  <div className="p-3.5 rounded-xl bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-xs space-y-1.5">
                    <h4 className="font-bold text-green-800 dark:text-green-300 flex items-center gap-1.5">
                      🌿 Organic & Eco-Friendly Remedies:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                      {msg.data.diagnosis.organic_treatment.map((tr, i) => (
                        <li key={i}>{tr}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Chemical Treatments (Fungicide / Pesticide) */}
                  <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs space-y-1.5">
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                      🧪 Chemical Intervention (If Severe):
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                      {msg.data.diagnosis.chemical_treatment.map((ch, i) => (
                        <li key={i}>{ch}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Prevention Guidelines */}
                  <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 text-xs space-y-1.5">
                    <h4 className="font-bold text-blue-800 dark:text-blue-300 flex items-center gap-1.5">
                      🛡️ Long-term Farm Prevention:
                    </h4>
                    <ul className="list-disc list-inside space-y-1 text-zinc-700 dark:text-zinc-300">
                      {msg.data.diagnosis.prevention.map((pr, i) => (
                        <li key={i}>{pr}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Timestamp */}
              <div
                className={`text-[10px] mt-2 opacity-60 text-right ${
                  msg.sender === 'user' ? 'text-emerald-100' : 'text-zinc-400'
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
            <div className="w-8 h-8 rounded-full bg-zinc-800 text-emerald-400 border border-emerald-700 flex items-center justify-center shrink-0 text-sm">
              🌿
            </div>
            <div className="p-4 rounded-2xl rounded-tl-none bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
                <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                  {loadingStep || 'Analyzing leaf with Azure Computer Vision...'}
                </span>
              </div>
              <div className="w-48 h-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-600 rounded-full animate-pulse w-3/4" />
              </div>
            </div>
          </div>
        )}

        <div ref={chatBottomRef} />
      </div>

      {/* Selected Image Preview Chip */}
      {previewUrl && (
        <div className="px-6 py-2 bg-emerald-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={previewUrl}
              alt="Leaf to inspect"
              className="w-12 h-12 object-cover rounded-lg border border-emerald-400 shadow-sm"
            />
            <div>
              <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200 truncate max-w-xs">
                {selectedFile?.name}
              </p>
              <p className="text-[11px] text-zinc-500">
                {selectedFile && formatFileSize(selectedFile.size)} • Ready for Azure Vision inspection
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
      <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 space-y-2">
        {/* Quick Sample Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-[11px] text-zinc-500 shrink-0">Quick Test:</span>
          <button
            type="button"
            onClick={async () => {
              try {
                const res = await fetch('/sample_leaf.png');
                if (res.ok) {
                  const blob = await res.blob();
                  const file = new File([blob], 'diseased_leaf.png', { type: 'image/png' });
                  handleFileSelect(file);
                } else {
                  fileInputRef.current?.click();
                }
              } catch {
                fileInputRef.current?.click();
              }
            }}
            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 transition shrink-0"
          >
            🍃 Test Sample Leaf
          </button>
          <button
            type="button"
            onClick={() => setInputText('How to prepare organic neem oil spray?')}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition shrink-0"
          >
            🌿 Neem Oil Recipe
          </button>
          <button
            type="button"
            onClick={() => setInputText('How to prevent blister blight in tea?')}
            className="px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 transition shrink-0"
          >
            🍵 Tea Blister Blight
          </button>
        </div>

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
            className="p-2.5 rounded-xl text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-emerald-600 transition"
            title="Attach crop leaf photo"
          >
            📷
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              selectedFile
                ? 'Add notes (e.g. "Tomato crop") or click Send to diagnose...'
                : 'Upload crop leaf photo or ask agricultural questions...'
            }
            className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedFile) || loading}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md transition flex items-center gap-1.5"
          >
            <span>Scan</span>
            <span>➤</span>
          </button>
        </form>
      </div>
    </div>
  );
}
