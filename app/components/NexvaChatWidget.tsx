"use client";

import { useState, useEffect } from "react";
import { NexvaChatNext } from 'nexva-react';
import { API_ENDPOINTS, API_BASE_URL } from "@/app/config/api";

const FALLBACK_API_KEY = "82DGMU7UTmo04VpNPkiS0LrbC2t3ZKdGpF-lq60NFxw";

export default function NexvaChatWidget() {
  const [apiKey, setApiKey] = useState<string>(FALLBACK_API_KEY);

  useEffect(() => {
    const loadApiKey = async () => {
      // Priority 1: Check if 'nexva_api_key' exists in localStorage
      const savedKey = localStorage.getItem("nexva_api_key");
      if (savedKey) {
        setApiKey(savedKey);
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
              setApiKey(chatbots[0].api_key);
              return;
            }
          }
        }
      } catch (error) {
        console.error('[NexvaChatWidget] Failed to fetch chatbots:', error);
      }
    };

    loadApiKey();
  }, []);

  return (
    <NexvaChatNext
      config={{
        apiKey: apiKey,
        apiUrl: API_BASE_URL
      }}
    />
  );
}
