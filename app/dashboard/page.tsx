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
            totalCustomers += chatbotStat.unique_customers;
            totalConversations += chatbotStat.total_conversations;
            chatbotStatsData.push({
              chatbot_id: chatbot.id,
              chatbot_name: chatbot.name,
              ...chatbotStat
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
    <div className="max-w-7xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-[var(--text-text-default)]">Overview</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-lg p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-medium text-[var(--text-text-default)]">System Status</h2>
              <span className="text-xs text-[var(--text-text-secondary)]">All systems operational</span>
            </div>
            <div className="space-y-3">
              {[
                { name: "API Server", icon: Server, status: "Running", color: "green" },
                { name: "Vector Search", icon: Database, status: "Healthy", color: "green" },
                { name: "AI Model", icon: Cpu, status: "Ready", color: "green" },
                { name: "Data Storage", icon: Database, status: "Connected", color: "green" }
              ].map((service) => (
                <div key={service.name} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-3">
                    <service.icon className="w-4 h-4 text-[var(--text-text-secondary)]" strokeWidth={2} />
                    <span className="text-sm text-[var(--text-text-default)]">{service.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                    <span className="text-xs text-[var(--text-text-secondary)]">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-lg p-6">
            <h2 className="text-base font-medium text-[var(--text-text-default)] mb-5">Quick Stats</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6">
              <div>
                <div className="text-2xl font-semibold text-[var(--text-text-default)] mb-1">{stats.totalChatbots}</div>
                <div className="text-xs text-[var(--text-text-secondary)]">Chatbots</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-[var(--text-text-default)] mb-1">{stats.totalDomains}</div>
                <div className="text-xs text-[var(--text-text-secondary)]">Domains</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-[var(--text-text-default)] mb-1">{stats.totalPages.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-text-secondary)]">Pages</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-[var(--bg-bg-brand)] mb-1">{stats.totalCustomers.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-text-secondary)]">Unique Customers</div>
              </div>
              <div>
                <div className="text-2xl font-semibold text-[var(--text-text-default)] mb-1">{stats.totalConversations.toLocaleString()}</div>
                <div className="text-xs text-[var(--text-text-secondary)]">Conversations</div>
              </div>
            </div>
          </div>

          {chatbotStats.length > 0 && (
            <div className="bg-[var(--bg-bg-overlay-l1)] rounded-lg p-6">
              <div className="flex items-center space-x-2 mb-5">
                <Users className="h-5 w-5 text-[var(--bg-bg-brand)]" />
                <h2 className="text-base font-medium text-[var(--text-text-default)]">Chatbot Statistics</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-bg-base-secondary)]">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase">Chatbot</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-text-secondary)] uppercase">Customers</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-text-secondary)] uppercase">Conversations</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-[var(--text-text-secondary)] uppercase">Messages</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                    {chatbotStats.map((stat) => (
                      <tr key={stat.chatbot_id} className="hover:bg-[var(--bg-bg-base-secondary)] transition-colors">
                        <td className="px-4 py-3 text-sm text-[var(--text-text-default)] font-medium">{stat.chatbot_name}</td>
                        <td className="px-4 py-3 text-sm text-[var(--bg-bg-brand)] font-semibold text-right">{stat.unique_customers.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-[var(--text-text-default)] text-right">{stat.total_conversations.toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-[var(--text-text-secondary)] text-right">{stat.total_messages.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {subscription && (
            <div className={`bg-[var(--bg-bg-overlay-l1)] rounded-lg p-6 border ${subscription.plan_tier === 'free' ? 'border-[var(--bg-bg-brand)]' : 'border-[var(--border-border-neutral-l1)]'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-[var(--text-text-secondary)]" />
                  <h2 className="text-base font-medium text-[var(--text-text-default)]">Subscription</h2>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                  subscription.plan_tier === 'free' 
                    ? 'bg-gray-500/10 text-gray-500'
                    : 'bg-[var(--bg-bg-brand)]/10 text-[var(--bg-bg-brand)]'
                }`}>
                  {subscription.plan_tier}
                </span>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-[var(--text-text-secondary)]">Chatbots Used</span>
                  <span className="text-sm font-semibold text-[var(--text-text-default)]">
                    {subscription.chatbot_count}/{subscription.chatbot_limit === -1 ? '∞' : subscription.chatbot_limit}
                  </span>
                </div>
                {subscription.chatbot_limit !== -1 && (
                  <div className="w-full bg-[var(--bg-bg-base-secondary)] rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        (subscription.chatbot_count / subscription.chatbot_limit) >= 0.9 
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
                  <button className="w-full px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium flex items-center justify-center space-x-2">
                    <span>Upgrade Plan</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
              )}
              
              {subscription.plan_tier !== 'free' && (
                <Link href="/dashboard/billing">
                  <button className="w-full px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all text-sm">
                    Manage Subscription
                  </button>
                </Link>
              )}
            </div>
          )}
          
          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-lg p-6">
            <h2 className="text-base font-medium text-[var(--text-text-default)] mb-4">Getting Started</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-[var(--text-text-default)] mb-1">1. Create a chatbot</div>
                <p className="text-xs text-[var(--text-text-secondary)]">Start by creating your first AI chatbot</p>
              </div>
              <div>
                <div className="text-sm text-[var(--text-text-default)] mb-1">2. Add domains</div>
                <p className="text-xs text-[var(--text-text-secondary)]">Import content from your website</p>
              </div>
              <div>
                <div className="text-sm text-[var(--text-text-default)] mb-1">3. Train & Deploy</div>
                <p className="text-xs text-[var(--text-text-secondary)]">Let AI learn and start answering</p>
              </div>
            </div>
          </div>

          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-lg p-6">
            <h2 className="text-base font-medium text-[var(--text-text-default)] mb-4">Resources</h2>
            <div className="space-y-3">
              <a href="/docs" className="block text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Documentation →
              </a>
              <a href="/playground" className="block text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                Playground →
              </a>
              <a href="/dashboard/tokens" className="block text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
                API Tokens →
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

