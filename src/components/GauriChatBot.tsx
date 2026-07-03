import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Send, 
  X, 
  Sparkles, 
  RotateCcw, 
  User, 
  Bot, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  TrendingUp
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  text: string;
  timestamp: Date;
}

interface GauriChatBotProps {
  setCurrentPage?: (page: "jobs" | "exams" | "pdf" | "mock" | "selection" | "about" | "contact" | "terms" | "privacy" | "sitemap") => void;
  currentPage?: string;
}

function detectPageFromText(text: string): "jobs" | "exams" | "pdf" | "mock" | "selection" | null {
  const lowercase = text.toLowerCase();
  if (lowercase.includes("mock test") || lowercase.includes("practice mock") || lowercase.includes("test series") || lowercase.includes("mock exam")) {
    return "mock";
  }
  if (lowercase.includes("syllabus") || lowercase.includes("exam pattern") || lowercase.includes("upcoming exam") || lowercase.includes("exam details") || lowercase.includes("bharti exam")) {
    return "exams";
  }
  if (lowercase.includes("pdf") || lowercase.includes("pyq") || lowercase.includes("paper pdf") || lowercase.includes("question paper")) {
    return "pdf";
  }
  if (lowercase.includes("selection portal") || lowercase.includes("premium") || lowercase.includes("get selection") || lowercase.includes("selection pass")) {
    return "selection";
  }
  if (lowercase.includes("job alert") || lowercase.includes("recruitment") || lowercase.includes("bharti alert") || lowercase.includes("jobs")) {
    return "jobs";
  }
  return null;
}

export function GauriChatBot({ setCurrentPage, currentPage }: GauriChatBotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "नमस्कार! I am Gauri, your MaziExam guide and companion. 🌟 Let's fuel your preparation journey! Whether you want to know about MPSC syllabus, police bharti patterns, or need a strong dose of motivation, I am here. Tell me, how can I help you succeed today?",
      timestamp: new Date(),
    }
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(true);
  const [speechSupported, setSpeechSupported] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Check speech recognition support
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      setSpeechSupported(true);
    }
  }, []);

  // Scroll to bottom when messages list updates
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Handle read-aloud using SpeechSynthesis
  const speakText = (text: string) => {
    if (!isVoiceEnabled) return;
    try {
      window.speechSynthesis.cancel();
      // Remove symbols & asterisks before speaking
      const cleanText = text
        .replace(/\*+/g, "")
        .replace(/#+/g, "")
        .replace(/`+/g, "")
        .replace(/_+/g, "")
        .replace(/[:\-]/g, " ");

      const utterance = new SpeechSynthesisUtterance(cleanText);
      
      const voices = window.speechSynthesis.getVoices();
      const preferredVoice = voices.find(v => 
        v.lang.includes("en-IN") || 
        v.lang.includes("hi-IN") || 
        v.lang.includes("mr-IN") ||
        v.name.includes("Google") || 
        v.name.includes("India")
      );
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }
      utterance.rate = 0.95; // Slightly slower for crisp articulation
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error("Speech Synthesis Error:", e);
    }
  };

  // Stop active speech synthesis
  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
  };

  // Send message to Express API
  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    // Auto-navigate to appropriate page if page state handler is passed
    if (setCurrentPage) {
      const detected = detectPageFromText(textToSend);
      if (detected) {
        setCurrentPage(detected);
      }
    }

    const userMessage: Message = {
      id: Math.random().toString(),
      role: "user",
      text: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);
    stopSpeaking();

    try {
      // Map message structure for backend
      const formattedHistory = [...messages, userMessage].map(msg => ({
        role: msg.role,
        text: msg.text
      }));

      const response = await fetch("/api/gauri-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: formattedHistory }),
      });

      if (!response.ok) {
        throw new Error("Failed to communicate with Gauri Server");
      }

      const data = await response.json();
      const assistantText = data.text || "I am reflecting on your journey! Please try again in a moment.";

      const assistantMessage: Message = {
        id: Math.random().toString(),
        role: "assistant",
        text: assistantText,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      speakText(assistantText);
    } catch (error) {
      console.error("Chat Error:", error);
      setMessages(prev => [
        ...prev,
        {
          id: Math.random().toString(),
          role: "assistant",
          text: "I am experiencing a slight server connection delay, but remember: 'Success is not final, failure is not fatal: it is the courage to continue that counts!' Please try again, champ! 💪🔥",
          timestamp: new Date(),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Dictate query using SpeechRecognition
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please try Google Chrome or Safari.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-IN"; // optimal for Indian accent (English/Hindi/Marathi combos)
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onerror = (event: any) => {
      console.error("Recognition Error", event);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.onresult = (event: any) => {
      const speechToText = event.results[0][0].transcript;
      if (speechToText.trim()) {
        setInputText(speechToText);
      }
    };

    recognition.start();
  };

  // Preset question pills
  const presetQuestions = [
    { text: "MPSC Syllabus & Pattern?", icon: "📚" },
    { text: "How to stay motivated?", icon: "🔥" },
    { text: "Next Police Bharti Exam?", icon: "🚓" },
    { text: "How to prepare CSAT?", icon: "📐" },
  ];

  return (
    <div id="gauri-chatbot-container" className="font-sans">
      {/* FLOATING TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute -top-12 right-0 bg-white text-slate-800 text-[10px] font-extrabold uppercase px-3 py-1.5 rounded-full border border-slate-200 shadow-md select-none whitespace-nowrap flex items-center gap-1"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Talk to Gauri
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          id="gauri-trigger-btn"
          onClick={() => {
            setIsOpen(!isOpen);
            if (isOpen) {
              stopSpeaking();
            }
          }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-16 h-16 rounded-full cursor-pointer focus:outline-none flex items-center justify-center shadow-2xl transition-all duration-300"
        >
          {/* Pulsing ambient outer glow rings */}
          <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-[#004aad] via-indigo-400 to-[#004aad]/60 blur-xs opacity-40 animate-pulse -z-10" />
          
          {/* Logo container */}
          <div className="w-full h-full rounded-full border-2 border-white overflow-hidden bg-slate-50 flex items-center justify-center shadow-md">
            <img 
              src="https://isxhcatn0reqvwnv.public.blob.vercel-storage.com/Untitled%20design.png" 
              alt="Gauri Logo" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Active status indicator dot */}
          <span className="absolute bottom-0.5 right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
            <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
          </span>
        </motion.button>
      </div>

      {/* COMPACT FLOATING CHAT WINDOW */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="gauri-chat-window"
            ref={chatWindowRef}
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", damping: 20 }}
            className="fixed bottom-24 right-6 w-[350px] sm:w-[380px] h-[520px] bg-white border border-slate-200 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden text-left"
          >
            {/* Header section with light layout */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="relative w-9 h-9 rounded-full border border-slate-200 overflow-hidden bg-slate-50">
                  <img 
                    src="https://isxhcatn0reqvwnv.public.blob.vercel-storage.com/Untitled%20design.png" 
                    alt="Gauri Avatar" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-black text-[#004aad] uppercase tracking-wider">Gauri</span>
                    <Sparkles size={11} className="text-[#004aad] fill-[#004aad] animate-pulse" />
                  </div>
                  <p className="text-[9px] text-emerald-600 font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    Online Academic Guide
                  </p>
                </div>
              </div>

              {/* Header Right Action Panel */}
              <div className="flex items-center gap-1.5">
                {/* Voice Read-Aloud Toggle Button */}
                <button
                  onClick={() => {
                    setIsVoiceEnabled(!isVoiceEnabled);
                    if (isVoiceEnabled) {
                      stopSpeaking();
                    }
                  }}
                  className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                    isVoiceEnabled ? "bg-[#004aad]/10 text-[#004aad] hover:bg-[#004aad]/20" : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                  }`}
                  title={isVoiceEnabled ? "Speech Read-Aloud: Active" : "Speech Read-Aloud: Muted"}
                >
                  {isVoiceEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
                </button>

                {/* Reset Conversation Button */}
                <button
                  onClick={() => {
                    setMessages([
                      {
                        id: "welcome-reset",
                        role: "assistant",
                        text: "Fresh energy loaded! 🔋 Let's restart our study plan, warrior. Ask me any study-related question, pattern query, or state exam syllabus, and let's win this day!",
                        timestamp: new Date(),
                      }
                    ]);
                    stopSpeaking();
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                  title="Clear conversation"
                >
                  <RotateCcw size={14} />
                </button>

                {/* Close Button */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    stopSpeaking();
                  }}
                  className="p-1.5 rounded-lg bg-slate-100 text-slate-500 hover:text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* MESSAGE CHAT PANEL */}
            <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 space-y-4 scrollbar-thin scrollbar-thumb-slate-200">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-2 items-start ${
                    msg.role === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Small profile icon */}
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "user" ? "bg-[#004aad] text-white" : "bg-slate-100 text-[#004aad] border border-slate-200"
                  }`}>
                    {msg.role === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>

                  {/* Message bubble */}
                  <div className="flex flex-col gap-1 max-w-[80%]">
                    <div className={`px-3 py-2 rounded-xl text-xs leading-relaxed shadow-xs font-sans whitespace-pre-line ${
                      msg.role === "user"
                        ? "bg-[#004aad] text-white rounded-tr-xs"
                        : "bg-white text-slate-800 border border-slate-200 rounded-tl-xs"
                    }`}>
                      {msg.text}
                    </div>

                    {/* Speaker icon for repeating audio */}
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 pl-1 mt-1">
                        <button
                          onClick={() => speakText(msg.text)}
                          className="text-[9px] font-bold text-[#004aad] hover:text-[#004aad]/80 flex items-center gap-1 uppercase tracking-wider cursor-pointer transition-colors"
                        >
                          <Volume2 size={10} />
                          Speak
                        </button>

                        {/* Interactive dynamic page action button inside Gauri's message */}
                        {(() => {
                          const targetPage = detectPageFromText(msg.text);
                          if (targetPage && setCurrentPage) {
                            const pageNames: Record<string, string> = {
                              mock: "Mock Tests",
                              exams: "Upcoming Exams",
                              pdf: "Paper PDFs",
                              selection: "Get Selection",
                              jobs: "Job Alerts"
                            };
                            return (
                              <button
                                onClick={() => setCurrentPage(targetPage)}
                                className="text-[9px] font-black text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1 transition-all border border-emerald-200/50 cursor-pointer"
                              >
                                <span>View {pageNames[targetPage]} Page</span>
                                <ArrowRight size={9} />
                              </button>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Loading thinking state */}
              {isLoading && (
                <div className="flex gap-2 items-start">
                  <div className="w-6 h-6 rounded-full bg-slate-100 text-[#004aad] border border-slate-200 flex items-center justify-center">
                    <Bot size={12} />
                  </div>
                  <div className="bg-white border border-slate-200 px-3 py-2.5 rounded-xl rounded-tl-xs max-w-[80%] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004aad] animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004aad] animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-[#004aad] animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              )}

              {/* Preset suggestion pills (Shown initially or whenever screen is clear) */}
              {messages.length === 1 && !isLoading && (
                <div className="mt-4 pt-2 border-t border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2 flex items-center gap-1">
                    <TrendingUp size={10} /> Quick Questions
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    {presetQuestions.map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(q.text)}
                        className="p-2 bg-slate-50 hover:bg-white hover:border-[#004aad]/45 border border-slate-200 rounded-xl text-[11px] font-semibold text-slate-600 hover:text-[#004aad] text-left transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{q.icon}</span>
                        <span className="truncate">{q.text}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* INPUT PANEL CONTROLS */}
            <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-2">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (inputText.trim()) {
                    handleSendMessage(inputText);
                  }
                }}
                className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 focus-within:border-[#004aad]/45 transition-colors"
              >
                {/* Voice Input Trigger Icon */}
                {speechSupported && (
                  <button
                    type="button"
                    onClick={startListening}
                    className={`p-2 rounded-lg transition-colors cursor-pointer shrink-0 ${
                      isListening 
                        ? "bg-red-500 text-white animate-pulse" 
                        : "text-slate-400 hover:text-[#004aad] hover:bg-slate-100"
                    }`}
                    title={isListening ? "Listening..." : "Dictate with your voice"}
                  >
                    {isListening ? <MicOff size={15} /> : <Mic size={15} />}
                  </button>
                )}

                {/* Input Text Field */}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={isListening ? "Listening..." : "Ask Gauri about syllabus, jobs..."}
                  className="w-full bg-transparent text-slate-800 placeholder-slate-400 text-xs focus:outline-none px-1.5 py-2"
                  disabled={isLoading}
                />

                {/* Submit Send Button */}
                <button
                  type="submit"
                  disabled={!inputText.trim() || isLoading}
                  className={`p-2 rounded-lg transition-all shrink-0 ${
                    inputText.trim() && !isLoading
                      ? "bg-[#004aad] text-white hover:scale-105 cursor-pointer"
                      : "text-slate-300 cursor-not-allowed"
                  }`}
                >
                  <Send size={14} />
                </button>
              </form>

              {/* Informative footer */}
              <p className="text-[9px] text-center text-slate-400 select-none">
                Maharashtra Exam Helper • Motivated for Your Success 🏆
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
