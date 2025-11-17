"use client";

import { useState, useEffect } from "react";
import { NexvaChatNext } from 'nexva-react';
import { API_ENDPOINTS, API_BASE_URL } from "@/app/config/api";

const FALLBACK_API_KEY = "82DGMU7UTmo04VpNPkiS0LrbC2t3ZKdGpF-lq60NFxw";

export default function NexvaChatWidget() {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadApiKey = async () => {
      // Priority 1: Check if 'nexva_api_key' exists in localStorage
      const savedKey = localStorage.getItem("nexva_api_key");
      if (savedKey) {
        console.log('[NexvaChatWidget] Using saved API key from localStorage');
        setApiKey(savedKey);
        setLoading(false);
        return;
      }

      // Priority 2: Try to fetch user's first available API key
      try {
        const token = localStorage.getItem("token");
        if (token) {
          const response = await fetch(API_ENDPOINTS.chatbots, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (response.ok) {
            const chatbots = await response.json();
            if (chatbots && chatbots.length > 0 && chatbots[0].api_key) {
              console.log('[NexvaChatWidget] Using first available chatbot API key');
              setApiKey(chatbots[0].api_key);
              setLoading(false);
              return;
            }
          }
        }
      } catch (error) {
        console.error('[NexvaChatWidget] Failed to fetch chatbots:', error);
      }

      // Priority 3: Fallback to default API key
      console.log('[NexvaChatWidget] Using fallback API key');
      setApiKey(FALLBACK_API_KEY);
      setLoading(false);
    };

    loadApiKey();
  }, []);

  if (loading || !apiKey) {
    return null;
  }

  return (
    <NexvaChatNext
      config={{
        apiKey: apiKey,
        position: 'bottom-right',
        primaryColor: '#32f08c',
        headerText: 'Nexva Chat',
        welcomeMessage: '👋 Hi! How can I help you today?',
        placeholder: 'Type your message here...',
        enableVoice: true,
        enableHumanSupport: true,
        theme: 'dark',
        borderRadius: '12px',
      }}
    />
  );
}

