"use client";

import { useEffect, useState } from 'react';
import { API_BASE_URL, API_ENDPOINTS } from '@/app/config/api';

export default function NexvaChatWidget() {
  const [apiKey, setApiKey] = useState<string | null>(null);

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

  useEffect(() => {
    if (!apiKey) return;

    const initWidget = () => {
      if (typeof window !== 'undefined' && (window as any).NexvaChat) {
        try {
          (window as any).NexvaChat.init(apiKey, {
            apiUrl: API_BASE_URL,
            position: 'bottom-right',
            primaryColor: '#32f08c',
            headerText: 'Nexva Chat',
            welcomeMessage: '👋 Hi! How can I help you today?',
            placeholder: 'Type your message here...',
            enableVoice: true,
            enableHumanSupport: true,
            theme: 'dark',
            borderRadius: '12px',
            presetQuestions: [
              'How do I create a chatbot?',
              'What features are available?',
              'Need help with integration'
            ],
            bubble: {
              backgroundColor: '#32f08c',
              size: '60px',
              shape: 'circle',
              icon: 'chat',
              iconColor: '#ffffff',
              shadow: true,
              animation: 'pulse'
            }
          });
        } catch (error) {
          console.error('[NexvaChatWidget] Error initializing widget:', error);
        }
      }
    };

    const script = document.createElement('script');
    script.type = 'module';
    script.src = `${API_BASE_URL}/widget.js?v=${Date.now()}`;
    
    script.onload = () => setTimeout(initWidget, 200);
    script.onerror = (error) => console.error('[NexvaChatWidget] Failed to load script:', error);
    
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [apiKey]);

  return null;
}

