"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, Check, Trash2, Loader, Key, AlertCircle } from "lucide-react";
import { API_ENDPOINTS } from "@/app/config/api";
import UpgradeModal from "@/app/components/UpgradeModal";
import DeleteChatbotModal from "@/app/components/DeleteChatbotModal";

interface Chatbot {
  id: number;
  name: string;
  api_key: string;
  created_at: string;
}

interface SubscriptionInfo {
  plan_tier: string;
  status: string;
  chatbot_count: number;
  chatbot_limit: number;
}

export default function TokensPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newChatbotName, setNewChatbotName] = useState("");
  const [creating, setCreating] = useState(false);
  const [showUpgrade, setShowUpgrade] = useState(false);
  const [error, setError] = useState("");
  const [chatbotToDelete, setChatbotToDelete] = useState<Chatbot | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([fetchChatbots(), fetchSubscription()]);
  };

  const fetchChatbots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.chatbots, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setChatbots(data);
      }
    } catch (error) {
      console.error("Failed to fetch chatbots", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubscription = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.billing.subscription, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setSubscription(data);
      }
    } catch (error) {
      console.error("Failed to fetch subscription");
    }
  };

  const createChatbot = async () => {
    if (!newChatbotName.trim()) return;
    
    if (subscription) {
      const canCreate = subscription.chatbot_limit === -1 || subscription.chatbot_count < subscription.chatbot_limit;
      if (!canCreate) {
        setShowUpgrade(true);
        return;
      }
    }
    
    setCreating(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(API_ENDPOINTS.chatbots, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newChatbotName }),
      });
      
      if (response.status === 403) {
        setShowUpgrade(true);
      } else if (response.ok) {
        setNewChatbotName("");
        await fetchData();
      } else {
        const data = await response.json();
        setError(data.detail || "Failed to create chatbot");
      }
    } catch (error) {
      console.error("Failed to create chatbot", error);
      setError("Failed to create chatbot");
    } finally {
      setCreating(false);
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const deleteChatbot = async () => {
    if (!chatbotToDelete) return;
    
    setDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_ENDPOINTS.chatbots}/${chatbotToDelete.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (response.ok) {
        setChatbotToDelete(null);
        await fetchData();
      }
    } catch (error) {
      console.error("Failed to delete chatbot", error);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--text-text-default)] mb-2">API Tokens</h1>
          <p className="text-[var(--text-text-secondary)]">Loading tokens...</p>
        </div>
        <div className="animate-pulse">
          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 h-40"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--text-text-default)] mb-2">API Tokens</h1>
        <p className="text-[var(--text-text-secondary)]">Create and manage your chatbot API keys</p>
      </div>

      {subscription && (
        <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-[var(--text-text-secondary)]">Chatbot Usage</p>
              <p className="text-lg font-semibold text-[var(--text-text-default)]">
                {subscription.chatbot_count}/{subscription.chatbot_limit === -1 ? '∞' : subscription.chatbot_limit} chatbots
              </p>
            </div>
            {subscription.chatbot_limit !== -1 && (
              <div className="w-1/2">
                <div className="w-full bg-[var(--bg-bg-base-secondary)] rounded-full h-2">
                  <div
                    className="bg-[var(--bg-bg-brand)] h-2 rounded-full transition-all"
                    style={{
                      width: `${Math.min((subscription.chatbot_count / subscription.chatbot_limit) * 100, 100)}%`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center space-x-2">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}

      <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 mb-6">
        <h2 className="text-lg font-semibold text-[var(--text-text-default)] mb-4">Create New Token</h2>
        <div className="flex space-x-3">
          <input
            type="text"
            value={newChatbotName}
            onChange={(e) => setNewChatbotName(e.target.value)}
            placeholder="Enter chatbot name"
            className="flex-1 px-4 py-2 bg-[var(--bg-bg-base-secondary)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)]"
          />
          <button
            onClick={createChatbot}
            disabled={creating || !newChatbotName.trim()}
            className="px-6 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 flex items-center space-x-2"
          >
            {creating ? <Loader className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            <span>Create</span>
          </button>
        </div>
      </div>

      <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6">
        <h2 className="text-lg font-semibold text-[var(--text-text-default)] mb-4">Your Tokens</h2>
        {chatbots.length === 0 ? (
          <div className="text-center py-12">
            <Key className="h-12 w-12 text-[var(--text-text-tertiary)] mx-auto mb-4" />
            <p className="text-[var(--text-text-secondary)]">No tokens created yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {chatbots.map((chatbot) => (
              <div key={chatbot.id} className="p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg border border-[var(--border-border-neutral-l1)]">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[var(--text-text-default)] font-semibold">{chatbot.name}</h3>
                  <span className="text-xs text-[var(--text-text-tertiary)]">
                    {new Date(chatbot.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <code className="flex-1 px-3 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded text-sm font-mono text-[var(--text-text-default)] overflow-x-auto">
                    {chatbot.api_key}
                  </code>
                  <button
                    onClick={() => copyApiKey(chatbot.api_key)}
                    className="p-2 bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded transition-all"
                  >
                    {copiedKey === chatbot.api_key ? (
                      <Check className="h-4 w-4 text-[var(--bg-bg-brand)]" />
                    ) : (
                      <Copy className="h-4 w-4 text-[var(--text-text-secondary)]" />
                    )}
                  </button>
                  <button
                    onClick={() => setChatbotToDelete(chatbot)}
                    className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded transition-all"
                    title="Delete chatbot"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {subscription && (
        <UpgradeModal
          isOpen={showUpgrade}
          onClose={() => setShowUpgrade(false)}
          currentPlan={subscription.plan_tier}
          chatbotLimit={subscription.chatbot_limit}
          currentCount={subscription.chatbot_count}
        />
      )}

      <DeleteChatbotModal
        isOpen={!!chatbotToDelete}
        onClose={() => setChatbotToDelete(null)}
        onConfirm={deleteChatbot}
        chatbotName={chatbotToDelete?.name || ""}
        isDeleting={deleting}
      />
    </div>
  );
}

