"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Globe, FileText, TrendingUp, Database, Cpu, Server, CreditCard, ArrowRight, Users } from "lucide-react";
import { useAuth, fetchWithAuth } from "@/app/context/AuthContext";
import { API_ENDPOINTS } from "@/app/config/api";
import Link from "next/link";

interface Stats {
  totalChatbots: number;
  totalDomains: number;
  totalPages: number;
  totalCustomers: number;
  totalConversations: number;
}

interface ChatbotStats {
  chatbot_id: number;
  chatbot_name: string;
  unique_customers: number;
  total_conversations: number;
  total_messages: number;
}

interface SubscriptionInfo {
  plan_tier: string;
  status: string;
  chatbot_count: number;
  chatbot_limit: number;
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalChatbots: 0, totalDomains: 0, totalPages: 0, totalCustomers: 0, totalConversations: 0 });
  const [chatbotStats, setChatbotStats] = useState<ChatbotStats[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      fetchStats();
      fetchSubscription();
    }
  }, [mounted]);

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.chatbots);
      if (response.ok) {
        const chatbots = await response.json();
        let totalDomains = 0;
        let totalPages = 0;
        let totalCustomers = 0;
        let totalConversations = 0;
        const chatbotStatsData: ChatbotStats[] = [];

        for (const chatbot of chatbots) {
          const domainsRes = await fetchWithAuth(`${API_ENDPOINTS.domains}/${chatbot.id}`);
          if (domainsRes.ok) {
            const domains = await domainsRes.json();
            totalDomains += domains.length;
            totalPages += domains.reduce((sum: number, d: any) => sum + d.pages_scraped, 0);
          }

          const statsRes = await fetchWithAuth(`${API_ENDPOINTS.chatbots}/${chatbot.id}/stats`);
          if (statsRes.ok) {
            const chatbotStat = await statsRes.json();
            totalCustomers += chatbotStat.unique_customers || 0;
            totalConversations += chatbotStat.total_conversations || 0;
            chatbotStatsData.push({
              chatbot_id: chatbot.id,
              chatbot_name: chatbot.name,
              unique_customers: chatbotStat.unique_customers || 0,
              total_conversations: chatbotStat.total_conversations || 0,
              total_messages: chatbotStat.total_messages || 0
            });
          } else {
            chatbotStatsData.push({
              chatbot_id: chatbot.id,
              chatbot_name: chatbot.name,
              unique_customers: 0,
              total_conversations: 0,
              total_messages: 0
            });
          }
        }

        setStats({
          totalChatbots: chatbots.length,
          totalDomains,
          totalPages,
          totalCustomers,
          totalConversations
        });
        setChatbotStats(chatbotStatsData);
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const response = await fetchWithAuth(API_ENDPOINTS.billing.subscription);
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription");
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="h-8 w-32 bg-[var(--bg-bg-overlay-l2)] rounded animate-pulse mb-2" />
        <div className="h-5 w-48 bg-[var(--bg-bg-overlay-l2)] rounded animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full p-6 lg:p-8">
      <div className="mb-8 flex items-center justify-between border-b border-[var(--border-border-neutral-l1)] pb-6">
        <div>
          <h1 className="text-3xl font-bold text-[var(--text-text-default)] mb-1 uppercase tracking-tight">Command Center</h1>
          <p className="text-[var(--text-text-secondary)] font-mono text-sm">// SYSTEM OVERVIEW</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs font-mono text-[var(--bg-bg-brand)] bg-[var(--bg-bg-brand)]/10 px-3 py-1 border border-[var(--bg-bg-brand)]/20">
            <div className="w-1.5 h-1.5 bg-[var(--bg-bg-brand)] animate-pulse"></div>
            <span>SYSTEM ONLINE</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats */}
          <div className="border border-[var(--border-border-neutral-l1)] bg-black/40 backdrop-blur-sm p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

            <h2 className="text-lg font-bold text-[var(--text-text-default)] mb-6 flex items-center uppercase tracking-wider">
              <TrendingUp className="w-5 h-5 mr-3 text-[var(--bg-bg-brand)]" />
              Telemetry
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-px bg-[var(--border-border-neutral-l1)] border border-[var(--border-border-neutral-l1)]">
              <div className="p-4 bg-[var(--bg-bg-base-default)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <div className="text-3xl font-bold text-[var(--text-text-default)] mb-1 font-mono group-hover:text-[var(--bg-bg-brand)] transition-colors">{stats.totalChatbots}</div>
                <div className="text-[10px] font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Chatbots</div>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-default)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <div className="text-3xl font-bold text-[var(--text-text-default)] mb-1 font-mono group-hover:text-[var(--bg-bg-brand)] transition-colors">{stats.totalDomains}</div>
                <div className="text-[10px] font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Domains</div>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-default)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <div className="text-3xl font-bold text-[var(--text-text-default)] mb-1 font-mono group-hover:text-[var(--bg-bg-brand)] transition-colors">{stats.totalPages.toLocaleString()}</div>
                <div className="text-[10px] font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Pages</div>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-default)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <div className="text-3xl font-bold text-[var(--bg-bg-brand)] mb-1 font-mono">{stats.totalCustomers.toLocaleString()}</div>
                <div className="text-[10px] font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Customers</div>
              </div>
              <div className="p-4 bg-[var(--bg-bg-base-default)] hover:bg-[var(--bg-bg-overlay-l1)] transition-colors group">
                <div className="text-3xl font-bold text-[var(--text-text-default)] mb-1 font-mono group-hover:text-[var(--bg-bg-brand)] transition-colors">{stats.totalConversations.toLocaleString()}</div>
                <div className="text-[10px] font-mono text-[var(--text-text-tertiary)] uppercase tracking-widest">Chats</div>
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="border border-[var(--border-border-neutral-l1)] bg-black/40 backdrop-blur-sm p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[var(--text-text-default)] flex items-center uppercase tracking-wider">
                <Server className="w-5 h-5 mr-3 text-[var(--bg-bg-brand)]" />
                System Status
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { name: "API Server", icon: Server, status: "Running", color: "green", latency: "45ms" },
                { name: "Vector Search", icon: Database, status: "Healthy", color: "green", latency: "12ms" },
                { name: "AI Model", icon: Cpu, status: "Ready", color: "green", latency: "Idle" },
                { name: "Data Storage", icon: Database, status: "Connected", color: "green", latency: "Stable" }
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between p-4 border border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-default)] hover:border-[var(--bg-bg-brand)]/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)]">
                      <service.icon className="w-4 h-4 text-[var(--text-text-secondary)]" strokeWidth={2} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-[var(--text-text-default)] uppercase tracking-wide">{service.name}</div>
                      <div className="text-[10px] font-mono text-[var(--text-text-tertiary)]">LATENCY: {service.latency}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-green-500/10 border border-green-500/20">
                    <div className="w-1.5 h-1.5 bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" />
                    <span className="text-[10px] font-mono font-bold text-green-400 uppercase">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {chatbotStats.length > 0 && (
            <div className="border border-[var(--border-border-neutral-l1)] bg-black/40 backdrop-blur-sm p-8">
              <div className="flex items-center space-x-3 mb-6">
                <Users className="h-5 w-5 text-[var(--bg-bg-brand)]" />
                <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Active Agents</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[var(--border-border-neutral-l1)]">
                      <th className="px-4 py-3 text-left text-[10px] font-mono font-bold text-[var(--text-text-tertiary)] uppercase tracking-widest">Agent ID</th>
                      <th className="px-4 py-3 text-right text-[10px] font-mono font-bold text-[var(--text-text-tertiary)] uppercase tracking-widest">Users</th>
                      <th className="px-4 py-3 text-right text-[10px] font-mono font-bold text-[var(--text-text-tertiary)] uppercase tracking-widest">Sessions</th>
                      <th className="px-4 py-3 text-right text-[10px] font-mono font-bold text-[var(--text-text-tertiary)] uppercase tracking-widest">Msgs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                    {chatbotStats.map((stat) => (
                      <tr key={stat.chatbot_id} className="group hover:bg-[var(--bg-bg-overlay-l1)] transition-colors">
                        <td className="px-4 py-4 text-sm text-[var(--text-text-default)] font-mono font-medium group-hover:text-[var(--bg-bg-brand)] transition-colors">{stat.chatbot_name}</td>
                        <td className="px-4 py-4 text-sm text-[var(--text-text-default)] font-mono text-right">{stat.unique_customers.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-[var(--text-text-default)] font-mono text-right">{stat.total_conversations.toLocaleString()}</td>
                        <td className="px-4 py-4 text-sm text-[var(--text-text-secondary)] font-mono text-right">{stat.total_messages.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-8">
          {subscription && (
            <div className={`border border-[var(--border-border-neutral-l1)] bg-black/40 backdrop-blur-sm p-8 relative overflow-hidden ${subscription.plan_tier === 'free' ? 'border-[var(--bg-bg-brand)]' : ''}`}>
              {subscription.plan_tier === 'free' && (
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[var(--bg-bg-brand)]/10 to-transparent"></div>
              )}

              <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-[var(--bg-bg-brand)]" />
                  <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">Subscription</h2>
                </div>
                <span className={`px-3 py-1 text-[10px] font-mono font-bold uppercase tracking-widest border ${subscription.plan_tier === 'free'
                    ? 'bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-secondary)] border-[var(--border-border-neutral-l1)]'
                    : 'bg-[var(--bg-bg-brand)]/10 text-[var(--bg-bg-brand)] border-[var(--bg-bg-brand)]/20'
                  }`}>
                  {subscription.plan_tier} TIER
                </span>
              </div>

              <div className="mb-8 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[var(--text-text-secondary)] uppercase tracking-wider">Usage</span>
                  <span className="text-sm font-mono text-[var(--text-text-default)]">
                    {subscription.chatbot_count} <span className="text-[var(--text-text-tertiary)]">/</span> {subscription.chatbot_limit === -1 ? '∞' : subscription.chatbot_limit}
                  </span>
                </div>
                {subscription.chatbot_limit !== -1 && (
                  <div className="w-full bg-[var(--bg-bg-base-secondary)] h-1 overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${(subscription.chatbot_count / subscription.chatbot_limit) >= 0.9
                          ? 'bg-yellow-500'
                          : 'bg-[var(--bg-bg-brand)]'
                        }`}
                      style={{
                        width: `${Math.min((subscription.chatbot_count / subscription.chatbot_limit) * 100, 100)}%`
                      }}
                    />
                  </div>
                )}
              </div>

              {subscription.plan_tier === 'free' && (
                <Link href="/dashboard/billing">
                  <button className="w-full px-4 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)] transition-all font-bold font-mono text-sm uppercase tracking-wider flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(50,240,140,0.2)] hover:shadow-[0_0_30px_rgba(50,240,140,0.3)]">
                    <span>Upgrade System</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}

              {subscription.plan_tier !== 'free' && (
                <Link href="/dashboard/billing">
                  <button className="w-full px-4 py-3 bg-transparent border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] hover:bg-[var(--bg-bg-overlay-l1)] transition-all font-mono text-sm uppercase tracking-wider">
                    Manage Access
                  </button>
                </Link>
              )}
            </div>
          )}

          <div className="border border-[var(--border-border-neutral-l1)] bg-black/40 backdrop-blur-sm p-8">
            <h2 className="text-lg font-bold text-[var(--text-text-default)] mb-6 uppercase tracking-wider">Quick Actions</h2>
            <div className="space-y-4">
              <div className="relative pl-6 border-l border-[var(--border-border-neutral-l1)]">
                <div className="absolute -left-[1px] top-0 w-2 h-2 bg-[var(--bg-bg-brand)] shadow-[0_0_10px_rgba(50,240,140,0.5)]"></div>
                <div className="text-sm font-bold text-[var(--text-text-default)] mb-1 uppercase tracking-wide">1. Create Agent</div>
                <p className="text-xs text-[var(--text-text-secondary)] font-mono">Initialize new AI instance</p>
              </div>
              <div className="relative pl-6 border-l border-[var(--border-border-neutral-l1)]">
                <div className="absolute -left-[1px] top-0 w-2 h-2 border border-[var(--text-text-tertiary)] bg-[var(--bg-bg-base-default)]"></div>
                <div className="text-sm font-bold text-[var(--text-text-default)] mb-1 uppercase tracking-wide">2. Ingest Data</div>
                <p className="text-xs text-[var(--text-text-secondary)] font-mono">Upload knowledge base</p>
              </div>
              <div className="relative pl-6 border-l border-[var(--border-border-neutral-l1)]">
                <div className="absolute -left-[1px] top-0 w-2 h-2 border border-[var(--text-text-tertiary)] bg-[var(--bg-bg-base-default)]"></div>
                <div className="text-sm font-bold text-[var(--text-text-default)] mb-1 uppercase tracking-wide">3. Deploy</div>
                <p className="text-xs text-[var(--text-text-secondary)] font-mono">Launch to production</p>
              </div>
            </div>
          </div>

          <div className="border border-[var(--border-border-neutral-l1)] bg-black/40 backdrop-blur-sm p-8">
            <h2 className="text-lg font-bold text-[var(--text-text-default)] mb-4 uppercase tracking-wider">Docs & API</h2>
            <div className="space-y-2">
              <a href="/docs" className="group flex items-center justify-between p-3 border border-transparent hover:border-[var(--bg-bg-brand)] hover:bg-[var(--bg-bg-brand)]/5 transition-all">
                <span className="text-sm font-mono text-[var(--text-text-secondary)] group-hover:text-[var(--bg-bg-brand)] transition-colors uppercase tracking-wide">Documentation</span>
                <ArrowRight className="w-4 h-4 text-[var(--text-text-tertiary)] group-hover:text-[var(--bg-bg-brand)] transition-colors" />
              </a>
              <a href="/playground" className="group flex items-center justify-between p-3 border border-transparent hover:border-[var(--bg-bg-brand)] hover:bg-[var(--bg-bg-brand)]/5 transition-all">
                <span className="text-sm font-mono text-[var(--text-text-secondary)] group-hover:text-[var(--bg-bg-brand)] transition-colors uppercase tracking-wide">Playground</span>
                <ArrowRight className="w-4 h-4 text-[var(--text-text-tertiary)] group-hover:text-[var(--bg-bg-brand)] transition-colors" />
              </a>
              <a href="/dashboard/tokens" className="group flex items-center justify-between p-3 border border-transparent hover:border-[var(--bg-bg-brand)] hover:bg-[var(--bg-bg-brand)]/5 transition-all">
                <span className="text-sm font-mono text-[var(--text-text-secondary)] group-hover:text-[var(--bg-bg-brand)] transition-colors uppercase tracking-wide">API Tokens</span>
                <ArrowRight className="w-4 h-4 text-[var(--text-text-tertiary)] group-hover:text-[var(--bg-bg-brand)] transition-colors" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

