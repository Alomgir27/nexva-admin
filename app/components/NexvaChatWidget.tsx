"use client";

import { useState, useEffect } from "react";
import { NexvaChatNext } from 'nexva-react';
import { API_BASE_URL } from '../config/api';

export default function NexvaChatWidget() {
  const [apiKey, setApiKey] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChatbotApiKey();
  }, []);

  const fetchChatbotApiKey = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/chatbots`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const chatbots = await response.json();
        if (chatbots.length > 0) {
          setApiKey(chatbots[0].api_key);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chatbot API key");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !apiKey) return null;

  return (
    <NexvaChatNext
      config={{
        apiKey: apiKey || "82DGMU7UTmo04VpNPkiS0LrbC2t3ZKdGpF-lq60NFxw",
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

