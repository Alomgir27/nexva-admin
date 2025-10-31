"use client";

import { useEffect } from 'react';
import { API_BASE_URL } from '@/app/config/api';

export default function NexvaChatWidget() {
  useEffect(() => {
    console.log('[NexvaChatWidget] Initializing widget...');
    console.log('[NexvaChatWidget] API_BASE_URL:', API_BASE_URL);

    const initWidget = () => {
      console.log('[NexvaChatWidget] Checking for NexvaChat...');
      if (typeof window !== 'undefined' && (window as any).NexvaChat) {
        console.log('[NexvaChatWidget] NexvaChat found, initializing...');
        try {
          (window as any).NexvaChat.init('cvEVs2U0ek-bmTwGeZgbdBxcL7ofbZMLSPOAkMCZ50s', {
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
          console.log('[NexvaChatWidget] Widget initialized successfully!');
        } catch (error) {
          console.error('[NexvaChatWidget] Error initializing widget:', error);
        }
      } else {
        console.error('[NexvaChatWidget] NexvaChat not found on window object');
      }
    };

    // Create script element with type="module"
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `${API_BASE_URL}/widget.js?v=${Date.now()}`;
    console.log('[NexvaChatWidget] Loading script from:', script.src);
    
    script.onload = () => {
      console.log('[NexvaChatWidget] Script loaded successfully');
      // Wait a bit for module to initialize
      setTimeout(initWidget, 200);
    };
    
    script.onerror = (error) => {
      console.error('[NexvaChatWidget] Failed to load script:', error);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      console.log('[NexvaChatWidget] Cleaning up...');
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

