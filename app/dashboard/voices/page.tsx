"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Volume2, Check, Loader, Play, Square } from "lucide-react";
import { API_BASE_URL } from "../../config/api";

interface Chatbot {
  id: number;
  name: string;
  voice_id: string;
}

const VOICES = [
  { id: 'female-1', name: 'Heart', gender: 'Female', accent: 'Warm & Friendly' },
  { id: 'female-2', name: 'Nova', gender: 'Female', accent: 'Professional' },
  { id: 'female-3', name: 'Sarah', gender: 'Female', accent: 'Clear & Bright' },
  { id: 'female-4', name: 'Nicole', gender: 'Female', accent: 'Elegant' },
  { id: 'female-5', name: 'Sky', gender: 'Female', accent: 'Energetic' },
  { id: 'male-1', name: 'Adam', gender: 'Male', accent: 'Deep & Strong' },
  { id: 'male-2', name: 'Michael', gender: 'Male', accent: 'Clear & Calm' },
  { id: 'male-3', name: 'Bella', gender: 'Female', accent: 'Soft' },
  { id: 'male-4', name: 'Emma', gender: 'Female', accent: 'Sweet' },
  { id: 'male-5', name: 'Luna', gender: 'Female', accent: 'Gentle' },
];

export default function VoicesPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null);
  const [currentVoice, setCurrentVoice] = useState<string>('female-1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [playingVoice, setPlayingVoice] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/chatbots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setChatbots(data);
        if (data.length > 0) {
          setSelectedChatbot(data[0].id);
          setCurrentVoice(data[0].voice_id || 'female-1');
        }
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceSelect = (voiceId: string) => {
    setCurrentVoice(voiceId);
  };

  const playVoiceDemo = async (voiceId: string) => {
    if (playingVoice === voiceId) {
      audioRef.current?.pause();
      setPlayingVoice(null);
      return;
    }

    try {
      setPlayingVoice(voiceId);

      const response = await fetch(`${API_BASE_URL}/api/voice/generate-speech`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Hello, I'm your AI assistant. I'm here to help you with your questions.",
          voice_id: voiceId
        }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.pause();
        }

        audioRef.current = new Audio(audioUrl);
        audioRef.current.playbackRate = 1.15;
        audioRef.current.onended = () => {
          setPlayingVoice(null);
          URL.revokeObjectURL(audioUrl);
        };
        await audioRef.current.play();
      }
    } catch (error) {
      console.error("Error playing voice demo:", error);
      setPlayingVoice(null);
    }
  };

  const saveVoiceSelection = async () => {
    if (!selectedChatbot) return;

    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/chatbots/${selectedChatbot}/voice`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ voice_id: currentVoice }),
      });

      if (response.ok) {
        const updatedChatbots = chatbots.map(cb =>
          cb.id === selectedChatbot ? { ...cb, voice_id: currentVoice } : cb
        );
        setChatbots(updatedChatbots);
      }
    } catch (error) {
      console.error("Error saving voice:", error);
    } finally {
      setSaving(false);
    }
  };

  const selectedVoiceName = VOICES.find(v => v.id === currentVoice)?.name || 'Heart';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-[var(--text-text-subtle)]" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-tight">Voice Selection</h1>
        <p className="text-[var(--text-text-secondary)] font-mono text-sm">
          Choose from 10 high-quality Kokoro-82M voices (ultra-fast & efficient)
        </p>
      </div>

      {chatbots.length === 0 ? (
        <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-12 text-center">
          <h3 className="text-lg font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider">No Chatbots Found</h3>
          <p className="text-[var(--text-text-secondary)] font-mono text-sm uppercase tracking-wide">Create a chatbot first to select a voice.</p>
        </div>
      ) : (
        <>
          <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-6 mb-6 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

            <label className="block text-xs font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-wider font-mono">
              Select Chatbot
            </label>
            <select
              value={selectedChatbot || ""}
              onChange={(e) => {
                const chatbotId = Number(e.target.value);
                setSelectedChatbot(chatbotId);
                const chatbot = chatbots.find(cb => cb.id === chatbotId);
                if (chatbot) {
                  setCurrentVoice(chatbot.voice_id || 'female-1');
                }
              }}
              className="w-full px-4 py-3 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)] font-mono text-xs uppercase tracking-wide"
            >
              {chatbots.map((chatbot) => (
                <option key={chatbot.id} value={chatbot.id}>
                  {chatbot.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] overflow-hidden relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

            <div className="p-6 border-b border-[var(--border-border-neutral-l1)]">
              <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Available Voices</h2>
              <p className="text-xs text-[var(--text-text-secondary)] mt-1 font-mono uppercase tracking-wide">
                Selected: <span className="text-[var(--bg-bg-brand)]">{selectedVoiceName}</span>
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VOICES.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => handleVoiceSelect(voice.id)}
                    className={`relative p-4 border cursor-pointer transition-all group ${currentVoice === voice.id
                        ? 'border-[var(--bg-bg-brand)] bg-[var(--bg-bg-brand)]/5'
                        : 'border-[var(--border-border-neutral-l1)] hover:border-[var(--text-text-tertiary)] hover:bg-[var(--bg-bg-overlay-l2)]'
                      }`}
                  >
                    {currentVoice === voice.id && (
                      <div className="absolute top-0 right-0 p-1 bg-[var(--bg-bg-brand)]">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}

                    <div className="flex items-center gap-3 mb-4">
                      <div className={`p-2 border ${currentVoice === voice.id
                          ? 'bg-[var(--bg-bg-brand)] border-[var(--bg-bg-brand)] text-white'
                          : 'bg-[var(--bg-bg-base-secondary)] border-[var(--border-border-neutral-l1)] text-[var(--text-text-tertiary)]'
                        }`}>
                        <Volume2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--text-text-default)] uppercase tracking-wider text-xs font-mono">{voice.name}</h3>
                        <p className="text-[10px] text-[var(--text-text-secondary)] font-mono uppercase tracking-wide">{voice.gender}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-secondary)] text-[10px] font-mono uppercase tracking-wide">
                        {voice.accent}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoiceDemo(voice.id);
                        }}
                        className={`p-2 border transition-all ${playingVoice === voice.id
                            ? 'bg-[var(--bg-bg-brand)] border-[var(--bg-bg-brand)] text-white'
                            : 'bg-transparent border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] hover:border-[var(--text-text-tertiary)]'
                          }`}
                      >
                        {playingVoice === voice.id ? (
                          <Square className="w-3 h-3 fill-current" />
                        ) : (
                          <Play className="w-3 h-3 fill-current" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-border-neutral-l1)] flex justify-end bg-[var(--bg-bg-base-secondary)]/30">
              <button
                onClick={saveVoiceSelection}
                disabled={saving || !selectedChatbot}
                className="px-6 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 font-bold uppercase tracking-wider font-mono text-xs transition-all"
              >
                {saving ? (
                  <>
                    <Loader className="w-3 h-3 animate-spin" />
                    <span>SAVING...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3 h-3" />
                    <span>SAVE SELECTION</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
