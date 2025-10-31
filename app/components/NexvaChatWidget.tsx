"use client";

import { useEffect } from 'react';

export default function NexvaChatWidget() {
  useEffect(() => {
    const initWidget = () => {
      if (typeof window !== 'undefined' && (window as any).NexvaChat) {
        (window as any).NexvaChat.init('7qjoBizhjGt28MFRoT4ME8a8zVr_EIHXvNyyTCmWtFk', {
          apiUrl: 'http://localhost:8000',
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
    script.src = `http://localhost:8000/widget.js?v=${Date.now()}`;
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

