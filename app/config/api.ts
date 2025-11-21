const ENV = process.env.NODE_ENV || 'development';

const config = {
  development: {
    apiUrl: 'http://localhost:5000',
  },
  production: {
    apiUrl: 'https://yueihds3xl383a-5000.proxy.runpod.net',
  }
};

const currentConfig = config[ENV as keyof typeof config] || config.development;

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || currentConfig.apiUrl;
export const IS_PRODUCTION = ENV === 'production';

export const buildWebSocketUrl = (path: string) => {
  try {
    const base = new URL(API_BASE_URL);
    const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${protocol}//${base.host}${normalizedPath}`;
  } catch (error) {
    const protocol = API_BASE_URL.startsWith('https') ? 'wss:' : 'ws:';
    const host = API_BASE_URL.replace(/^https?:\/\//, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${protocol}//${host}${normalizedPath}`;
  }
};

export const buildWebSocketUrlWithToken = (path: string, token: string) => {
  const baseUrl = buildWebSocketUrl(path);
  const separator = baseUrl.includes('?') ? '&' : '?';
  return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
};

export const API_ENDPOINTS = {
  auth: {
    login: `${API_BASE_URL}/api/auth/login`,
    register: `${API_BASE_URL}/api/auth/register`,
    me: `${API_BASE_URL}/api/auth/me`,
  },
  chatbots: `${API_BASE_URL}/api/chatbots`,
  domains: `${API_BASE_URL}/api/domains`,
  documents: {
    list: (domainId: number) => `${API_BASE_URL}/api/domains/${domainId}/documents`,
    upload: (domainId: number) => `${API_BASE_URL}/api/domains/${domainId}/documents`,
    download: (documentId: number) => `${API_BASE_URL}/api/documents/${documentId}/download`,
    delete: (documentId: number) => `${API_BASE_URL}/api/documents/${documentId}`,
  },
  billing: {
    subscription: `${API_BASE_URL}/api/billing/subscription`,
    createCheckoutSession: `${API_BASE_URL}/api/billing/create-checkout-session`,
    portalSession: `${API_BASE_URL}/api/billing/portal-session`,
  },
  support: {
    tickets: `${API_BASE_URL}/api/support/tickets`,
    team: `${API_BASE_URL}/api/support-team`,
  },
  voice: {
    generate: `${API_BASE_URL}/api/voice/generate-speech`,
  },
  widget: `${API_BASE_URL}/widget.js`,
};
