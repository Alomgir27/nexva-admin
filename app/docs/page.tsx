"use client";

import { useState } from "react";
import { Copy, Check, Code, Smartphone, Globe } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function DocsPage() {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const codeExamples = {
    html: `<!-- Add this before closing </body> tag -->
<script src="https://cdn.nexva.ai/widget.js"></script>
<script>
  NexvaChat.init('YOUR_API_KEY', {
    apiUrl: 'https://api.nexva.ai',
    position: 'bottom-right',
    primaryColor: '#32f08c',
    welcomeMessage: 'Hi! How can I help you today?',
    enableVoice: true,
    enableHumanSupport: true
  });
</script>`,
    react: `import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.nexva.ai/widget.js';
    script.async = true;
    
    script.onload = () => {
      window.NexvaChat.init('YOUR_API_KEY', {
        apiUrl: 'https://api.nexva.ai',
        position: 'bottom-right',
        primaryColor: '#32f08c',
        welcomeMessage: 'Hi! How can I help?',
        enableVoice: true,
        enableHumanSupport: true
      });
    };
    
    document.body.appendChild(script);
    
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return <div>Your App Content</div>;
}`,
    nextjs: `// app/layout.tsx or pages/_app.tsx
import Script from 'next/script';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Script
          src="https://cdn.nexva.ai/widget.js"
          onLoad={() => {
            window.NexvaChat.init('YOUR_API_KEY', {
              apiUrl: 'https://api.nexva.ai',
              primaryColor: '#32f08c',
              enableVoice: true
            });
          }}
        />
      </body>
    </html>
  );
}`,
    wordpress: `<?php
// Add to functions.php
function nexva_chat_widget() {
    $api_key = 'YOUR_API_KEY';
    ?>
    <script src="https://cdn.nexva.ai/widget.js"></script>
    <script>
      NexvaChat.init('<?php echo $api_key; ?>', {
        apiUrl: 'https://api.nexva.ai',
        position: 'bottom-right',
        primaryColor: '#32f08c',
        enableVoice: true
      });
    </script>
    <?php
}
add_action('wp_footer', 'nexva_chat_widget');
?>`,
    laravel: `{{-- resources/views/layouts/app.blade.php --}}
<!DOCTYPE html>
<html>
<head>
    <title>@yield('title')</title>
</head>
<body>
    @yield('content')
    
    <script src="https://cdn.nexva.ai/widget.js"></script>
    <script>
      NexvaChat.init('{{ config('services.nexva.api_key') }}', {
        apiUrl: 'https://api.nexva.ai',
        position: 'bottom-right',
        primaryColor: '#32f08c'
      });
    </script>
</body>
</html>`,
    vue: `// main.js or App.vue
export default {
  mounted() {
    const script = document.createElement('script');
    script.src = 'https://cdn.nexva.ai/widget.js';
    script.async = true;
    
    script.onload = () => {
      window.NexvaChat.init('YOUR_API_KEY', {
        apiUrl: 'https://api.nexva.ai',
        position: 'bottom-right',
        primaryColor: '#32f08c'
      });
    };
    
    document.body.appendChild(script);
  }
}`
  };

  return (
    <div className="min-h-screen bg-[var(--bg-bg-base-default)]">
      <nav className="border-b border-[var(--border-border-neutral-l1)] sticky top-0 z-50 backdrop-blur-sm bg-[var(--bg-bg-base-default)]/90">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--bg-bg-brand)] opacity-20 blur-xl rounded-full" />
                <Image
                  src="/images/img.png"
                  alt="Nexva Logo"
                  width={32}
                  height={32}
                  className="relative z-10 rounded-lg"
                />
              </div>
              <span className="text-xl font-semibold text-[var(--text-text-default)]">Nexva</span>
            </Link>
            <div className="flex items-center space-x-6">
              <Link href="/#features" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Features
              </Link>
              <Link href="/#pricing" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-[var(--text-text-default)] font-medium">
                Docs
              </Link>
              <Link href="/playground" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Playground
              </Link>
              <Link href="/login" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Sign in
              </Link>
              <Link
                href="/register"
                className="px-5 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-8 max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-semibold text-[var(--text-text-default)] mb-2">
            Widget Integration Documentation
          </h1>
          <p className="text-lg text-[var(--text-text-secondary)]">
            Learn how to integrate Nexva AI Chat widget into your website
          </p>
        </div>

        <div className="space-y-8">
          <section className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Code className="h-5 w-5 text-[var(--bg-bg-brand)]" />
              <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Quick Start</h2>
            </div>
            
            <p className="text-[var(--text-text-secondary)] mb-4">
              Add these two lines of code before the closing <code className="px-2 py-1 bg-[var(--bg-bg-base-secondary)] rounded text-sm">&lt;/body&gt;</code> tag:
            </p>

            <div className="relative">
              <pre className="bg-[var(--bg-bg-base-secondary)] p-4 rounded-lg overflow-x-auto">
                <code className="text-sm text-[var(--text-text-default)]">{codeExamples.html}</code>
              </pre>
              <button
                onClick={() => copyToClipboard(codeExamples.html, 0)}
                className="absolute top-3 right-3 p-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
              >
                {copiedIndex === 0 ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4 text-[var(--text-text-secondary)]" />
                )}
              </button>
            </div>

            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-900 dark:text-blue-200">
                <strong>💡 Pro Tip:</strong> Get your API key from the <Link href="/dashboard/tokens" className="underline font-medium">API Tokens</Link> page
              </p>
            </div>
          </section>

          <section className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Globe className="h-5 w-5 text-[var(--bg-bg-brand)]" />
              <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Framework Integration</h2>
            </div>

            <div className="space-y-6">
              {Object.entries({
                'React': { code: codeExamples.react, index: 1 },
                'Next.js': { code: codeExamples.nextjs, index: 2 },
                'WordPress': { code: codeExamples.wordpress, index: 3 },
                'Laravel': { code: codeExamples.laravel, index: 4 },
                'Vue.js': { code: codeExamples.vue, index: 5 }
              }).map(([name, { code, index }]) => (
                <div key={name} className="border-t border-[var(--border-border-neutral-l1)] pt-4 first:border-t-0 first:pt-0">
                  <h3 className="text-lg font-medium text-[var(--text-text-default)] mb-3">{name}</h3>
                  <div className="relative">
                    <pre className="bg-[var(--bg-bg-base-secondary)] p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm text-[var(--text-text-default)]">{code}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(code, index)}
                      className="absolute top-3 right-3 p-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
                    >
                      {copiedIndex === index ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-[var(--text-text-secondary)]" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-text-default)] mb-4">Configuration Options</h2>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[var(--bg-bg-base-secondary)]">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-text-default)]">Option</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-text-default)]">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-text-default)]">Default</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-[var(--text-text-default)]">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">apiKey</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">-</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Required. Your chatbot API key</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">apiUrl</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">https://api.nexva.ai</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Your backend API URL</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">position</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">bottom-right</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">bottom-right, bottom-left</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">primaryColor</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">#32f08c</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Brand color (hex code)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">welcomeMessage</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Hi! How can I help...</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Initial greeting message</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">placeholder</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Type your message...</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Input placeholder text</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">enableVoice</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">boolean</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">true</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Enable voice chat tab</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">enableHumanSupport</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">boolean</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">true</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Show "Talk to Human" button</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">autoOpen</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">boolean</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">false</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Auto-open chat on page load</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">borderRadius</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">12px</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Border radius for widget (e.g., '0px' for square)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">buttonSize</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">60px</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Size of the chat button</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">buttonColor</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">primaryColor</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Chat button color (defaults to primaryColor)</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">headerText</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Nexva</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">Header title text</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--text-text-default)]">theme</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">string</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">light</td>
                    <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)]">light, dark</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-text-default)] mb-4">🎨 Customization Examples</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-[var(--text-text-default)] mb-3">Custom Colors</h3>
                <div className="relative">
                  <pre className="bg-[var(--bg-bg-base-secondary)] p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-[var(--text-text-default)]">{`NexvaChat.init('your-api-key', {
  primaryColor: '#667eea',    // Purple theme
  buttonColor: '#ed64a6'      // Pink button
});`}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`NexvaChat.init('your-api-key', {
  primaryColor: '#667eea',
  buttonColor: '#ed64a6'
});`, 6)}
                    className="absolute top-3 right-3 p-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
                  >
                    {copiedIndex === 6 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--text-text-secondary)]" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[var(--text-text-default)] mb-3">Square Design</h3>
                <div className="relative">
                  <pre className="bg-[var(--bg-bg-base-secondary)] p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-[var(--text-text-default)]">{`NexvaChat.init('your-api-key', {
  borderRadius: '0px',        // Square corners
  buttonSize: '70px'          // Larger button
});`}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`NexvaChat.init('your-api-key', {
  borderRadius: '0px',
  buttonSize: '70px'
});`, 7)}
                    className="absolute top-3 right-3 p-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
                  >
                    {copiedIndex === 7 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--text-text-secondary)]" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-[var(--text-text-default)] mb-3">Full Customization</h3>
                <div className="relative">
                  <pre className="bg-[var(--bg-bg-base-secondary)] p-4 rounded-lg overflow-x-auto">
                    <code className="text-sm text-[var(--text-text-default)]">{`NexvaChat.init('your-api-key', {
  // Colors
  primaryColor: '#10b981',
  buttonColor: '#059669',
  
  // Size & Shape
  buttonSize: '65px',
  borderRadius: '8px',
  
  // Position
  position: 'bottom-left',
  
  // Text Content
  headerText: 'Support Team',
  welcomeMessage: 'Hello! How can we help?',
  placeholder: 'Type your question...',
  
  // Features
  enableVoice: true,
  enableHumanSupport: true,
  autoOpen: false
});`}</code>
                  </pre>
                  <button
                    onClick={() => copyToClipboard(`NexvaChat.init('your-api-key', {
  primaryColor: '#10b981',
  buttonColor: '#059669',
  buttonSize: '65px',
  borderRadius: '8px',
  position: 'bottom-left',
  headerText: 'Support Team',
  welcomeMessage: 'Hello! How can we help?',
  placeholder: 'Type your question...',
  enableVoice: true,
  enableHumanSupport: true,
  autoOpen: false
});`, 8)}
                    className="absolute top-3 right-3 p-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
                  >
                    {copiedIndex === 8 ? (
                      <Check className="h-4 w-4 text-green-500" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--text-text-secondary)]" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <div className="flex items-center space-x-2 mb-4">
              <Smartphone className="h-5 w-5 text-[var(--bg-bg-brand)]" />
              <h2 className="text-xl font-semibold text-[var(--text-text-default)]">Features</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg">
                <h3 className="font-medium text-[var(--text-text-default)] mb-2">💬 Text Chat</h3>
                <p className="text-sm text-[var(--text-text-secondary)]">
                  Full AI-powered chat with streaming responses and markdown support
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg">
                <h3 className="font-medium text-[var(--text-text-default)] mb-2">🎤 Voice Chat</h3>
                <p className="text-sm text-[var(--text-text-secondary)]">
                  Real-time speech recognition for hands-free interaction
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg">
                <h3 className="font-medium text-[var(--text-text-default)] mb-2">👤 Human Support</h3>
                <p className="text-sm text-[var(--text-text-secondary)]">
                  Escalate to human support team with one click
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg">
                <h3 className="font-medium text-[var(--text-text-default)] mb-2">🎨 Customizable</h3>
                <p className="text-sm text-[var(--text-text-secondary)]">
                  Match your brand with custom colors and messages
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg">
                <h3 className="font-medium text-[var(--text-text-default)] mb-2">📱 Responsive</h3>
                <p className="text-sm text-[var(--text-text-secondary)]">
                  Works perfectly on desktop, tablet, and mobile devices
                </p>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg">
                <h3 className="font-medium text-[var(--text-text-default)] mb-2">⚡ Zero Dependencies</h3>
                <p className="text-sm text-[var(--text-text-secondary)]">
                  Lightweight, fast-loading with no external libraries
                </p>
              </div>
            </div>
          </section>

          <section className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
            <h2 className="text-xl font-semibold text-[var(--text-text-default)] mb-4">Browser Support</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Chrome 90+', 'Firefox 88+', 'Safari 14+', 'Edge 90+'].map(browser => (
                <div key={browser} className="p-3 bg-[var(--bg-bg-base-secondary)] rounded-lg text-center">
                  <p className="text-sm font-medium text-[var(--text-text-default)]">{browser}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-[var(--text-text-secondary)]">
              Voice chat requires Speech Recognition API (Chrome, Edge, Safari)
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

