"use client";

import { useState, useEffect } from "react";
import { NexvaChatNext } from 'nexva-react';

export default function NexvaChatWidget() {
  const [apiKey, setApiKey] = useState<string>("");

  useEffect(() => {
    const savedKey = localStorage.getItem("nexva_api_key");
    if (savedKey) {
      setApiKey(savedKey);
    }
  }, []);

  if (!apiKey) {
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

