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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--text-text-default)]">Voice Selection</h1>
        <p className="text-[var(--text-text-subtle)] mt-1">
          Choose from 10 high-quality Kokoro-82M voices (ultra-fast & efficient)
        </p>
      </div>

      {chatbots.length === 0 ? (
        <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-12 text-center">
          <h3 className="text-lg font-medium text-[var(--text-text-default)] mb-2">No Chatbots Found</h3>
          <p className="text-[var(--text-text-subtle)]">Create a chatbot first to select a voice.</p>
        </div>
      ) : (
        <>
          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 mb-6">
            <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
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
              className="w-full px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)]"
            >
              {chatbots.map((chatbot) => (
                <option key={chatbot.id} value={chatbot.id}>
                  {chatbot.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-border-neutral-l1)]">
              <h2 className="text-lg font-medium text-[var(--text-text-default)]">Available Voices</h2>
              <p className="text-sm text-[var(--text-text-subtle)] mt-1">
                Selected: {selectedVoiceName}
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {VOICES.map((voice) => (
                  <div
                    key={voice.id}
                    onClick={() => handleVoiceSelect(voice.id)}
                    className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      currentVoice === voice.id
                        ? 'border-[var(--bg-bg-brand)] bg-[var(--bg-bg-brand)]/10'
                        : 'border-[var(--border-border-neutral-l1)] hover:border-[var(--border-border-neutral-l2)]'
                    }`}
                  >
                    {currentVoice === voice.id && (
                      <div className="absolute top-2 right-2">
                        <Check className="w-5 h-5 text-[var(--bg-bg-brand)]" />
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`p-2 rounded-lg ${
                        currentVoice === voice.id
                          ? 'bg-[var(--bg-bg-brand)] text-white'
                          : 'bg-[var(--bg-bg-base-secondary)] text-[var(--text-text-subtle)]'
                      }`}>
                        <Volume2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-medium text-[var(--text-text-default)]">{voice.name}</h3>
                        <p className="text-xs text-[var(--text-text-subtle)]">{voice.gender}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs mt-2">
                      <span className="px-2 py-1 rounded bg-[var(--bg-bg-base-secondary)] text-[var(--text-text-subtle)]">
                        {voice.accent}
                      </span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          playVoiceDemo(voice.id);
                        }}
                        className="p-2 rounded-lg hover:bg-[var(--bg-bg-base-secondary)] text-[var(--text-text-default)] transition-colors"
                      >
                        {playingVoice === voice.id ? (
                          <Square className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t border-[var(--border-border-neutral-l1)] flex justify-end">
              <button
                onClick={saveVoiceSelection}
                disabled={saving || !selectedChatbot}
                className="px-6 py-2 bg-[var(--bg-bg-brand)] text-white rounded-lg hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Save Voice Selection
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
