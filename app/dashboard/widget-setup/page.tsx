"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Copy, Check, RefreshCw } from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "@/app/config/api";

interface Chatbot {
  id: number;
  name: string;
  api_key: string;
}

export default function WidgetSetupPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedTab, setCopiedTab] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'cdn' | 'npm' | 'react'>('cdn');

  const [config, setConfig] = useState({
    apiKey: '',
    primaryColor: '#32f08c',
    position: 'bottom-right',
    headerText: 'Nexva Chat',
    welcomeMessage: '👋 Hi! How can I help you today?',
    placeholder: 'Type your message here...',
    theme: 'dark',
    borderRadius: '12px',
    borderColor: '#E5E7EB',
    borderWidth: '1px',
    enableVoice: true,
    enableHumanSupport: true,
    enableIntroSound: true,
    enableDock: true,
    enableFullscreen: true,
    presetQuestions: [] as string[],
    bubble: {
      backgroundColor: '#32f08c',
      size: '60px',
      shape: 'circle',
      icon: 'chat',
      iconColor: '#ffffff',
      customIconUrl: '',
      shadow: true,
      animation: 'pulse',
    },
  });

  const [newQuestion, setNewQuestion] = useState('');

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchChatbots();
  }, [router]);

  const fetchChatbots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.chatbots, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        const data = await response.json();
        setChatbots(data);
        if (data.length > 0) {
          setConfig(prev => ({ ...prev, apiKey: data[0].api_key }));
        }
      }
    } catch (error) {
      console.error("Error fetching chatbots:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateCDNCode = () => {
    return `<script 
  src="${API_BASE_URL}/widget.js"
  data-api-key="${config.apiKey}"
  data-api-url="${API_BASE_URL}"
  data-position="${config.position}"
  data-primary-color="${config.primaryColor}"
  data-header-text="${config.headerText}"
  data-welcome-message="${config.welcomeMessage}"
  data-placeholder="${config.placeholder}"
  data-enable-voice="${config.enableVoice}"
  data-enable-human-support="${config.enableHumanSupport}"
  data-enable-intro-sound="${config.enableIntroSound !== false}"
  data-enable-dock="${config.enableDock !== false}"
  data-enable-fullscreen="${config.enableFullscreen !== false}"
  data-theme="${config.theme}"
  data-border-radius="${config.borderRadius}"
  data-border-color="${config.borderColor}"
  data-border-width="${config.borderWidth}"${config.presetQuestions.length > 0 ? `
  data-preset-questions='${JSON.stringify(config.presetQuestions)}'` : ''}
  data-bubble-bg="${config.bubble.backgroundColor}"
  data-bubble-size="${config.bubble.size}"
  data-bubble-shape="${config.bubble.shape}"
  data-bubble-icon="${config.bubble.icon}"
  data-bubble-icon-color="${config.bubble.iconColor}"
  data-bubble-custom-icon="${config.bubble.customIconUrl}"
  data-bubble-shadow="${config.bubble.shadow}"
  data-bubble-animation="${config.bubble.animation}">
</script>`;
  };

  const generateNPMCode = () => {
    return `npm install nexva-react

import NexvaChat from 'nexva-react';

NexvaChat.init('${config.apiKey}', {
  position: '${config.position}',
  primaryColor: '${config.primaryColor}',
  headerText: '${config.headerText}',
  welcomeMessage: '${config.welcomeMessage}',
  placeholder: '${config.placeholder}',
  enableVoice: ${config.enableVoice},
  enableHumanSupport: ${config.enableHumanSupport},
  enableIntroSound: ${config.enableIntroSound !== false},
  enableDock: ${config.enableDock !== false},
  enableFullscreen: ${config.enableFullscreen !== false},
  theme: '${config.theme}',
  borderRadius: '${config.borderRadius}',
  borderColor: '${config.borderColor}',
  borderWidth: '${config.borderWidth}',${config.presetQuestions.length > 0 ? `
  presetQuestions: ${JSON.stringify(config.presetQuestions)},` : ''}
  bubble: {
    backgroundColor: '${config.bubble.backgroundColor}',
    size: '${config.bubble.size}',
    shape: '${config.bubble.shape}',
    icon: '${config.bubble.icon}',
    iconColor: '${config.bubble.iconColor}',
    customIconUrl: '${config.bubble.customIconUrl}',
    shadow: ${config.bubble.shadow},
    animation: '${config.bubble.animation}'
  }
});`;
  };

  const generateReactCode = () => {
    return `import { NexvaChatWidget } from 'nexva-react';

export default function App() {
  return (
    <NexvaChatWidget 
      apiKey="${config.apiKey}"
      position="${config.position}"
      primaryColor="${config.primaryColor}"
      headerText="${config.headerText}"
      welcomeMessage="${config.welcomeMessage}"
      placeholder="${config.placeholder}"
      enableVoice={${config.enableVoice}}
      enableHumanSupport={${config.enableHumanSupport}}
      enableIntroSound={${config.enableIntroSound !== false}}
      enableDock={${config.enableDock !== false}}
      enableFullscreen={${config.enableFullscreen !== false}}
      theme="${config.theme}"
      borderRadius="${config.borderRadius}"
      borderColor="${config.borderColor}"
      borderWidth="${config.borderWidth}"${config.presetQuestions.length > 0 ? `
      presetQuestions={${JSON.stringify(config.presetQuestions)}}` : ''}
      bubble={{
        backgroundColor: "${config.bubble.backgroundColor}",
        size: "${config.bubble.size}",
        shape: "${config.bubble.shape}",
        icon: "${config.bubble.icon}",
        iconColor: "${config.bubble.iconColor}",
        customIconUrl: "${config.bubble.customIconUrl}",
        shadow: ${config.bubble.shadow},
        animation: "${config.bubble.animation}"
      }}
    />
  );
}`;
  };

  const copyCode = (code: string, tab: string) => {
    navigator.clipboard.writeText(code);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const resetToDefaults = () => {
    setConfig(prev => ({
      ...prev,
      primaryColor: '#32f08c',
      position: 'bottom-right',
      headerText: 'Nexva Chat',
      welcomeMessage: '👋 Hi! How can I help you today?',
      placeholder: 'Type your message here...',
      theme: 'dark',
      borderRadius: '12px',
      borderColor: '#E5E7EB',
      borderWidth: '1px',
      enableVoice: true,
      enableHumanSupport: true,
      enableIntroSound: true,
      enableDock: true,
      enableFullscreen: true,
      bubble: {
        backgroundColor: '#32f08c',
        size: '60px',
        shape: 'circle',
        icon: 'chat',
        iconColor: '#ffffff',
        customIconUrl: '',
        shadow: true,
        animation: 'pulse',
      },
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--bg-bg-brand)]"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--text-text-default)] mb-2">
          Widget Setup
        </h1>
        <p className="text-[var(--text-text-secondary)]">
          Customize your chat widget and copy the integration code
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Configuration</h2>
              <button
                onClick={resetToDefaults}
                className="flex items-center space-x-2 px-3 py-1.5 text-sm bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  API Key
                </label>
                <select
                  value={config.apiKey}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                >
                  {chatbots.map((bot) => (
                    <option key={bot.id} value={bot.api_key}>
                      {bot.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  Primary Color
                </label>
                <div className="flex space-x-3">
                  <input
                    type="color"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="w-16 h-10 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={config.primaryColor}
                    onChange={(e) => setConfig({ ...config, primaryColor: e.target.value })}
                    className="flex-1 px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  Position
                </label>
                <select
                  value={config.position}
                  onChange={(e) => setConfig({ ...config, position: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                >
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                  <option value="top-right">Top Right</option>
                  <option value="top-left">Top Left</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  Header Text
                </label>
                <input
                  type="text"
                  value={config.headerText}
                  onChange={(e) => setConfig({ ...config, headerText: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  Welcome Message
                </label>
                <textarea
                  value={config.welcomeMessage}
                  onChange={(e) => setConfig({ ...config, welcomeMessage: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  Placeholder
                </label>
                <input
                  type="text"
                  value={config.placeholder}
                  onChange={(e) => setConfig({ ...config, placeholder: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  Preset Questions (Optional)
                </label>
                <p className="text-sm text-[var(--text-text-secondary)] mb-2">
                  Quick questions to help users get started
                </p>
                <div className="space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && newQuestion.trim()) {
                          setConfig({ ...config, presetQuestions: [...config.presetQuestions, newQuestion.trim()] });
                          setNewQuestion('');
                        }
                      }}
                      placeholder="Enter a question and press Enter"
                      className="flex-1 px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                    />
                    <button
                      onClick={() => {
                        if (newQuestion.trim()) {
                          setConfig({ ...config, presetQuestions: [...config.presetQuestions, newQuestion.trim()] });
                          setNewQuestion('');
                        }
                      }}
                      className="px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all"
                    >
                      Add
                    </button>
                  </div>
                  {config.presetQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {config.presetQuestions.map((q, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] rounded-full text-sm text-[var(--text-text-default)]"
                        >
                          <span>{q}</span>
                          <button
                            onClick={() => {
                              setConfig({
                                ...config,
                                presetQuestions: config.presetQuestions.filter((_, i) => i !== index)
                              });
                            }}
                            className="text-[var(--text-text-secondary)] hover:text-red-500 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                  Theme
                </label>
                <select
                  value={config.theme}
                  onChange={(e) => setConfig({ ...config, theme: e.target.value })}
                  className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                    Border Radius
                  </label>
                  <input
                    type="text"
                    value={config.borderRadius}
                    onChange={(e) => setConfig({ ...config, borderRadius: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                    Border Color
                  </label>
                  <input
                    type="color"
                    value={config.borderColor}
                    onChange={(e) => setConfig({ ...config, borderColor: e.target.value })}
                    className="w-full h-10 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                    Border Width
                  </label>
                  <input
                    type="text"
                    value={config.borderWidth}
                    onChange={(e) => setConfig({ ...config, borderWidth: e.target.value })}
                    className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border-border-neutral-l1)]">
                <h3 className="text-lg font-semibold text-[var(--text-text-default)] mb-4">Bubble Button</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                      Bubble Color
                    </label>
                    <div className="flex space-x-3">
                      <input
                        type="color"
                        value={config.bubble.backgroundColor}
                        onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, backgroundColor: e.target.value } })}
                        className="w-16 h-10 rounded-lg cursor-pointer"
                      />
                      <input
                        type="text"
                        value={config.bubble.backgroundColor}
                        onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, backgroundColor: e.target.value } })}
                        className="flex-1 px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                        Size
                      </label>
                      <input
                        type="text"
                        value={config.bubble.size}
                        onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, size: e.target.value } })}
                        className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                        Shape
                      </label>
                      <select
                        value={config.bubble.shape}
                        onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, shape: e.target.value } })}
                        className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                      >
                        <option value="circle">Circle</option>
                        <option value="rounded">Rounded</option>
                        <option value="square">Square</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                        Icon
                      </label>
                      <select
                        value={config.bubble.icon}
                        onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, icon: e.target.value } })}
                        className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                      >
                        <option value="chat">Chat</option>
                        <option value="message">Message</option>
                        <option value="help">Help</option>
                        <option value="support">Support</option>
                        <option value="custom">Custom Image</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                        Icon Color
                      </label>
                      <input
                        type="color"
                        value={config.bubble.iconColor}
                        onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, iconColor: e.target.value } })}
                        className="w-full h-10 rounded-lg cursor-pointer"
                        disabled={config.bubble.icon === 'custom'}
                      />
                    </div>
                  </div>

                  {config.bubble.icon === 'custom' && (
                    <div>
                      <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                        Custom Icon URL
                      </label>
                      <input
                        type="text"
                        value={config.bubble.customIconUrl}
                        onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, customIconUrl: e.target.value } })}
                        placeholder="https://example.com/icon.png"
                        className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                      />
                      <p className="text-xs text-[var(--text-text-tertiary)] mt-1">Enter a URL to your custom icon image</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-text-default)] mb-2">
                      Animation
                    </label>
                    <select
                      value={config.bubble.animation}
                      onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, animation: e.target.value } })}
                      className="w-full px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)]"
                    >
                      <option value="none">None</option>
                      <option value="pulse">Pulse</option>
                      <option value="bounce">Bounce</option>
                      <option value="shake">Shake</option>
                    </select>
                  </div>

                  <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.bubble.shadow}
                      onChange={(e) => setConfig({ ...config, bubble: { ...config.bubble, shadow: e.target.checked } })}
                      className="w-5 h-5 rounded border-[var(--border-border-neutral-l1)]"
                    />
                    <span className="text-sm text-[var(--text-text-default)]">Enable Shadow</span>
                  </label>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[var(--border-border-neutral-l1)]">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableVoice}
                    onChange={(e) => setConfig({ ...config, enableVoice: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border-border-neutral-l1)]"
                  />
                  <span className="text-sm text-[var(--text-text-default)]">Enable Voice Chat</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableHumanSupport}
                    onChange={(e) => setConfig({ ...config, enableHumanSupport: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border-border-neutral-l1)]"
                  />
                  <span className="text-sm text-[var(--text-text-default)]">Enable Human Support</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableIntroSound !== false}
                    onChange={(e) => setConfig({ ...config, enableIntroSound: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border-border-neutral-l1)]"
                  />
                  <span className="text-sm text-[var(--text-text-default)]">Enable Voice Intro Sound</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableDock !== false}
                    onChange={(e) => setConfig({ ...config, enableDock: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border-border-neutral-l1)]"
                  />
                  <span className="text-sm text-[var(--text-text-default)]">Enable Dock Button</span>
                </label>
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.enableFullscreen !== false}
                    onChange={(e) => setConfig({ ...config, enableFullscreen: e.target.checked })}
                    className="w-5 h-5 rounded border-[var(--border-border-neutral-l1)]"
                  />
                  <span className="text-sm text-[var(--text-text-default)]">Enable Fullscreen Button</span>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-text-default)] mb-4">Live Preview</h2>
            <div 
              className="rounded-lg p-6 border border-[var(--border-border-neutral-l1)] relative min-h-[400px]"
              style={{
                backgroundColor: config.theme === 'dark' ? '#0a0b0d' : '#f9fafb',
              }}
            >
              <div 
                className="rounded-lg p-4 shadow-lg max-w-sm"
                style={{
                  backgroundColor: config.theme === 'dark' ? '#1a1b1e' : '#ffffff',
                  borderRadius: config.borderRadius,
                  border: `${config.borderWidth} solid ${config.borderColor}`,
                }}
              >
                <div 
                  className="px-4 py-3 rounded-t-lg flex items-center justify-between"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <span className="font-semibold text-white">{config.headerText}</span>
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="p-4 space-y-3">
                  <div 
                    className="rounded-lg p-3 text-sm"
                    style={{ 
                      backgroundColor: config.theme === 'dark' ? '#2d2e32' : '#f3f4f6',
                      color: config.theme === 'dark' ? '#e5e7eb' : '#1f2937' 
                    }}
                  >
                    {config.welcomeMessage}
                  </div>
                  {config.presetQuestions.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {config.presetQuestions.map((q, i) => (
                        <div
                          key={i}
                          className="px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all hover:scale-105"
                          style={{
                            backgroundColor: config.theme === 'dark' ? '#2d2e32' : '#f3f4f6',
                            color: config.theme === 'dark' ? '#e5e7eb' : '#1f2937',
                            border: '1px solid',
                            borderColor: config.theme === 'dark' ? '#3f4045' : '#d1d5db'
                          }}
                        >
                          {q}
                        </div>
                      ))}
                    </div>
                  )}
                  <input
                    type="text"
                    placeholder={config.placeholder}
                    disabled
                    className="w-full px-3 py-2 rounded-lg text-sm"
                    style={{
                      backgroundColor: config.theme === 'dark' ? '#2d2e32' : '#f3f4f6',
                      color: config.theme === 'dark' ? '#e5e7eb' : '#1f2937',
                      border: '1px solid',
                      borderColor: config.theme === 'dark' ? '#3f4045' : '#d1d5db'
                    }}
                  />
                </div>
              </div>

              <div 
                className={`absolute ${config.position.includes('bottom') ? 'bottom-4' : 'top-4'} ${config.position.includes('right') ? 'right-4' : 'left-4'} flex items-center justify-center cursor-pointer transition-all ${
                  config.bubble.animation === 'pulse' ? 'animate-pulse' : 
                  config.bubble.animation === 'bounce' ? 'animate-bounce' : ''
                }`}
                style={{
                  width: config.bubble.size,
                  height: config.bubble.size,
                  backgroundColor: config.bubble.backgroundColor,
                  borderRadius: config.bubble.shape === 'circle' ? '50%' : config.bubble.shape === 'rounded' ? '20%' : '0',
                  boxShadow: config.bubble.shadow ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                }}
              >
                {config.bubble.icon === 'custom' && config.bubble.customIconUrl ? (
                  <img 
                    src={config.bubble.customIconUrl} 
                    alt="Custom icon"
                    className="w-3/5 h-3/5 object-contain"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <svg 
                    className="w-1/2 h-1/2"
                    fill="none" 
                    stroke={config.bubble.iconColor} 
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    {config.bubble.icon === 'chat' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    )}
                    {config.bubble.icon === 'message' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    )}
                    {config.bubble.icon === 'help' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    )}
                    {config.bubble.icon === 'support' && (
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                    )}
                  </svg>
                )}
              </div>

              <div className="mt-4 text-xs text-center" style={{ color: config.theme === 'dark' ? '#6b7280' : '#9ca3af' }}>
                Position: {config.position} | Theme: {config.theme}
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-bg-base-secondary)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-text-default)] mb-4">Integration Code</h2>
            
            <div className="flex space-x-2 mb-4">
              {['cdn', 'npm', 'react'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]'
                      : 'bg-[var(--bg-bg-overlay-l1)] text-[var(--text-text-secondary)]'
                  }`}
                >
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="bg-[var(--bg-bg-base-default)] p-4 rounded-lg overflow-x-auto text-sm border border-[var(--border-border-neutral-l1)]">
                <code className="text-[var(--text-text-default)] font-mono">
                  {activeTab === 'cdn' && generateCDNCode()}
                  {activeTab === 'npm' && generateNPMCode()}
                  {activeTab === 'react' && generateReactCode()}
                </code>
              </pre>
              <button
                onClick={() => {
                  const code = activeTab === 'cdn' ? generateCDNCode() : 
                               activeTab === 'npm' ? generateNPMCode() : 
                               generateReactCode();
                  copyCode(code, activeTab);
                }}
                className="absolute top-2 right-2 flex items-center space-x-2 px-3 py-1.5 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
              >
                {copiedTab === activeTab ? (
                  <>
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-500">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-[var(--text-text-secondary)]" />
                    <span className="text-sm text-[var(--text-text-secondary)]">Copy</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

