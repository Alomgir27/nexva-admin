"use client";

import { useState, useEffect } from "react";
import { MessageSquare, Globe, FileText, TrendingUp, Database, Cpu, Server } from "lucide-react";
import { useAuth, fetchWithAuth } from "../context/AuthContext";

interface Stats {
  totalChatbots: number;
  totalDomains: number;
  totalPages: number;
}

export default function Dashboard() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<Stats>({ totalChatbots: 0, totalDomains: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      fetchStats();
    }
  }, [isAuthenticated]);

  const fetchStats = async () => {
    try {
      const response = await fetchWithAuth("http://localhost:8000/api/chatbots");
      if (response.ok) {
        const chatbots = await response.json();
        let totalDomains = 0;
        let totalPages = 0;

        for (const chatbot of chatbots) {
          const domainsRes = await fetchWithAuth(`http://localhost:8000/api/domains/${chatbot.id}`);
          if (domainsRes.ok) {
            const domains = await domainsRes.json();
            totalDomains += domains.length;
            totalPages += domains.reduce((sum: number, d: any) => sum + d.pages_scraped, 0);
          }
        }

        setStats({
          totalChatbots: chatbots.length,
          totalDomains,
          totalPages,
        });
      }
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setLoading(false);
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
                { name: "FastAPI", icon: Server, status: "Running", color: "green" },
                { name: "Search Engine", icon: Database, status: "Healthy", color: "green" },
                { name: "AI Engine", icon: Cpu, status: "Ready", color: "green" },
                { name: "Database", icon: Database, status: "Connected", color: "green" }
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
            <div className="grid grid-cols-3 gap-6">
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
            </div>
          </div>
        </div>

        <div className="space-y-6">
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
              <a href="/dashboard/docs" className="block text-sm text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)] transition-colors">
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

