"use client";

import { NexvaChatNext } from 'nexva-react';

export default function NexvaChatWidget() {
  return (
    <NexvaChatNext
      config={{
        apiKey: "82DGMU7UTmo04VpNPkiS0LrbC2t3ZKdGpF-lq60NFxw",
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

