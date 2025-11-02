"use client";

import { useEffect, useState } from 'react';
import { NexvaChatNext } from 'nexva-react';
import { API_ENDPOINTS } from '@/app/config/api';

export default function NexvaChatWidget() {
  const [apiKey, setApiKey] = useState<string>('');

  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(API_ENDPOINTS.chatbots, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.ok) {
          const chatbots = await response.json();
          if (chatbots.length > 0) {
            setApiKey(chatbots[0].api_key);
          }
        }
      } catch (error) {
        console.error('[NexvaChatWidget] Failed to fetch API key:', error);
      }
    };

    fetchApiKey();
  }, []);

  if (!apiKey) return null;

  return (
    <NexvaChatNext
      config={{
        apiKey,
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

