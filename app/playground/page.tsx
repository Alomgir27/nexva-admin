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

const VOICE_QUERY_DEBOUNCE_MS = 900;

export default function PlaygroundPage() {
  const [activeTab, setActiveTab] = useState<"text" | "voice">("text");
  const [apiKey, setApiKey] = useState("");
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string, content: string }>>([]);
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
  const [introAudio, setIntroAudio] = useState<HTMLAudioElement | null>(null);
  const introSoundPlayedRef = useRef(false);

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
        } catch (e) { }
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
      }, 500);
      return;
    }

    isPlayingRef.current = true;
    shouldPauseMicRef.current = true;

    if (recognitionRef.current?.recognition) {
      try {
        recognitionRef.current.recognition.stop();
      } catch (e) { }
    }

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
    audio.setAttribute('sinkId', 'default');

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
      let hasInitialized = false;

      ws.onopen = () => {
        // Send initialization message first
        ws.send(JSON.stringify({
          session_id: "playground-session",
          conversation_id: currentConversationId
        }));
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === 'complete' && !hasInitialized) {
          // Received init confirmation, now send the actual user message
          hasInitialized = true;
          if (data.conversation_id) {
            setCurrentConversationId(data.conversation_id);
          }
          ws.send(JSON.stringify({
            message: textToSend,
            top_k: 5,
            short_answer: false
          }));
        } else if (data.type === 'chunk') {
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
        } else if (data.type === 'complete' && hasInitialized) {
          // Response complete
          setLoading(false);
          ws.close();
        } else if (data.type === 'error') {
          setMessages(prev => [...prev, {
            role: "system",
            content: `❌ Error: ${data.message || 'Unknown error occurred'}`
          }]);
          setLoading(false);
          ws.close();
        } else if (data.type === 'history') {
          // Received conversation history when resuming
          hasInitialized = true;
          ws.send(JSON.stringify({
            message: textToSend
          }));
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

        if (!introSoundPlayedRef.current) {
          introSoundPlayedRef.current = true;
          if (!introAudio) {
            const audio = new Audio(`${API_BASE_URL}/intro.wav`);
            audio.volume = 0.7;
            setIntroAudio(audio);
            audio.play().catch(() => { });
          } else {
            introAudio.play().catch(() => { });
          }
        }
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

        if (currentText && !isSending) {
          processingTimeoutRef.current = setTimeout(() => {
            if (currentText && !isSending && ws.readyState === WebSocket.OPEN) {
              isSending = true;
              console.log("📤 SEND:", currentText);

              ws.send(JSON.stringify({
                type: "text_query",
                text: currentText,
                top_k: 3,
                short_answer: true
              }));

              currentText = "";
              setCurrentUserInput("");
            }
          }, VOICE_QUERY_DEBOUNCE_MS);
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
          isSending = false;
          if (processingTimeoutRef.current) {
            clearTimeout(processingTimeoutRef.current);
            processingTimeoutRef.current = null;
          }
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
    audioQueueRef.current.forEach(({ audio, url }) => {
      audio.pause();
      URL.revokeObjectURL(url);
    });
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    shouldPauseMicRef.current = false;
    introSoundPlayedRef.current = false;

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
              <Image src="/images/img.png" alt="Nexva" width={32} height={32} className="border border-[var(--border-border-neutral-l1)]" />
              <span className="text-xl font-bold text-[var(--text-text-default)] uppercase tracking-wider font-mono">Nexva</span>
            </div>
            <span className="text-[var(--text-text-tertiary)] font-mono">/</span>
            <span className="text-[var(--text-text-secondary)] font-mono uppercase tracking-wide text-sm">Playground</span>
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] border border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l3)] transition-all font-mono text-xs uppercase tracking-wider font-bold"
          >
            Dashboard
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-tight">Playground</h1>
          <p className="text-[var(--text-text-secondary)] font-mono text-sm">Test your chatbot with text or voice</p>
        </div>

        <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-6 mb-6 relative">
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
          <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
          <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

          <label className="block text-xs font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider font-mono">API Key</label>
          <div className="flex space-x-2">
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="ENTER YOUR API KEY"
              className="flex-1 px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] font-mono text-xs focus:outline-none focus:border-[var(--bg-bg-brand)] placeholder:text-[var(--text-text-tertiary)]"
            />
            <button
              onClick={saveApiKey}
              disabled={!apiKey.trim()}
              className="flex items-center space-x-2 px-6 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all font-bold uppercase tracking-wider font-mono text-xs"
            >
              <Save className="h-4 w-4" />
              <span>Save</span>
            </button>
          </div>
        </div>

        <div className="flex space-x-px mb-8 border border-[var(--border-border-neutral-l1)] bg-[var(--border-border-neutral-l1)]">
          <button
            onClick={() => setActiveTab("text")}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 transition-all font-bold uppercase tracking-wider font-mono text-xs ${activeTab === "text"
              ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]"
              : "bg-[var(--bg-bg-base-secondary)] text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"
              }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Text Chat</span>
          </button>
          <button
            onClick={() => setActiveTab("voice")}
            className={`flex-1 flex items-center justify-center space-x-2 px-6 py-4 transition-all font-bold uppercase tracking-wider font-mono text-xs ${activeTab === "voice"
              ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]"
              : "bg-[var(--bg-bg-base-secondary)] text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"
              }`}
          >
            <Volume2 className="h-4 w-4" />
            <span>Voice Chat</span>
          </button>
        </div>

        {activeTab === "text" ? (
          <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-6 relative min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Text Chat</h2>
              <div className="flex space-x-2">
                {!supportRequested && messages.length > 0 && (
                  <button
                    onClick={requestSupport}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-xs text-white transition-all font-mono uppercase tracking-wide font-bold"
                  >
                    <MessageSquare className="h-3 w-3" />
                    <span>Talk to Human</span>
                  </button>
                )}
                <button
                  onClick={clearMessages}
                  className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] border border-[var(--border-border-neutral-l1)] text-xs text-[var(--text-text-secondary)] transition-all font-mono uppercase tracking-wide font-bold"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>Clear</span>
                </button>
              </div>
            </div>

            <div className="bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] p-6 mb-6 flex-1 overflow-y-auto">
              {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--text-text-tertiary)] font-mono text-sm uppercase tracking-wide">
                  <p>No messages yet. Start chatting!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.filter(msg => msg.content.trim() !== '' || msg.role === 'user').map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 border ${msg.role === "user"
                        ? "bg-[var(--bg-bg-brand)]/10 border-[var(--bg-bg-brand)] text-[var(--text-text-default)] ml-12"
                        : msg.role === "assistant"
                          ? "bg-[var(--bg-bg-overlay-l2)] border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] mr-12"
                          : "bg-[var(--bg-bg-overlay-l1)] border-[var(--border-border-neutral-l1)] text-[var(--text-text-secondary)]"
                        }`}
                    >
                      <div className="text-[10px] font-bold mb-2 opacity-70 uppercase tracking-widest font-mono">{msg.role}</div>
                      {msg.content.trim() === '' && msg.role === 'user' ? (
                        <div className="flex items-center space-x-1">
                          <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      ) : (
                        <div className={`text-sm font-mono ${msg.role === "assistant" ? "prose prose-invert max-w-none prose-p:font-mono prose-pre:bg-black/50 prose-pre:border prose-pre:border-[var(--border-border-neutral-l1)]" : ""}`}>
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
                                      className="border border-[var(--border-border-neutral-l1)] my-2 !bg-black/50"
                                      {...props}
                                    >
                                      {String(children).replace(/\n$/, "")}
                                    </SyntaxHighlighter>
                                  ) : (
                                    <code className="bg-[var(--bg-bg-base-secondary)] px-1.5 py-0.5 text-xs font-mono border border-[var(--border-border-neutral-l1)]" {...props}>
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
                                  return <ul className="my-2 ml-4 list-disc space-y-1 marker:text-[var(--bg-bg-brand)]" {...props}>{children}</ul>;
                                },
                                ol({ node, children, ...props }: any) {
                                  return <ol className="my-2 ml-4 list-decimal space-y-1 marker:text-[var(--bg-bg-brand)]" {...props}>{children}</ol>;
                                },
                                li({ node, children, ...props }: any) {
                                  return <li className="leading-relaxed" {...props}>{children}</li>;
                                },
                                h1({ node, children, ...props }: any) {
                                  return <h1 className="text-lg font-bold mt-4 mb-2 uppercase tracking-wide" {...props}>{children}</h1>;
                                },
                                h2({ node, children, ...props }: any) {
                                  return <h2 className="text-base font-bold mt-3 mb-2 uppercase tracking-wide" {...props}>{children}</h2>;
                                },
                                h3({ node, children, ...props }: any) {
                                  return <h3 className="text-sm font-bold mt-2 mb-1 uppercase tracking-wide" {...props}>{children}</h3>;
                                },
                                blockquote({ node, children, ...props }: any) {
                                  return (
                                    <blockquote
                                      className="border-l-2 border-[var(--bg-bg-brand)] pl-4 italic my-3 text-[var(--text-text-secondary)]"
                                      {...props}
                                    >
                                      {children}
                                    </blockquote>
                                  );
                                },
                                strong({ node, children, ...props }: any) {
                                  return <strong className="font-bold text-[var(--text-text-default)]" {...props}>{children}</strong>;
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
                    <div className="p-4 border border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] mr-12">
                      <div className="text-[10px] font-bold mb-2 opacity-70 uppercase tracking-widest font-mono">assistant</div>
                      <div className="flex items-center space-x-1">
                        <div className="w-1.5 h-1.5 bg-[var(--text-text-tertiary)] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[var(--text-text-tertiary)] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                        <div className="w-1.5 h-1.5 bg-[var(--text-text-tertiary)] animate-pulse" style={{ animationDelay: '300ms' }}></div>
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
                placeholder="TYPE YOUR MESSAGE OR USE VOICE..."
                className="flex-1 px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] font-mono text-xs focus:outline-none focus:border-[var(--bg-bg-brand)] placeholder:text-[var(--text-text-tertiary)]"
                disabled={isListening}
              />
              <button
                onClick={() => (isListening ? stopRealtimeTranscription() : startRealtimeTranscription())}
                className={`relative px-4 py-3 transition-all flex items-center justify-center border ${isListening
                  ? volumeLevel === 'low'
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20"
                    : "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20"
                  : "bg-[var(--bg-bg-overlay-l2)] border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l3)] text-[var(--text-text-default)]"
                  }`}
              >
                {isListening && (
                  <span className="absolute inset-0">
                    <span className={`absolute inset-0 ${volumeLevel === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                      } opacity-20 animate-ping`}></span>
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
                className="px-6 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all flex items-center space-x-2 font-bold uppercase tracking-wider font-mono text-xs"
              >
                {loading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>{loading ? "SENDING..." : "SEND"}</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-6 relative min-h-[600px] flex flex-col">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Voice Chat</h2>
              <button
                onClick={clearMessages}
                className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] border border-[var(--border-border-neutral-l1)] text-xs text-[var(--text-text-secondary)] transition-all font-mono uppercase tracking-wide font-bold"
              >
                <RefreshCw className="h-3 w-3" />
                <span>Clear</span>
              </button>
            </div>

            <div className="bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] p-6 mb-6 flex-1 overflow-y-auto">
              {/* Assistant responses with spacing between paragraphs */}
              {assistantMessages.length > 0 && (
                <div className="space-y-6 mb-6">
                  {assistantMessages.map((content, idx) => (
                    <div key={idx}>
                      {idx > 0 && (
                        <div className="border-t border-[var(--border-border-neutral-l1)] mb-6"></div>
                      )}
                      <div className="space-y-2 bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-4">
                        <div className="text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">
                          assistant • Response {idx + 1}
                        </div>
                        <div className="text-sm text-[var(--text-text-default)] whitespace-pre-wrap font-mono">
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
                  <div className="text-[10px] font-bold text-[var(--text-text-secondary)] uppercase tracking-widest font-mono">
                    assistant
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-1.5 h-1.5 bg-[var(--text-text-secondary)] animate-pulse" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--text-text-secondary)] animate-pulse" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-1.5 h-1.5 bg-[var(--text-text-secondary)] animate-pulse" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              )}

              {/* Empty state */}
              {!currentUserInput && assistantMessages.length === 0 && !isAssistantTyping && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-lg font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wide">
                    {isRecording ? "Listening..." : "Click microphone below to start"}
                  </p>
                  <p className="text-xs text-[var(--text-text-tertiary)] font-mono uppercase tracking-wider">
                    Real-time speech recognition
                  </p>
                </div>
              )}

              <div ref={voiceMessagesEndRef} />
            </div>

            {/* User text - floating display */}
            {currentUserInput && (
              <div className="mb-4 flex justify-center">
                <div className="bg-black/80 backdrop-blur-sm border border-[var(--bg-bg-brand)] px-6 py-4 shadow-lg max-w-md">
                  <p className="text-sm text-[var(--text-text-default)] whitespace-pre-wrap leading-relaxed font-mono">
                    {currentUserInput}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-center">{/* Mic button */}
              <button
                onClick={isRecording ? stopVoiceChat : startVoiceChat}
                className={`relative w-20 h-20 flex items-center justify-center transition-all shadow-lg border ${isRecording
                  ? volumeLevel === 'low'
                    ? "bg-yellow-500/10 border-yellow-500 text-yellow-500 hover:bg-yellow-500/20"
                    : "bg-red-500/10 border-red-500 text-red-500 hover:bg-red-500/20"
                  : "bg-[var(--bg-bg-brand)]/10 border-[var(--bg-bg-brand)] text-[var(--bg-bg-brand)] hover:bg-[var(--bg-bg-brand)]/20"
                  }`}
              >
                {isRecording && (
                  <span className="absolute inset-0">
                    <span className={`absolute inset-0 ${volumeLevel === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                      } opacity-20 animate-ping`}></span>
                    <span className={`absolute inset-0 ${volumeLevel === 'low' ? 'bg-yellow-400' : 'bg-red-400'
                      } opacity-10`} style={{ animation: 'pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}></span>
                  </span>
                )}
                <span className="relative z-10">
                  <Mic className="h-8 w-8" />
                </span>
              </button>
            </div>

            <div className="mt-6 p-4 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)]">
              <div className="flex items-center justify-center space-x-3 text-xs text-[var(--text-text-tertiary)] font-mono uppercase tracking-wider">
                <div className={`w-1.5 h-1.5 ${isRecording ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
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
