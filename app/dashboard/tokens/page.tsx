"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Copy, Check, Trash2, Loader, Key } from "lucide-react";

interface Chatbot {
  id: number;
  name: string;
  api_key: string;
  created_at: string;
}

export default function TokensPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [newChatbotName, setNewChatbotName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchChatbots();
  }, []);

  const fetchChatbots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/chatbots", {
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

  const createChatbot = async () => {
    if (!newChatbotName.trim()) return;
    setCreating(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/chatbots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: newChatbotName }),
      });
      if (response.ok) {
        setNewChatbotName("");
        fetchChatbots();
      }
    } catch (error) {
      console.error("Failed to create chatbot", error);
    } finally {
      setCreating(false);
    }
  };

  const copyApiKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

