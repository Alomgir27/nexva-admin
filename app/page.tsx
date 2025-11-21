"use client";

import { MessageSquare, BarChart3, Settings, Check, ChevronDown, Copy, User, Loader, Layers, Cpu, Sparkles } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { API_ENDPOINTS } from "@/app/config/api";

export default function Home() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [copiedIntegration, setCopiedIntegration] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [purchasingPlan, setPurchasingPlan] = useState<string | null>(null);
  const [activeIntegrationKey, setActiveIntegrationKey] = useState('cdn');

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
          Authorization: `Bearer ${token} `,
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

  const integrationOptions = [
    {
      key: 'cdn',
      label: 'Script Tag',
      title: 'Drop-in CDN Script',
      description: 'Add a single script tag to any site. Configure placement, colors, and behavior with simple data attributes.',
      highlights: [
        'Works with any static site or CMS',
        'Customize colors and position via attributes',
        'No build step required'
      ],
      code: `< script
src = "https://cdn.nexva.ai/widget.js"
data - api - key="YOUR_API_KEY"
data - position="bottom-right"
data - primary - color="#32f08c" >
</script > `
    },
    {
      key: 'react',
      label: 'React SDK',
      title: 'React Component',
      description: 'Use the Nexva React SDK for full TypeScript support, hooks, and automatic token handling.',
      highlights: [
        'Tree-shakable React component',
        'Full TypeScript definitions',
        'Access to lifecycle hooks'
      ],
      code: `import { NexvaChat } from 'nexva-react';

export default function App() {
  return (
    <NexvaChat
      config={{
        apiKey: "YOUR_API_KEY",
        position: "bottom-right",
        primaryColor: "#32f08c"
      }}
    />
  );
} `
    },
    {
      key: 'next',
      label: 'Next.js SDK',
      title: 'Next.js + App Router',
      description: 'Embed NexvaChatNext inside your root layout for automatic hydration and zero layout shifts.',
      highlights: [
        'SSR friendly component',
        'Works with App & Pages Router',
        'No client-side routing hacks'
      ],
      code: `import { NexvaChatNext } from 'nexva-react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <NexvaChatNext
          config={{
            apiKey: "YOUR_API_KEY",
            position: "bottom-right",
            primaryColor: "#32f08c"
          }}
        />
      </body>
    </html>
  );
} `
    }
  ];

  const activeIntegration = integrationOptions.find((option) => option.key === activeIntegrationKey) ?? integrationOptions[0];

  const workflowSteps = [
    {
      title: 'Connect your sources',
      description: 'Sync websites, docs, support articles, and product knowledge with one click.',
      badge: 'Step 01',
      icon: Layers
    },
    {
      title: 'Train the AI brain',
      description: 'Nexva automatically chunks, tags, and embeds your data for lightning-fast answers.',
      badge: 'Step 02',
      icon: Cpu
    },
    {
      title: 'Launch everywhere',
      description: 'Drop the widget on your site or use the API to power custom chat surfaces.',
      badge: 'Step 03',
      icon: Sparkles
    }
  ];

  const copyIntegrationCode = (code: string, key: string) => {
    navigator.clipboard.writeText(code);
    setCopiedIntegration(key);
    setTimeout(() => setCopiedIntegration(null), 2000);
  };

  return (
    <div className="min-h-screen overflow-x-hidden">
      <nav className="border-b border-[var(--border-border-neutral-l1)] sticky top-0 z-50 backdrop-blur-sm bg-[var(--bg-bg-base-default)]/90">
        <div className="w-full px-4 sm:px-6 lg:px-12">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="relative">
                  <div className="absolute inset-0 bg-[var(--bg-bg-brand)]/20 blur-md"></div>
                  <Image src="/images/img.png" alt="Nexva" width={32} height={32} className="relative z-10" />
                </div>
                <span className="text-xl font-bold tracking-tighter uppercase text-[var(--text-text-default)]">Nexva</span>
              </Link>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="#features" className="text-sm font-mono uppercase tracking-wider text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-mono uppercase tracking-wider text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Pricing
              </Link>
              <Link href="/playground" className="text-sm font-mono uppercase tracking-wider text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Playground
              </Link>

              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center space-x-2 px-6 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-brand-hover)] transition-all text-xs"
                >
                  <User className="h-4 w-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <div className="flex items-center space-x-0 border border-[var(--border-border-neutral-l1)]">
                  <Link href="/login" className="px-6 py-2 text-xs font-bold uppercase tracking-wider font-mono text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors border-r border-[var(--border-border-neutral-l1)]">
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    className="px-6 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-brand-hover)] transition-all text-xs"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>

            <div className="flex md:hidden items-center space-x-2">
              {isAuthenticated ? (
                <Link
                  href="/dashboard"
                  className="flex items-center px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-brand-hover)] transition-all text-xs"
                >
                  <User className="h-4 w-4" />
                </Link>
              ) : (
                <Link
                  href="/register"
                  className="px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono hover:bg-[var(--bg-bg-brand-hover)] transition-all text-xs"
                >
                  Start
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="w-full">
        <section className="relative w-full min-h-screen flex items-center tech-grid border-b border-[var(--border-border-neutral-l1)]">
          {/* Top Right Decoration - Sharp & Technical */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-20 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-full h-px bg-gradient-to-l from-[var(--bg-bg-brand)] to-transparent" />
            <div className="absolute top-0 right-0 h-full w-px bg-gradient-to-b from-[var(--bg-bg-brand)] to-transparent" />
            <div className="absolute top-20 right-20 w-32 h-32 border border-[var(--bg-bg-brand)]/30" />
            <div className="absolute top-10 right-10 w-64 h-64 border border-[var(--bg-bg-brand)]/10" />
          </div>

          <div className="w-full px-4 sm:px-6 lg:px-12 grid lg:grid-cols-2 gap-16 items-center relative z-10">
            <div className="space-y-8 pt-20">
              <div className="inline-flex items-center space-x-2 px-3 py-1 bg-[var(--bg-bg-brand)]/10 border-l-2 border-[var(--bg-bg-brand)] mb-4">
                <span className="text-sm font-mono text-[var(--bg-bg-brand)] uppercase tracking-widest">v1.0 System Online</span>
              </div>

              <h1 className="text-6xl lg:text-8xl font-bold text-[var(--text-text-default)] leading-[0.9] tracking-tighter">
                AI CHAT <br />
                <span className="text-gradient-brand">DEPLOYED.</span>
              </h1>

              <p className="text-xl text-[var(--text-text-secondary)] leading-relaxed max-w-lg font-light">
                Deploy intelligent AI chatbots in minutes. Self-hosted. Voice-enabled. RAG-powered.
              </p>

              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-0 pt-8">
                <Link
                  href="/dashboard"
                  className="px-8 py-4 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] transition-all font-bold text-lg uppercase tracking-wider border border-[var(--bg-bg-brand)] hover:shadow-[0_0_20px_rgba(50,240,140,0.3)]"
                >
                  Initialize System
                </Link>
                <button className="px-8 py-4 bg-transparent border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] hover:bg-[var(--bg-bg-overlay-l1)] hover:border-[var(--text-text-default)] transition-all font-medium text-lg uppercase tracking-wider sm:border-l-0">
                  View Demo
                </button>
              </div>

              <div className="grid grid-cols-3 gap-8 pt-12 border-t border-[var(--border-border-neutral-l1)]">
                <div>
                  <div className="text-3xl font-bold text-[var(--text-text-default)] font-mono">1.2K+</div>
                  <div className="text-xs text-[var(--text-text-tertiary)] uppercase tracking-widest mt-1">Active Bots</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--text-text-default)] font-mono">50K+</div>
                  <div className="text-xs text-[var(--text-text-tertiary)] uppercase tracking-widest mt-1">Sessions</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-[var(--text-text-default)] font-mono">0.8s</div>
                  <div className="text-xs text-[var(--text-text-tertiary)] uppercase tracking-widest mt-1">Latency</div>
                </div>
              </div>
            </div>

            {/* Right Side - Technical Visual */}
            <div className="relative flex items-center justify-center min-h-[500px] border-l border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-overlay-l1)]/30 backdrop-blur-sm">
              <div className="absolute inset-0 opacity-40 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
              <div className="relative z-10 text-center">
                <h2
                  className="text-[6rem] sm:text-[10rem] lg:text-[12rem] font-black uppercase leading-none select-none mb-8"
                  style={{
                    color: 'transparent',
                    WebkitTextStroke: '1px var(--bg-bg-brand)',
                    letterSpacing: '-0.05em',
                  }}
                >
                  NEXVA
                </h2>

                <div className="flex items-center justify-center space-x-6 bg-black/80 border border-[var(--border-border-neutral-l1)] py-2 px-8 inline-flex mx-auto backdrop-blur-md">
                  <div className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse" />
                    <span className="text-xs font-mono text-[var(--bg-bg-brand)] tracking-widest">SYSTEM READY</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-0 bg-black relative border-b border-[var(--border-border-neutral-l1)]" id="workflow">
          <div className="w-full grid md:grid-cols-4">
            <div className="md:col-span-1 p-12 border-r border-[var(--border-border-neutral-l1)] flex flex-col justify-center">
              <h2 className="text-4xl font-bold text-[var(--text-text-default)] mb-4 leading-tight">
                SYSTEM <br /><span className="text-[var(--bg-bg-brand)]">WORKFLOW</span>
              </h2>
              <p className="text-sm text-[var(--text-text-secondary)] font-mono mt-4">
                // AUTOMATED DEPLOYMENT PIPELINE
                <br />
                // ZERO CONFIGURATION REQUIRED
              </p>
            </div>

            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="group relative p-12 border-r border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors duration-300 last:border-r-0"
                >
                  <div className="absolute top-6 right-6 text-xs font-mono text-[var(--text-text-tertiary)] opacity-50">
                    0{index + 1}
                  </div>

                  <div className="mb-8">
                    <Icon className="h-8 w-8 text-[var(--bg-bg-brand)]" />
                  </div>

                  <h3 className="text-xl font-bold text-[var(--text-text-default)] mb-4 uppercase tracking-wide">
                    {step.title}
                  </h3>

                  <p className="text-[var(--text-text-secondary)] text-sm leading-relaxed mb-8">
                    {step.description}
                  </p>

                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[var(--bg-bg-brand)] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
                </div>
              );
            })}
          </div>
        </section>

        <section id="features" className="py-24 relative border-b border-[var(--border-border-neutral-l1)]">
          <div className="w-full px-4 sm:px-6 lg:px-12">
            <div className="text-left mb-20 border-l-2 border-[var(--bg-bg-brand)] pl-6">
              <h2 className="text-4xl font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-tight">
                Core Capabilities
              </h2>
              <p className="text-lg text-[var(--text-text-secondary)] font-mono">
                // ADVANCED FEATURE SET
              </p>
            </div>

            <div className="grid lg:grid-cols-3 border-t border-l border-[var(--border-border-neutral-l1)]">
              {/* Feature 1 */}
              <div className="group p-12 border-r border-b border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 bg-[var(--bg-bg-brand)] group-hover:h-full transition-all duration-500" />

                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-[var(--bg-bg-brand)]/10 flex items-center justify-center border border-[var(--bg-bg-brand)]/20">
                    <MessageSquare className="h-6 w-6 text-[var(--bg-bg-brand)]" />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Module 01</span>
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-text-default)] mb-4 uppercase">
                  Real-time Streaming
                </h3>

                <p className="text-[var(--text-text-secondary)] leading-relaxed text-sm mb-8">
                  Instant streaming responses via WebSocket. Context-aware AI conversations with advanced RAG architecture.
                </p>

                <div className="flex items-center space-x-2 text-[var(--bg-bg-brand)] text-xs font-mono uppercase tracking-wider">
                  <span>Status: Active</span>
                  <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse" />
                </div>
              </div>

              {/* Feature 2 */}
              <div className="group p-12 border-r border-b border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 bg-[var(--bg-bg-brand)] group-hover:h-full transition-all duration-500" />

                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-[var(--bg-bg-brand)]/10 flex items-center justify-center border border-[var(--bg-bg-brand)]/20">
                    <BarChart3 className="h-6 w-6 text-[var(--bg-bg-brand)]" />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Module 02</span>
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-text-default)] mb-4 uppercase">
                  Intelligent Search
                </h3>

                <p className="text-[var(--text-text-secondary)] leading-relaxed text-sm mb-8">
                  Enterprise-grade semantic search. AI-powered context understanding with hybrid keyword matching.
                </p>

                <div className="flex items-center space-x-2 text-[var(--bg-bg-brand)] text-xs font-mono uppercase tracking-wider">
                  <span>Status: Active</span>
                  <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse" />
                </div>
              </div>

              {/* Feature 3 */}
              <div className="group p-12 border-r border-b border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-0 bg-[var(--bg-bg-brand)] group-hover:h-full transition-all duration-500" />

                <div className="flex items-center space-x-4 mb-8">
                  <div className="w-12 h-12 bg-[var(--bg-bg-brand)]/10 flex items-center justify-center border border-[var(--bg-bg-brand)]/20">
                    <Settings className="h-6 w-6 text-[var(--bg-bg-brand)]" />
                  </div>
                  <span className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Module 03</span>
                </div>

                <h3 className="text-2xl font-bold text-[var(--text-text-default)] mb-4 uppercase">
                  Voice Enabled
                </h3>

                <p className="text-[var(--text-text-secondary)] leading-relaxed text-sm mb-8">
                  Natural voice conversations. Crystal-clear audio quality with real-time speech recognition.
                </p>

                <div className="flex items-center space-x-2 text-[var(--bg-bg-brand)] text-xs font-mono uppercase tracking-wider">
                  <span>Status: Active</span>
                  <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="pricing" className="py-24 bg-black relative border-b border-[var(--border-border-neutral-l1)]">
          <div className="w-full px-4 sm:px-6 lg:px-12 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-[var(--border-border-neutral-l1)] pb-8">
              <div>
                <h2 className="text-4xl font-bold text-[var(--text-text-default)] mb-2 uppercase tracking-tight">
                  System Access
                </h2>
                <p className="text-lg text-[var(--text-text-secondary)] font-mono">
                  // SELECT TIER
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-8 md:mt-0">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`px - 6 py - 2 text - sm font - mono uppercase tracking - wider border transition - all ${billingPeriod === 'monthly'
                    ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] border-[var(--bg-bg-brand)]'
                    : 'text-[var(--text-text-secondary)] border-[var(--border-border-neutral-l1)] hover:border-[var(--text-text-default)]'
                    } `}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('yearly')}
                  className={`px - 6 py - 2 text - sm font - mono uppercase tracking - wider border transition - all ${billingPeriod === 'yearly'
                    ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] border-[var(--bg-bg-brand)]'
                    : 'text-[var(--text-text-secondary)] border-[var(--border-border-neutral-l1)] hover:border-[var(--text-text-default)]'
                    } `}
                >
                  Yearly [-20%]
                </button>
              </div>
            </div>

            <div className="grid lg:grid-cols-4 gap-0 border-l border-[var(--border-border-neutral-l1)]">
              {/* Free Plan */}
              <div className="p-8 border-r border-b border-t border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <h3 className="text-xl font-bold text-[var(--text-text-default)] mb-2 uppercase">Free</h3>
                <div className="mb-8">
                  <span className="text-4xl font-bold text-[var(--text-text-default)] font-mono">$0</span>
                  <span className="text-[var(--text-text-secondary)] font-mono text-sm">/MO</span>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">1 chatbot</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">Unlimited domains</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">Basic support</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('free')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] hover:bg-[var(--text-text-default)] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-wider"
                >
                  {purchasingPlan === 'free' ? (
                    <Loader className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "ACCESS DASHBOARD" : "INITIALIZE"
                  )}
                </button>
              </div>

              {/* Basic Plan */}
              <div className="p-8 border-r border-b border-t border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <h3 className="text-xl font-bold text-[var(--text-text-default)] mb-2 uppercase">Basic</h3>
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-[var(--text-text-default)] font-mono">
                      ${billingPeriod === 'monthly' ? '9.99' : '7.99'}
                    </span>
                    <span className="text-[var(--text-text-secondary)] font-mono text-sm ml-1">/MO</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">5 chatbots</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">Unlimited domains</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">Priority support</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('basic')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] transition-all font-mono text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {purchasingPlan === 'basic' ? (
                    <Loader className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "UPGRADE SYSTEM" : "INITIALIZE"
                  )}
                </button>
              </div>

              {/* Pro Plan */}
              <div className="p-8 border-r border-b border-t border-[var(--bg-bg-brand)] bg-[var(--bg-bg-brand)]/5 relative group">
                <div className="absolute top-0 right-0 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] px-2 py-1 text-[10px] font-mono uppercase tracking-widest">
                  RECOMMENDED
                </div>
                <h3 className="text-xl font-bold text-[var(--text-text-default)] mb-2 uppercase">Pro</h3>
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-[var(--text-text-default)] font-mono">
                      ${billingPeriod === 'monthly' ? '24.99' : '19.99'}
                    </span>
                    <span className="text-[var(--text-text-secondary)] font-mono text-sm ml-1">/MO</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">15 chatbots</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">Advanced analytics</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">API access</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('pro')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] transition-all font-bold font-mono text-sm uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(50,240,140,0.2)]"
                >
                  {purchasingPlan === 'pro' ? (
                    <Loader className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "UPGRADE SYSTEM" : "INITIALIZE"
                  )}
                </button>
              </div>

              {/* Enterprise Plan */}
              <div className="p-8 border-r border-b border-t border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <h3 className="text-xl font-bold text-[var(--text-text-default)] mb-2 uppercase">Enterprise</h3>
                <div className="mb-8">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-[var(--text-text-default)] font-mono">
                      ${billingPeriod === 'monthly' ? '49.99' : '39.99'}
                    </span>
                    <span className="text-[var(--text-text-secondary)] font-mono text-sm ml-1">/MO</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">Unlimited chatbots</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">White-label</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-4 w-4 text-[var(--bg-bg-brand)] mr-3 mt-1" />
                    <span className="text-[var(--text-text-secondary)] text-sm">Custom integrations</span>
                  </li>
                </ul>
                <button
                  onClick={() => handlePlanClick('enterprise')}
                  disabled={purchasingPlan !== null}
                  className="w-full py-3 text-center border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] hover:bg-[var(--text-text-default)] hover:text-black transition-all disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm uppercase tracking-wider"
                >
                  {purchasingPlan === 'enterprise' ? (
                    <Loader className="h-4 w-4 animate-spin mx-auto" />
                  ) : (
                    isAuthenticated ? "UPGRADE SYSTEM" : "INITIALIZE"
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>

        <section id="integration-section" className="py-24 bg-[var(--bg-bg-base-secondary)] border-b border-[var(--border-border-neutral-l1)]">
          <div className="w-full px-4 sm:px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-0 border border-[var(--border-border-neutral-l1)]">
              <div className="p-12 border-r border-[var(--border-border-neutral-l1)]">
                <h2 className="text-4xl font-bold text-[var(--text-text-default)] mb-4 uppercase tracking-tight">
                  Integration
                </h2>
                <p className="text-lg text-[var(--text-text-secondary)] font-mono mb-12">
                  // DEPLOYMENT OPTIONS
                </p>

                <div className="flex flex-wrap gap-4 mb-12">
                  {integrationOptions.map((option) => (
                    <button
                      key={option.key}
                      onClick={() => setActiveIntegrationKey(option.key)}
                      className={`px - 6 py - 3 text - sm font - mono uppercase tracking - wider border transition - all ${activeIntegrationKey === option.key
                        ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] border-[var(--bg-bg-brand)]'
                        : 'bg-transparent text-[var(--text-text-secondary)] border-[var(--border-border-neutral-l1)] hover:border-[var(--text-text-default)]'
                        } `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>

                <div className="p-8 border border-[var(--border-border-neutral-l1)] bg-black/50">
                  <div className="inline-block px-3 py-1 bg-[var(--bg-bg-brand)]/10 border border-[var(--bg-bg-brand)]/20 mb-4">
                    <span className="text-xs font-mono text-[var(--bg-bg-brand)] uppercase tracking-widest">
                      {activeIntegration.label}
                    </span>
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--text-text-default)] mb-4 uppercase">
                    {activeIntegration.title}
                  </h3>
                  <p className="text-[var(--text-text-secondary)] leading-relaxed mb-6 font-light">
                    {activeIntegration.description}
                  </p>
                  <ul className="space-y-4">
                    {activeIntegration.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start space-x-3">
                        <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] mt-2" />
                        <span className="text-[var(--text-text-secondary)] font-mono text-sm">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="p-0 bg-[#0d0e10] flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-[var(--border-border-neutral-l1)] bg-black">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-500/20 border border-red-500/50"></div>
                    <div className="w-3 h-3 bg-yellow-500/20 border border-yellow-500/50"></div>
                    <div className="w-3 h-3 bg-green-500/20 border border-green-500/50"></div>
                  </div>
                  <button
                    onClick={() => copyIntegrationCode(activeIntegration.code, activeIntegration.key)}
                    className="flex items-center space-x-2 px-3 py-1.5 border border-[var(--border-border-neutral-l1)] hover:bg-[var(--bg-bg-overlay-l1)] transition-all text-xs font-mono uppercase tracking-wider"
                  >
                    {copiedIntegration === activeIntegration.key ? (
                      <>
                        <Check className="h-3 w-3 text-green-500" />
                        <span className="text-green-500">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3 w-3 text-[var(--text-text-secondary)]" />
                        <span className="text-[var(--text-text-secondary)]">Copy Code</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex-1 p-8 overflow-auto">
                  <pre className="font-mono text-sm leading-relaxed">
                    <code className="text-[var(--text-text-default)] block whitespace-pre-wrap break-words">
                      {activeIntegration.code}
                    </code>
                  </pre>
                </div>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link
                href="/docs"
                className="inline-block px-8 py-4 bg-transparent border border-[var(--bg-bg-brand)] text-[var(--bg-bg-brand)] hover:bg-[var(--bg-bg-brand)] hover:text-[var(--text-text-onbrand)] transition-all font-bold text-lg font-mono uppercase tracking-wider"
              >
                View Documentation
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
                      className={`h - 5 w - 5 text - [var(--text - text - secondary)]transition - transform ${openFaq === index ? 'rotate-180' : ''
                        } `}
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

      <footer className="relative border-t border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-secondary)] overflow-hidden">
        {/* Large NEXVA Text Background */}
        <div className="absolute bottom-0 left-0 w-full pointer-events-none z-0 overflow-hidden flex justify-center items-end">
          <h1
            className="text-[clamp(6rem,25vw,25rem)] leading-[0.75] uppercase select-none opacity-[0.03]"
            style={{
              fontFamily: 'var(--font-family-default)',
              fontWeight: 900,
              color: 'var(--text-text-default)',
              letterSpacing: '-0.05em',
            }}
          >
            NEXVA
          </h1>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-24 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 mb-24">
            {/* Brand Column */}
            <div className="md:col-span-4 space-y-8">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-[var(--bg-bg-brand)] flex items-center justify-center">
                  <span className="font-mono font-bold text-black text-lg">N</span>
                </div>
                <span className="text-2xl font-bold tracking-tighter uppercase text-[var(--text-text-default)]">Nexva</span>
              </div>
              <p className="text-[var(--text-text-secondary)] leading-relaxed max-w-xs font-light">
                Next-generation AI chatbot platform. Deploy intelligent, context-aware agents in minutes.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 border border-[var(--border-border-neutral-l1)] flex items-center justify-center text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-brand)] hover:text-black hover:border-[var(--bg-bg-brand)] transition-all">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" /></svg>
                </a>
                <a href="#" className="w-10 h-10 border border-[var(--border-border-neutral-l1)] flex items-center justify-center text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-brand)] hover:text-black hover:border-[var(--bg-bg-brand)] transition-all">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
              </div>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">
              <div>
                <h3 className="font-mono text-[var(--bg-bg-brand)] text-xs uppercase tracking-widest mb-6">Product</h3>
                <ul className="space-y-4">
                  <li><Link href="#features" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Features</Link></li>
                  <li><Link href="#pricing" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Pricing</Link></li>
                  <li><Link href="/docs" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Documentation</Link></li>
                  <li><Link href="/changelog" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Changelog</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-[var(--bg-bg-brand)] text-xs uppercase tracking-widest mb-6">Company</h3>
                <ul className="space-y-4">
                  <li><Link href="/about" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">About</Link></li>
                  <li><Link href="/blog" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Blog</Link></li>
                  <li><Link href="/careers" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Careers</Link></li>
                  <li><Link href="/contact" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Contact</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="font-mono text-[var(--bg-bg-brand)] text-xs uppercase tracking-widest mb-6">Legal</h3>
                <ul className="space-y-4">
                  <li><Link href="/privacy" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Privacy</Link></li>
                  <li><Link href="/terms" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Terms</Link></li>
                  <li><Link href="/security" className="text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors uppercase tracking-wide font-medium">Security</Link></li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-[var(--border-border-neutral-l1)] flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-wider">
              © 2025 Nexva Inc. All systems operational.
            </p>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-mono text-[var(--text-text-tertiary)] uppercase tracking-wider">System Status: Online</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
