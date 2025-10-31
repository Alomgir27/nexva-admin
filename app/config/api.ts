export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://yueihds3xl383a-5000.proxy.runpod.net';

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
  },
  chatbots: `${API_BASE_URL}/api/chatbots`,
  domains: `${API_BASE_URL}/api/domains`,
  support: {
    tickets: `${API_BASE_URL}/api/support/tickets`,
    team: `${API_BASE_URL}/api/support-team`,
  },
  voice: {
    generate: `${API_BASE_URL}/api/voice/generate-speech`,
  },
  widget: `${API_BASE_URL}/widget.js`,
};

