"use client";

import { useEffect } from 'react';
import { API_BASE_URL } from '@/app/config/api';

export default function NexvaChatWidget() {
  useEffect(() => {
    const initWidget = () => {
      if (typeof window !== 'undefined' && (window as any).NexvaChat) {
        (window as any).NexvaChat.init('7qjoBizhjGt28MFRoT4ME8a8zVr_EIHXvNyyTCmWtFk', {
          apiUrl: API_BASE_URL,
          position: 'bottom-right',
          primaryColor: '#4F46E5',
          headerText: 'FluentCart',
          welcomeMessage: '👋 Hi! I\'m your FluentCart AI assistant. Ask me anything!',
          placeholder: 'Type your message here...',
          enableVoice: true,
          enableHumanSupport: true,
          theme: 'dark',
          borderRadius: '20px',
          borderColor: '#E5E7EB',
          borderWidth: '2px'
        });
      }
    };

    // Create script element with type="module"
    const script = document.createElement('script');
    script.type = 'module';
    script.src = `${API_BASE_URL}/widget.js?v=${Date.now()}`;
    script.onload = () => {
      // Wait a bit for module to initialize
      setTimeout(initWidget, 100);
    };
    
    document.head.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, []);

  return null;
}

