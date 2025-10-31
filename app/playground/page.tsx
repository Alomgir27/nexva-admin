"use client";

import { useState, useRef, useEffect } from "react";
import {
  Send,
  RefreshCw,
  MessageSquare,
  Mic,
  MicOff,
  Volume2,
  Loader,
  Save,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { API_BASE_URL, buildWebSocketUrl } from "@/app/config/api";

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"text" | "voice">("text");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [supportRequested, setSupportRequested] = useState(false);
  const [currentConversationId, setCurrentConversationId] = useState<number | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const voiceMessagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [currentUserInput, setCurrentUserInput] = useState("");
  const [assistantMessages, setAssistantMessages] = useState<Array<string>>([]);
  const [isAssistantTyping, setIsAssistantTyping] = useState(false);
  const [isSendingToBackend, setIsSendingToBackend] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [volumeLevel, setVolumeLevel] = useState<'low' | 'good'>('low');
  const audioQueueRef = useRef<Array<{ audio: HTMLAudioElement; url: string }>>([]);
  const isPlayingRef = useRef(false);
  const shouldPauseMicRef = useRef(false);
  const lastRestartTimeRef = useRef<number>(0);
  const processingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const savedKey = localStorage.getItem("nexva_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    voiceMessagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [assistantMessages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current && recognitionRef.current.recognition) {
        try {
          recognitionRef.current.recognition.stop();
        } catch (e) {}
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Audio level monitoring
  const startAudioMonitoring = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      
      analyser.smoothingTimeConstant = 0.8;
      analyser.fftSize = 512;
      microphone.connect(analyser);
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      const checkAudioLevel = () => {
        if (!analyserRef.current) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / bufferLength;
        
        if (average < 20) {
          setVolumeLevel('low');
        } else {
          setVolumeLevel('good');
        }
        
        if (audioContextRef.current) {
          requestAnimationFrame(checkAudioLevel);
        }
      };
      
      checkAudioLevel();
      return stream;
    } catch (error) {
      console.error('Audio monitoring error:', error);
      return null;
    }
  };

  const stopAudioMonitoring = () => {
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (analyserRef.current) {
      analyserRef.current = null;
    }
    setVolumeLevel('low');
  };

  const playNextAudio = () => {
    if (audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setTimeout(() => {
        shouldPauseMicRef.current = false;
      }, 200);
      return;
    }

    isPlayingRef.current = true;
    shouldPauseMicRef.current = true;
    const audioData = audioQueueRef.current.shift()!;
    const audio = audioData.audio;
    const url = audioData.url;
    
    audio.onended = () => {
      URL.revokeObjectURL(url);
      playNextAudio();
    };
    
    audio.onerror = () => {
      URL.revokeObjectURL(url);
      playNextAudio();
    };
    
    audio.play().catch(err => {
      console.error('Audio play failed:', err);
      URL.revokeObjectURL(url);
      playNextAudio();
    });
  };

  const queueAudio = (audioBlob: Blob) => {
    const audioUrl = URL.createObjectURL(audioBlob);
    const audio = new Audio(audioUrl);
    
    audioQueueRef.current.push({ audio, url: audioUrl });
    
    if (!isPlayingRef.current) {
      playNextAudio();
    }
  };

  // Save API key to localStorage
  const saveApiKey = () => {
    localStorage.setItem("nexva_api_key", apiKey);
    alert("API Key saved locally!");
  };

  // Real-time speech recognition using Web Speech API
  const startRealtimeTranscription = async () => {
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        alert('Speech recognition not supported in this browser. Please use Chrome or Edge.');
        return;
      }

      await startAudioMonitoring();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      let finalTranscript = "";
      let silenceTimer: NodeJS.Timeout | null = null;
      let tempMessageIndex = -1;
      const SILENCE_DURATION = 2000;

      recognition.onstart = () => {
        setIsListening(true);
        setInterimTranscript("");
        
        setMessages((prev) => {
          const newMessages = [...prev, { role: "user", content: "" }];
          tempMessageIndex = newMessages.length - 1;
          return newMessages;
        });
      };

      recognition.onresult = (event: any) => {
        let interimText = "";
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += (finalTranscript ? " " : "") + transcript;
          } else {
            interimText += transcript;
          }
        }

        const displayText = finalTranscript + (interimText ? " " + interimText : "");
        
        setMessages((prev) =>
          prev.map((msg, idx) => 
            idx === tempMessageIndex ? { ...msg, content: displayText } : msg
          )
        );

        if (silenceTimer) clearTimeout(silenceTimer);
        
        const fullText = finalTranscript + (interimText ? " " + interimText : "");
        if (fullText.trim()) {
          silenceTimer = setTimeout(() => {
            const textToSend = (finalTranscript + (interimText ? " " + interimText : "")).trim();
            if (textToSend) {
              recognition.stop();
              setIsListening(false);
              stopAudioMonitoring();
              sendTextMessage(textToSend, { reuseIndex: tempMessageIndex });
              finalTranscript = "";
              tempMessageIndex = -1;
            }
          }, SILENCE_DURATION);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error !== 'no-speech' && event.error !== 'aborted') {
          setMessages((prev) => 
            prev.filter((_, idx) => idx !== tempMessageIndex)
          );
          alert(`Recognition error: ${event.error}`);
        }
        setIsListening(false);
        stopAudioMonitoring();
      };

      recognition.onend = () => {
        if (silenceTimer) clearTimeout(silenceTimer);
        
        if (!finalTranscript.trim() && tempMessageIndex !== -1) {
          setMessages((prev) => prev.filter((_, idx) => idx !== tempMessageIndex));
        }
        
        setIsListening(false);
        setInterimTranscript("");
        stopAudioMonitoring();
      };

      recognitionRef.current = { recognition };
      recognition.start();

    } catch (error) {
      alert("Speech recognition failed. Please check browser compatibility.");
      setIsListening(false);
      stopAudioMonitoring();
    }
  };

  const stopRealtimeTranscription = () => {
    if (recognitionRef.current && recognitionRef.current.recognition) {
      try {
        recognitionRef.current.recognition.stop();
        recognitionRef.current = null;
      } catch (e) {
        console.log('Recognition stop error:', e);
      }
    }
    
    setIsListening(false);
    setInterimTranscript("");
    stopAudioMonitoring();
  };

  const sendTextMessage = async (overrideContent?: string, options?: { reuseIndex?: number }) => {
    const textToSend = (overrideContent ?? message).trim();
    if (!textToSend || loading) return;

    const reuseIndex = options?.reuseIndex ?? -1;

    if (reuseIndex >= 0) {
      setMessages((prev) =>
        prev.map((msg, idx) => (idx === reuseIndex ? { ...msg, content: textToSend } : msg))
      );
    } else {
      setMessages((prev) => [...prev, { role: "user", content: textToSend }]);
    }

    setMessage("");
    setLoading(true);

    try {
      const ws = new WebSocket(buildWebSocketUrl(`/ws/chat/${apiKey}`));
      let assistantMessage = "";
      let assistantIndex = -1;
      
      ws.onopen = () => {
        ws.send(JSON.stringify({
          message: textToSend,
          session_id: "playground-session"
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === 'chunk') {
          assistantMessage += data.text;

          if (assistantIndex === -1) {
            setMessages((prev) => {
              const newMessages = [...prev, { role: "assistant", content: assistantMessage }];
              assistantIndex = newMessages.length - 1;
              return newMessages;
            });
          } else {
            const idxToUpdate = assistantIndex;
            setMessages((prev) =>
              prev.map((msg, idx) => (idx === idxToUpdate ? { ...msg, content: assistantMessage } : msg))
            );
          }
        } else if (data.type === 'complete') {
          setLoading(false);
          if (data.conversation_id) {
            setCurrentConversationId(data.conversation_id);
          }
          ws.close();
        }
      };

      ws.onerror = () => {
        setMessages(prev => [...prev, { 
          role: "system", 
          content: "❌ Connection error. Make sure backend is running." 
        }]);
        setLoading(false);
      };

      ws.onclose = () => {
        setLoading(false);
      };
    } catch (error) {
      setMessages(prev => [...prev, { role: "system", content: `❌ Error: ${error}` }]);
      setLoading(false);
    }
  };

  const startVoiceChat = async () => {
    if (isRecording) {
      stopVoiceChat();
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (!SpeechRecognition) {
        setAssistantMessages(prev => [...prev, '❌ Speech recognition not supported in this browser. Please use Chrome or Edge.']);
        return;
      }

      await startAudioMonitoring();

      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognitionRef.current = { recognition };
      
      const ws = new WebSocket(buildWebSocketUrl(`/ws/voice-chat/${apiKey}`));
      wsRef.current = ws;
      
      let currentText = "";
      let isSending = false;

      recognition.onstart = () => {
        setIsRecording(true);
        console.log("🎤 START");
      };

      recognition.onresult = (event: any) => {
        if (shouldPauseMicRef.current || isSending) return;
        
        let fullText = "";
        for (let i = 0; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            fullText += event.results[i][0].transcript + " ";
          }
        }
        
        currentText = fullText.trim();
        setCurrentUserInput(currentText);
        
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
        
        if (currentText) {
          processingTimeoutRef.current = setTimeout(() => {
            if (currentText && !isSending && ws.readyState === WebSocket.OPEN) {
              isSending = true;
              console.log("📤 SEND:", currentText);
              
              ws.send(JSON.stringify({
                type: "text_query",
                text: currentText
              }));
            }
          }, 3000);
        }
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        
        if (event.error === 'no-speech') {
          // No speech detected - this is normal, just restart
          return;
        }
        
        if (event.error === 'aborted') {
          // Intentionally stopped
          return;
        }
        
        if (event.error === 'network') {
          console.error('Network error - will retry');
          return;
        }
        
        // For serious errors, try to recover
        console.log('Recognition error, attempting recovery...');
      };

      recognition.onend = () => {
        if (isRecording && recognitionRef.current && !shouldPauseMicRef.current) {
          const now = Date.now();
          const timeSinceLastRestart = now - lastRestartTimeRef.current;
          
          if (timeSinceLastRestart > 300) {
            lastRestartTimeRef.current = now;
            
            setTimeout(() => {
              if (recognitionRef.current && isRecording) {
                try {
                  recognition.start();
                } catch (e) {
                  setTimeout(() => {
                    if (recognitionRef.current && isRecording) {
                      try {
                        recognition.start();
                      } catch (retryError) {
                        console.error('Recognition restart failed:', retryError);
                      }
                    }
                  }, 500);
                }
              }
            }, 100);
          }
        }
      };

      ws.onopen = () => {
        recognition.start();
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        
        if (data.type === "response_start") {
          console.log("📝 START");
          setAssistantMessages(prev => [...prev, ""]);
        } else if (data.type === "text_chunk") {
          setAssistantMessages(prev => {
            if (prev.length === 0) return [data.text];
            const updated = [...prev];
            updated[updated.length - 1] += data.text;
            return updated;
          });
        } else if (data.type === "audio_chunk") {
          const audioBlob = new Blob([Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))], { type: 'audio/wav' });
          queueAudio(audioBlob);
        } else if (data.type === "response_end") {
          console.log("✅ DONE");
          currentText = "";
          isSending = false;
          setCurrentUserInput("");
        } else if (data.type === "error") {
          setAssistantMessages(prev => [...prev, `❌ ${data.message}`]);
        }
      };

      ws.onerror = () => {
        setAssistantMessages(prev => [...prev, '❌ Connection error']);
        stopVoiceChat();
      };

      ws.onclose = () => {
        if (processingTimeoutRef.current) {
          clearTimeout(processingTimeoutRef.current);
        }
      };

    } catch (error) {
      console.error("Error starting voice chat:", error);
      setAssistantMessages(prev => [...prev, "❌ Failed to start voice chat"]);
    }
  };

  const stopVoiceChat = () => {
    if (recognitionRef.current && recognitionRef.current.recognition) {
      try {
        recognitionRef.current.recognition.stop();
        recognitionRef.current = null;
      } catch (e) {
        console.log('Recognition stop error:', e);
      }
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "stop" }));
      wsRef.current.close();
    }
    
    // Clear audio queue properly
    audioQueueRef.current.forEach(({audio, url}) => {
      audio.pause();
      URL.revokeObjectURL(url);
    });
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    shouldPauseMicRef.current = false;
    
    setIsRecording(false);
    stopAudioMonitoring();
  };

  const clearMessages = () => {
    setMessages([]);
    setAssistantMessages([]);
    setCurrentUserInput("");
    setSupportRequested(false);
    setCurrentConversationId(null);
    setIsAssistantTyping(false);
  };

  const requestSupport = async () => {
    if (!currentConversationId) {
      alert("No active conversation to request support for");
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/conversations/${currentConversationId}/request-support`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (response.ok) {
        setSupportRequested(true);
        setMessages((prev) => [
          ...prev,
          {
            role: "system",
            content:
              "✅ Support requested! A team member will assist you shortly.",
          },
        ]);
      } else {
        const data = await response.json();
        alert(data.detail || "Failed to request support");
      }
    } catch (error) {
      alert("Failed to request support");
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-bg-base-default)]">
      <nav className="border-b border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-secondary)]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <Image src="/images/img.png" alt="Nexva" width={32} height={32} className="rounded-lg" />
              <span className="text-xl font-semibold text-[var(--text-text-default)]">Nexva</span>
            </div>
            <span className="text-[var(--text-text-tertiary)]">/</span>
            <span className="text-[var(--text-text-secondary)]">Playground</span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--text-text-default)] mb-2">Playground</h1>
          <p className="text-[var(--text-text-secondary)]">Test your chatbot with text or voice</p>
        </div>

        <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 mb-6">
          <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">API Key</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="flex-1 px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] font-mono text-sm focus:outline-none focus:border-[var(--bg-bg-brand)]"
            />
            <button
              onClick={saveApiKey}
              disabled={!apiKey.trim()}
              className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "text"
                ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]"
                : "bg-[var(--bg-bg-overlay-l1)] text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l2)]"
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Text Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
              activeTab === "voice"
                ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]"
                : "bg-[var(--bg-bg-overlay-l1)] text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l2)]"
            }`}
          >
            <Volume2 className="h-5 w-5" />
            <span>Voice Chat</span>
          </button>
        </div>

        {activeTab === "text" ? (
          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-text-default)]">Text Chat</h2>
              <div className="flex space-x-2">
                {!supportRequested && messages.length > 0 && (
                  <button
                    onClick={requestSupport}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm text-white transition-all"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Talk to Human</span>
                  </button>
                )}
                <button
                  onClick={clearMessages}
                  className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg text-sm text-[var(--text-text-secondary)] transition-all"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="bg-[var(--bg-bg-base-secondary)] rounded-lg p-4 mb-4 h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--text-text-tertiary)]">
                  <p>No messages yet. Start chatting!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.filter(msg => msg.content.trim() !== '' || msg.role === 'user').map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.role === "user"
                          ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] ml-12"
                          : msg.role === "assistant"
                          ? "bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] mr-12"
                          : "bg-[var(--bg-bg-overlay-l1)] text-[var(--text-text-secondary)]"
                      }`}
                    >
                      <div className="text-xs font-medium mb-1 opacity-70">{msg.role}</div>
                      {msg.content.trim() === '' && msg.role === 'user' ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : (
                        <div className={`text-sm max-w-none ${msg.role === "assistant" ? "prose prose-invert" : ""}`}>
                        {msg.role === "assistant" ? (
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              code({ node, inline, className, children, ...props }: any) {
                                const match = /language-(\w+)/.exec(className || "");
                                return !inline && match ? (
                                  <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    className="rounded-lg my-2"
                                    {...props}
                                  >
                                    {String(children).replace(/\n$/, "")}
                                  </SyntaxHighlighter>
                                ) : (
                                  <code className="bg-[var(--bg-bg-base-secondary)] px-1.5 py-0.5 rounded text-xs font-mono" {...props}>
                                    {children}
                                  </code>
                                );
                              },
                              a({ node, children, href, ...props }: any) {
                                return (
                                  <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[var(--bg-bg-brand)] hover:underline hover:text-[var(--bg-bg-brand-hover)] transition-colors"
                                    {...props}
                                  >
                                    {children}
                                  </a>
                                );
                              },
                              p({ node, children, ...props }: any) {
                                return <p className="my-2 leading-relaxed" {...props}>{children}</p>;
                              },
                              ul({ node, children, ...props }: any) {
                                return <ul className="my-2 ml-4 list-disc space-y-1" {...props}>{children}</ul>;
                              },
                              ol({ node, children, ...props }: any) {
                                return <ol className="my-2 ml-4 list-decimal space-y-1" {...props}>{children}</ol>;
                              },
                              li({ node, children, ...props }: any) {
                                return <li className="leading-relaxed" {...props}>{children}</li>;
                              },
                              h1({ node, children, ...props }: any) {
                                return <h1 className="text-xl font-semibold mt-4 mb-2" {...props}>{children}</h1>;
                              },
                              h2({ node, children, ...props }: any) {
                                return <h2 className="text-lg font-semibold mt-3 mb-2" {...props}>{children}</h2>;
                              },
                              h3({ node, children, ...props }: any) {
                                return <h3 className="text-base font-semibold mt-2 mb-1" {...props}>{children}</h3>;
                              },
                              blockquote({ node, children, ...props }: any) {
                                return (
                                  <blockquote 
                                    className="border-l-3 border-[var(--bg-bg-brand)] pl-4 italic my-3 text-[var(--text-text-secondary)]" 
                                    {...props}
                                  >
                                    {children}
                                  </blockquote>
                                );
                              },
                              strong({ node, children, ...props }: any) {
                                return <strong className="font-semibold text-[var(--text-text-default)]" {...props}>{children}</strong>;
                              },
                            }}
                          >
                            {msg.content}
                          </ReactMarkdown>
                        ) : (
                          <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                        )}
                        </div>
                      )}
                    </div>
                  ))}
                  {loading && messages.length > 0 && messages[messages.length - 1].role !== 'assistant' && (
                    <div className="p-3 rounded-lg bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] mr-12">
                      <div className="text-xs font-medium mb-1 opacity-70">assistant</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-[var(--text-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-2 h-2 bg-[var(--text-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-2 h-2 bg-[var(--text-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={message + (interimTranscript ? ' ' + interimTranscript : '')}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && !loading && sendTextMessage()}
                placeholder="Type your message or use voice..."
                className="flex-1 px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)]"
                disabled={isListening}
              />
              <button
                onClick={() => (isListening ? stopRealtimeTranscription() : startRealtimeTranscription())}
                className={`relative px-4 py-3 rounded-lg transition-all flex items-center justify-center ${
                  isListening 
                    ? volumeLevel === 'low'
                      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                      : "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] text-[var(--text-text-default)]"
                }`}
              >
                {isListening && (
                  <span className="absolute inset-0 rounded-lg">
                    <span className={`absolute inset-0 rounded-lg ${
                      volumeLevel === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                    } opacity-75 animate-ping`}></span>
                    <span className={`absolute inset-0 rounded-lg ${
                      volumeLevel === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                    } opacity-50`} style={{animation: 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></span>
                  </span>
                )}
                <span className="relative z-10">
                  <Mic className="h-5 w-5" />
                </span>
              </button>
              <button
                id="send-button"
                onClick={() => sendTextMessage()}
                disabled={loading || !message.trim()}
                className="px-6 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all flex items-center space-x-2"
              >
                {loading ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span>{loading ? "Sending..." : "Send"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-text-default)]">Voice Chat</h2>
              <button
                onClick={clearMessages}
                className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg text-sm text-[var(--text-text-secondary)] transition-all"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>

            <div className="bg-[var(--bg-bg-base-secondary)] rounded-lg p-4 mb-4 h-96 overflow-y-auto">
              {/* Assistant responses with spacing between paragraphs */}
              {assistantMessages.length > 0 && (
                <div className="space-y-6 mb-6">
                  {assistantMessages.map((content, idx) => (
                    <div key={idx}>
                      {idx > 0 && (
                        <div className="border-t-2 border-[var(--border-border-neutral-l1)] mb-6"></div>
                      )}
                      <div className="space-y-2 bg-[var(--bg-bg-overlay-l1)] p-4 rounded-lg">
                        <div className="text-xs font-medium text-[var(--text-text-secondary)]">
                          assistant • Response {idx + 1}
                        </div>
                        <div className="text-sm text-[var(--text-text-default)] whitespace-pre-wrap">
                          {content}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Typing indicator */}
              {isAssistantTyping && (
                <div className="space-y-2 mb-6">
                  <div className="text-xs font-medium text-[var(--text-text-secondary)]">
                    assistant
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-[var(--text-text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--text-text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-[var(--text-text-secondary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}
              
              {/* Empty state */}
              {!currentUserInput && assistantMessages.length === 0 && !isAssistantTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-lg font-medium text-[var(--text-text-default)] mb-2">
                    {isRecording ? "Listening..." : "Click microphone below to start"}
                  </p>
                  <p className="text-sm text-[var(--text-text-tertiary)]">
                    Real-time speech recognition
                  </p>
                </div>
              )}
              
              <div ref={voiceMessagesEndRef} />
            </div>

            {/* User text - floating display */}
            {currentUserInput && (
              <div className="mb-4 flex justify-center">
                <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg max-w-md">
                  <p className="text-sm text-[var(--text-text-default)] whitespace-pre-wrap leading-relaxed">
                    {currentUserInput}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center">{/* Mic button */}
              <button
                onClick={isRecording ? stopVoiceChat : startVoiceChat}
                className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                  isRecording
                    ? volumeLevel === 'low'
                      ? "bg-yellow-500 hover:bg-yellow-600"
                      : "bg-red-500 hover:bg-red-600"
                    : "bg-[var(--bg-bg-brand)] hover:bg-[var(--bg-bg-brand-hover)]"
                }`}
              >
                {isRecording && (
                  <span className="absolute inset-0 rounded-full">
                    <span className={`absolute inset-0 rounded-full ${
                      volumeLevel === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                    } opacity-75 animate-ping`}></span>
                    <span className={`absolute inset-0 rounded-full ${
                      volumeLevel === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                    } opacity-50`} style={{animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite'}}></span>
                  </span>
                )}
                <span className="relative z-10">
                  <Mic className="h-10 w-10 text-[var(--text-text-onbrand)]" />
                </span>
              </button>
            </div>

            <div className="mt-4 p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-xs text-[var(--text-text-tertiary)]">
                <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                <p className="text-center">
                  {isRecording ? (shouldPauseMicRef.current ? 'AI speaking' : 'Listening') : 'Click mic to start'}
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
