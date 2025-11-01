"use client";

import { MessageSquare, BarChart3, Settings, Check, ChevronDown, Copy, Play, User, Loader } from "lucide-react";
import Link from "next/link";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

const ThreeJSBackground = dynamic(() => import('./components/ThreeJSBackground'), { 
  ssr: false 
});

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copied, setCopied] = useState<number | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const handlePlanClick = async (planTier: string) => {
    if (planTier === 'free') {
      if (isAuthenticated) {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/register';
      }
      return;
    }

    if (!isAuthenticated) {
      window.location.href = '/register';
      return;
    }

    setPurchasingPlan(planTier);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.billing.createCheckoutSession, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          plan_tier: planTier, 
          billing_period: billingPeriod === 'yearly' ? 'annual' : 'monthly' 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url;
      } else {
        alert("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Failed to start checkout", error);
      alert("Failed to start checkout. Please try again.");
    } finally {
      setPurchasingPlan(null);
    }
  };

  const codeExamples = [
    {
      title: 'CDN Script',
      subtitle: 'Quick Start',
      description: 'Get started instantly by adding a simple script tag to your HTML. Perfect for static sites and quick prototypes.',
      code: `<script 
  src="https://cdn.nexva.ai/widget.js"
  data-api-key="YOUR_API_KEY"
  data-position="bottom-right"
  data-primary-color="#32f08c">
</script>`
    },
    {
      title: 'NPM Package',
      subtitle: 'Modern Build Tools',
      description: 'Install via npm for modern JavaScript applications. Works seamlessly with any bundler like Webpack or Vite.',
      code: `npm install @nexva/chat-widget

import NexvaChat from '@nexva/chat-widget';

NexvaChat.init('YOUR_API_KEY', {
  position: 'bottom-right',
  primaryColor: '#32f08c'
});`
    },
    {
      title: 'React SDK',
      subtitle: 'React Integration',
      description: 'Native React component for seamless integration with your React applications. Full TypeScript support included.',
      code: `import { NexvaChatWidget } from '@nexva/react';

export default function App() {
  return (
    <NexvaChatWidget 
      apiKey="YOUR_API_KEY"
      position="bottom-right"
      primaryColor="#32f08c"
    />
  );
}`
    }
  ];

  const copyCode = (index: number) => {
    navigator.clipboard.writeText(codeExamples[index].code);
    setCopied(index);
    setTimeout(() => setCopied(null), 2000);
  };
  
  return (
    <div className="min-h-screen">
      <nav className="border-b border-[var(--border-border-neutral-l1)] sticky top-0 z-50 backdrop-blur-sm bg-[var(--bg-bg-base-default)]/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--bg-bg-brand)] opacity-20 blur-xl rounded-full" />
                <Image
                  src="/images/img.png"
                  alt="Nexva Logo"
                  width={28}
                  height={28}
                  className="relative z-10 rounded-lg sm:w-8 sm:h-8"
                />
              </div>
              <span className="text-lg sm:text-xl font-semibold text-[var(--text-text-default)]">Nexva</span>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <Link href="#features" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Docs
              </Link>
              <Link href="/playground" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Playground
              </Link>
              
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-5 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <>
                  <Link href="/login" className="text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-5 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex md:hidden items-center space-x-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center px-3 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium text-sm"
                >
                  <User className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="px-3 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium text-sm"
                >
                  Start
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-24 pb-20 min-h-screen flex items-center">
          {/* Top Right Decoration */}
          <div className="absolute top-20 right-10 w-64 h-64 opacity-10">
            <div className="absolute inset-0 border-2 border-[var(--bg-bg-brand)] rounded-full animate-ping" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-4 border-2 border-[var(--bg-bg-brand)] rounded-full" />
            <div className="absolute inset-8 border border-[var(--bg-bg-brand)] rounded-full" />
          </div>

          {/* Bottom Left Decoration */}
          <div className="absolute bottom-20 left-10 w-48 h-48 opacity-10">
            <div className="absolute inset-0 bg-[var(--bg-bg-brand)] rounded-lg rotate-45" />
            <div className="absolute inset-4 border-2 border-[var(--bg-bg-brand)] rounded-lg rotate-45" />
          </div>

          <div className="grid lg:grid-cols-2 gap-16 items-center w-full relative z-10">
            <div className="space-y-6">
              <h1 className="text-5xl lg:text-6xl font-semibold text-[var(--text-text-default)] leading-[1.1]">
                <span className="text-[var(--bg-bg-brand)]">AI Chat</span> for Your <span className="text-[var(--bg-bg-brand)]">Website</span>
              </h1>
              <p className="text-xl text-[var(--text-text-secondary)] leading-relaxed">
                Deploy intelligent AI chatbots in minutes. Powered by self-hosted AI with voice support and advanced RAG technology.
              </p>
              <div className="flex space-x-4 pt-4">
                <Link
                  href="/dashboard"
                  className="px-7 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium"
                >
                  Get Started Free
                </Link>
                <button className="px-7 py-3 bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all">
                  View Demo
                </button>
              </div>
              <div className="flex items-center space-x-10 pt-6">
                <div>
                  <div className="text-3xl font-semibold text-[var(--text-text-default)]">1,200+</div>
                  <div className="text-sm text-[var(--text-text-tertiary)]">Active Chatbots</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-[var(--text-text-default)]">50K+</div>
                  <div className="text-sm text-[var(--text-text-tertiary)]">Conversations</div>
                </div>
                <div>
                  <div className="text-3xl font-semibold text-[var(--text-text-default)]">0.8s</div>
                  <div className="text-sm text-[var(--text-text-tertiary)]">Avg Response</div>
                </div>
              </div>
            </div>
            
            {/* Right Side - NEXVA Text with Three.js */}
            <div className="relative flex items-center justify-center min-h-[300px] sm:min-h-[400px]">
              <div className="absolute inset-0 opacity-30">
                <ThreeJSBackground />
              </div>
              <div className="relative z-10 text-center">
                <h2 
                  className="text-[5rem] sm:text-[8rem] lg:text-[10rem] font-black uppercase leading-none select-none mb-4 sm:mb-8"
                  style={{
                    color: 'var(--bg-bg-brand)',
                    WebkitTextStroke: '1px var(--bg-bg-brand)',
                    textShadow: '0 0 30px rgba(50, 240, 140, 0.4)',
                    letterSpacing: '0.05em',
                  }}
                >
                  NEXVA
                </h2>

                {/* Bottom accent with version */}
                <div className="flex items-center justify-center space-x-3 sm:space-x-6">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-[var(--bg-bg-brand)] rounded-full animate-pulse" />
                    <span className="text-[10px] sm:text-xs font-mono text-[var(--text-text-tertiary)] tracking-wider">AI POWERED</span>
                  </div>
                  <div className="h-4 w-px bg-[var(--border-border-neutral-l1)]" />
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] sm:text-xs font-mono text-[var(--text-text-tertiary)] tracking-wider">v1.0</span>
                    <div className="w-2 h-2 bg-[var(--bg-bg-brand)] rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 bg-[var(--bg-bg-base-secondary)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-5xl font-semibold text-[var(--text-text-default)] mb-6">
                See How It Works
              </h2>
              <p className="text-xl text-[var(--text-text-secondary)] max-w-3xl mx-auto">
                Watch Nexva AI chatbot in action. See how easy it is to integrate and engage with your customers.
              </p>
            </div>
            
            <div className="max-w-5xl mx-auto">
              <div className="relative aspect-video bg-[var(--bg-bg-base-default)] rounded-2xl border-2 border-[var(--border-border-neutral-l1)] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--bg-bg-brand)]/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 bg-[var(--bg-bg-brand)]/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-[var(--bg-bg-brand)] group cursor-pointer hover:scale-110 transition-transform">
                      <Play className="h-10 w-10 text-[var(--bg-bg-brand)] ml-1" />
                    </div>
                    <p className="text-lg text-[var(--text-text-secondary)]">Click to play demo video</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="py-24">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-20">
              <h2 className="text-4xl font-semibold text-[var(--text-text-default)] mb-4">
                Everything you need to get started
              </h2>
              <p className="text-lg text-[var(--text-text-secondary)]">
                Powerful features to enhance your customer engagement
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-16">
              {/* Feature 1 */}
              <div className="group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-2 h-16 bg-[var(--bg-bg-brand)] rounded-full"></div>
                  <div>
                    <span className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-wider">Feature 01</span>
                    <h3 className="text-2xl font-semibold text-[var(--text-text-default)] mt-1">
                      Real-time Streaming
                    </h3>
                  </div>
                </div>
                
                <p className="text-[var(--text-text-secondary)] leading-relaxed text-lg mb-6 pl-6">
                  Instant streaming responses with real-time WebSocket connections. Context-aware AI conversations with advanced RAG architecture for accurate and relevant answers.
                </p>

                <div className="pl-6 flex items-center space-x-3">
                  <MessageSquare className="h-5 w-5 text-[var(--bg-bg-brand)]" />
                  <span className="text-sm text-[var(--text-text-tertiary)]">Instant responses</span>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-2 h-16 bg-[var(--bg-bg-brand)] rounded-full"></div>
                  <div>
                    <span className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-wider">Feature 02</span>
                    <h3 className="text-2xl font-semibold text-[var(--text-text-default)] mt-1">
                      Intelligent Search
                    </h3>
                  </div>
                </div>
                
                <p className="text-[var(--text-text-secondary)] leading-relaxed text-lg mb-6 pl-6">
                  Enterprise-grade semantic search with AI-powered context understanding. Combines intelligent content analysis with keyword matching for precise and relevant information retrieval.
                </p>

                <div className="pl-6 flex items-center space-x-3">
                  <BarChart3 className="h-5 w-5 text-[var(--bg-bg-brand)]" />
                  <span className="text-sm text-[var(--text-text-tertiary)]">Smart search</span>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-2 h-16 bg-[var(--bg-bg-brand)] rounded-full"></div>
                  <div>
                    <span className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-wider">Feature 03</span>
                    <h3 className="text-2xl font-semibold text-[var(--text-text-default)] mt-1">
                      Voice Enabled
                    </h3>
                  </div>
                </div>
                
                <p className="text-[var(--text-text-secondary)] leading-relaxed text-lg mb-6 pl-6">
                  Natural voice conversations with crystal-clear audio quality. Talk to your chatbot with real-time speech recognition and lifelike voice responses in multiple accents.
                </p>

                <div className="pl-6 flex items-center space-x-3">
                  <Settings className="h-5 w-5 text-[var(--bg-bg-brand)]" />
                  <span className="text-sm text-[var(--text-text-tertiary)]">Voice chat</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 bg-[var(--bg-bg-base-secondary)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-semibold text-[var(--text-text-default)] mb-4">
                Simple, transparent pricing
              </h2>
              <p className="text-lg text-[var(--text-text-secondary)] mb-8">
                Choose the perfect plan for your business
              </p>
            </div>

            <div className="flex justify-center mb-8">
              <div className="inline-flex items-center bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-lg p-1">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingPeriod === 'monthly'
                      ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]'
                      : 'text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)]'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px-6 py-2 rounded-md font-medium transition-all ${
                    billingPeriod === 'yearly'
                      ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]'
                      : 'text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)]'
                  }`}
                >
                  Yearly
                  <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-8">
              <div className="bg-[var(--bg-bg-base-default)] rounded-xl border border-[var(--border-border-neutral-l1)] p-8">
                <h3 className="text-2xl font-semibold text-[var(--text-text-default)] mb-2">Free</h3>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-[var(--text-text-default)]">$0</span>
                  <span className="text-[var(--text-text-secondary)]">/month</span>
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">1 chatbot</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Unlimited domains</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Basic support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Web scraping</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Document upload</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('free')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasingPlan === 'free' ? (
                    <Loader className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "Go to Dashboard" : "Get Started"
                  )}
                </button>
              </div>

              <div className="bg-[var(--bg-bg-base-default)] rounded-xl border border-[var(--border-border-neutral-l1)] p-8">
                <h3 className="text-2xl font-semibold text-[var(--text-text-default)] mb-2">Basic</h3>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-[var(--text-text-default)]">
                      ${billingPeriod === 'monthly' ? '9.99' : '7.99'}
                    </span>
                    <span className="text-[var(--text-text-secondary)] ml-2">/month</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-green-500 mt-1">
                      $95.99 billed annually
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">5 chatbots</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Unlimited domains</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Custom branding</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('basic')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasingPlan === 'basic' ? (
                    <Loader className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "Upgrade to Basic" : "Get Started"
                  )}
                </button>
              </div>

              <div className="bg-[var(--bg-bg-base-default)] rounded-xl border-2 border-[var(--bg-bg-brand)] p-8 relative">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] px-4 py-1 rounded-full text-sm font-medium">
                  Popular
                </div>
                <h3 className="text-2xl font-semibold text-[var(--text-text-default)] mb-2">Pro</h3>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-[var(--text-text-default)]">
                      ${billingPeriod === 'monthly' ? '24.99' : '19.99'}
                    </span>
                    <span className="text-[var(--text-text-secondary)] ml-2">/month</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-green-500 mt-1">
                      $239.99 billed annually
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">15 chatbots</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Unlimited domains</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Priority support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">API access</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('pro')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasingPlan === 'pro' ? (
                    <Loader className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "Upgrade to Pro" : "Get Started"
                  )}
                </button>
              </div>

              <div className="bg-[var(--bg-bg-base-default)] rounded-xl border border-[var(--border-border-neutral-l1)] p-8">
                <h3 className="text-2xl font-semibold text-[var(--text-text-default)] mb-2">Enterprise</h3>
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-[var(--text-text-default)]">
                      ${billingPeriod === 'monthly' ? '49.99' : '39.99'}
                    </span>
                    <span className="text-[var(--text-text-secondary)] ml-2">/month</span>
                  </div>
                  {billingPeriod === 'yearly' && (
                    <p className="text-sm text-green-500 mt-1">
                      $479.99 billed annually
                    </p>
                  )}
                </div>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Unlimited chatbots</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Unlimited domains</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">24/7 dedicated support</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">White-label solution</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 text-[var(--bg-bg-brand)] mr-3 mt-0.5" />
                    <span className="text-[var(--text-text-secondary)]">Custom integrations</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('enterprise')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasingPlan === 'enterprise' ? (
                    <Loader className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "Upgrade to Enterprise" : "Get Started"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="integration-section" className="py-24 bg-[var(--bg-bg-base-secondary)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-semibold text-[var(--text-text-default)] mb-6">
                Integrate in Minutes
              </h2>
              <p className="text-lg text-[var(--text-text-secondary)]">
                Add Nexva to your website with just a few lines of code. Choose your preferred method.
              </p>
            </div>

            <div className="relative">
              <div className="absolute left-1/2 top-0 bottom-0 w-px hidden lg:block">
                <div 
                  className="absolute inset-0 bg-gradient-to-b from-transparent via-[var(--bg-bg-brand)]/30 to-transparent"
                  style={{
                    backgroundImage: 'repeating-linear-gradient(0deg, var(--bg-bg-brand), var(--bg-bg-brand) 10px, transparent 10px, transparent 20px)',
                    opacity: 0.3
                  }}
                />
              </div>

              <div className="space-y-24">
                {codeExamples.map((example, index) => (
                  <div key={index} className="relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 hidden lg:flex items-center justify-center">
                      <div className="absolute w-16 h-16 border-2 border-[var(--bg-bg-brand)]/20 rounded-full animate-ping" style={{ animationDuration: '2s' }}></div>
                      <div className="absolute w-12 h-12 border-2 border-[var(--bg-bg-brand)]/30 rounded-full animate-ping" style={{ animationDuration: '2s', animationDelay: '0.5s' }}></div>
                      <div className="w-8 h-8 bg-[var(--bg-bg-base-secondary)] rounded-full border-2 border-[var(--bg-bg-brand)]/40 flex items-center justify-center relative z-10">
                        <div className="w-3 h-3 bg-[var(--bg-bg-brand)] rounded-full animate-pulse" />
                      </div>
                    </div>

                    <div
                      className={`grid lg:grid-cols-2 gap-12 items-center ${
                        index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                      }`}
                    >
                      <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                        <div className="inline-block px-4 py-1 bg-[var(--bg-bg-brand)]/10 border border-[var(--bg-bg-brand)]/20 rounded-full mb-4">
                          <span className="text-sm font-medium text-[var(--bg-bg-brand)]">{example.subtitle}</span>
                        </div>
                        <h3 className="text-3xl font-semibold text-[var(--text-text-default)] mb-4">
                          {example.title}
                        </h3>
                        <p className="text-lg text-[var(--text-text-secondary)] leading-relaxed mb-6">
                          {example.description}
                        </p>
                        <div className="flex items-center space-x-3">
                          <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] rounded-full"></div>
                          <span className="text-sm text-[var(--text-text-tertiary)]">Copy and paste to get started</span>
                        </div>
                      </div>

                      <div className={index % 2 === 1 ? 'lg:order-1' : ''}>
                        <div className="bg-[var(--bg-bg-base-default)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 shadow-lg">
                          <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-mono text-[var(--text-text-tertiary)]">{example.title}</span>
                            <button
                              onClick={() => copyCode(index)}
                              className="flex items-center space-x-2 px-3 py-1.5 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded-lg transition-all"
                            >
                              {copied === index ? (
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
                          <pre className="bg-[var(--bg-bg-base-secondary)] p-4 rounded-lg overflow-x-auto">
                            <code className="text-sm text-[var(--text-text-default)] font-mono">
{example.code}
                            </code>
                          </pre>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center mt-16">
              <Link
                href="/docs"
                className="inline-block px-6 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium"
              >
                View Full Documentation
              </Link>
            </div>
          </div>
        </section>

        <section className="py-24">
          <div className="max-w-3xl mx-auto px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-semibold text-[var(--text-text-default)] mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-lg text-[var(--text-text-secondary)]">
                Everything you need to know about Nexva
              </p>
            </div>

            <div className="space-y-2">
              {[
                {
                  q: "How does pricing work?",
                  a: "Pricing is based on the number of messages per month and features you need. You can start with our free plan and upgrade anytime as your needs grow. All paid plans include a 14-day free trial."
                },
                {
                  q: "Can I customize the widget?",
                  a: "Yes! You can customize colors, position, welcome messages, and more. Pro and Enterprise plans offer advanced customization options including custom branding and voice models."
                },
                {
                  q: "Is voice chat included?",
                  a: "Voice chat is included in Pro and Enterprise plans. The free plan includes text chat only. Voice features include speech-to-text and text-to-speech capabilities."
                },
                {
                  q: "What's the setup time?",
                  a: "Most users are up and running in under 5 minutes. Simply sign up, get your API key, add two lines of code to your website, and you're done. No technical expertise required."
                },
                {
                  q: "Do you offer support?",
                  a: "Yes! Free plans get basic email support, Pro plans get priority support with faster response times, and Enterprise plans get dedicated support with SLA guarantees."
                },
                {
                  q: "Can I cancel anytime?",
                  a: "Absolutely. You can cancel your subscription at any time with no questions asked. Your chatbot will continue to work until the end of your billing period."
                }
              ].map((faq, index) => (
                <div
                  key={index}
                  className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-[var(--bg-bg-overlay-l2)] transition-all"
                  >
                    <span className="text-lg font-medium text-[var(--text-text-default)]">
                      {faq.q}
                    </span>
                    <ChevronDown
                      className={`h-5 w-5 text-[var(--text-text-secondary)] transition-transform ${
                        openFaq === index ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {openFaq === index && (
                    <div className="px-6 pb-4 border-t border-[var(--border-border-neutral-l1)]">
                      <p className="text-[var(--text-text-secondary)] leading-relaxed pt-4">
                        {faq.a}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
            <h2 className="text-4xl font-semibold text-[var(--text-text-default)] mb-4">
              Ready to transform your customer support?
            </h2>
            <p className="text-lg text-[var(--text-text-secondary)] mb-8">
              Join hundreds of businesses using Nexva to automate conversations
            </p>
            <Link
              href="/dashboard"
              className="inline-block px-7 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium"
            >
              Start Free Trial
            </Link>
          </div>
        </section>
      </main>

      <footer className="relative border-t border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-secondary)] overflow-hidden pb-32 sm:pb-48">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 mb-12 sm:mb-16">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2 sm:space-x-3 mb-4 sm:mb-6">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--bg-bg-brand)] opacity-20 blur-xl rounded-full" />
                  <Image
                    src="/images/img.png"
                    alt="Nexva Logo"
                    width={28}
                    height={28}
                    className="relative z-10 rounded-lg sm:w-8 sm:h-8"
                  />
                </div>
                <span className="text-xl sm:text-2xl font-semibold text-[var(--text-text-default)]">Nexva</span>
              </div>
              <p className="text-sm text-[var(--text-text-tertiary)] leading-relaxed">
                AI-powered chatbot platform for modern websites
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--text-text-default)] mb-3 sm:mb-4 text-sm sm:text-base">Product</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="#features" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Pricing</Link></li>
                <li><Link href="/docs" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Documentation</Link></li>
                <li><Link href="/dashboard" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Dashboard</Link></li>
                <li><Link href="/playground" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Playground</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--text-text-default)] mb-3 sm:mb-4 text-sm sm:text-base">Company</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/about" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">About</Link></li>
                <li><Link href="/blog" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-[var(--text-text-default)] mb-3 sm:mb-4 text-sm sm:text-base">Legal</h3>
              <ul className="space-y-2 sm:space-y-3">
                <li><Link href="/privacy" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Privacy</Link></li>
                <li><Link href="/terms" className="text-xs sm:text-sm text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">Terms</Link></li>
              </ul>
            </div>
          </div>

          <div className="pt-6 sm:pt-8 border-t border-[var(--border-border-neutral-l1)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs sm:text-sm text-[var(--text-text-tertiary)]">© 2025 Nexva. All rights reserved.</p>
            <div className="flex space-x-4 sm:space-x-6">
              <a href="#" className="text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"/></svg>
              </a>
              <a href="#" className="text-[var(--text-text-tertiary)] hover:text-[var(--bg-bg-brand)] transition-colors">
                <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Fixed NEXVA Text at Bottom */}
      <div className="fixed bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden">
        <div className="relative w-full h-32 sm:h-48 flex items-center justify-center px-4 sm:px-8">
          <h1 
            className="text-[clamp(6rem,20vw,20rem)] sm:text-[clamp(10rem,25vw,20rem)] uppercase select-none opacity-20"
            style={{
              fontFamily: 'var(--font-family-default)',
              fontWeight: 900,
              color: 'var(--bg-bg-brand)',
              WebkitTextStroke: '1px var(--bg-bg-brand)',
              textShadow: '0 0 20px rgba(50, 240, 140, 0.3)',
              letterSpacing: '0',
            }}
          >
            NEXVA
          </h1>
        </div>
      </div>
    </div>
  );
}
