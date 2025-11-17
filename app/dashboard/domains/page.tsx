"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Globe, Loader, ExternalLink, Trash2, Users } from "lucide-react";
import AddDomainModal from "../../components/AddDomainModal";
import DeleteDomainModal from "../../components/DeleteDomainModal";
import InviteSupportModal from "../../components/InviteSupportModal";
import Link from "next/link";
import { API_BASE_URL } from "../../config/api";

interface Chatbot {
  id: number;
  name: string;
  api_key: string;
}

interface Domain {
  id: number;
  chatbot_id: number;
  url: string;
  status: string;
  pages_scraped: number;
  last_scraped_at: string | null;
}

interface SupportMember {
  id: number;
  email: string;
  name: string;
  role: string;
  status: string;
  created_at: string;
}

export default function DomainsPage() {
  const router = useRouter();
  const [chatbots, setChatbots] = useState<Chatbot[]>([]);
  const [domains, setDomains] = useState<Domain[]>([]);
  const [selectedChatbot, setSelectedChatbot] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddDomain, setShowAddDomain] = useState(false);
  const [deletingDomain, setDeletingDomain] = useState<number | null>(null);
  const [domainToDelete, setDomainToDelete] = useState<{ id: number; url: string } | null>(null);
  const [showInviteSupport, setShowInviteSupport] = useState(false);
  const [supportMembers, setSupportMembers] = useState<SupportMember[]>([]);
  const [showSupportTeam, setShowSupportTeam] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchChatbots();
  }, []);

  useEffect(() => {
    if (selectedChatbot) {
      fetchDomains(selectedChatbot);
      fetchSupportTeam(selectedChatbot);
      
      const interval = setInterval(() => {
        fetchDomainsForPolling(selectedChatbot);
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [selectedChatbot]);

  const fetchDomainsForPolling = async (chatbotId: number) => {
    const hasScrapingInProgress = domains.some(d => d.status === 'scraping');
    if (!hasScrapingInProgress) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/domains/${chatbotId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error("Failed to fetch domains");
    }
  };

  const fetchChatbots = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/chatbots`, {
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
        if (data.length > 0) {
          setSelectedChatbot(data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch chatbots", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDomains = async (chatbotId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/domains/${chatbotId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setDomains(data);
      }
    } catch (error) {
      console.error("Failed to fetch domains");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "text-green-500 bg-green-500/10";
      case "scraping": return "text-yellow-500 bg-yellow-500/10";
      case "failed": return "text-red-500 bg-red-500/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const deleteDomain = async (domainId: number) => {
    setDeletingDomain(domainId);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${API_BASE_URL}/api/domains/${domainId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        setDomainToDelete(null);
        if (selectedChatbot) {
          fetchDomains(selectedChatbot);
        }
      } else {
        alert("Failed to delete domain");
      }
    } catch (error) {
      console.error("Failed to delete domain", error);
      alert("Failed to delete domain");
    } finally {
      setDeletingDomain(null);
    }
  };

  const fetchSupportTeam = async (chatbotId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/chatbots/${chatbotId}/support-team`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setSupportMembers(data);
      }
    } catch (error) {
      console.error("Failed to fetch support team", error);
    }
  };

  const removeSupportMember = async (memberId: number) => {
    if (!confirm("Are you sure you want to remove this support member?")) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/support-team/${memberId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok && selectedChatbot) {
        fetchSupportTeam(selectedChatbot);
      } else {
        alert("Failed to remove member");
      }
    } catch (error) {
      console.error("Failed to remove member", error);
      alert("Failed to remove member");
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-[var(--text-text-default)] mb-2">Domains</h1>
          <p className="text-[var(--text-text-secondary)]">Loading domains...</p>
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
        <h1 className="text-3xl font-semibold text-[var(--text-text-default)] mb-2">Domains</h1>
        <p className="text-[var(--text-text-secondary)]">Manage scraped domains for your chatbots</p>
      </div>

      {chatbots.length === 0 ? (
        <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-12 text-center">
          <Globe className="h-12 w-12 text-[var(--text-text-tertiary)] mx-auto mb-4" />
          <p className="text-[var(--text-text-secondary)] mb-4">Create a chatbot first to add domains</p>
        </div>
      ) : (
        <>
          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-[var(--text-text-default)]">Select Chatbot</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setShowSupportTeam(!showSupportTeam)}
                  disabled={!selectedChatbot}
                  className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] disabled:opacity-50 transition-all"
                >
                  <Users className="h-4 w-4" />
                  <span>Support Team ({supportMembers.length})</span>
                </button>
                <button
                  onClick={() => setShowAddDomain(true)}
                  disabled={!selectedChatbot}
                  className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Domain</span>
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {chatbots.map((chatbot) => (
                <button
                  key={chatbot.id}
                  onClick={() => setSelectedChatbot(chatbot.id)}
                  className={`px-4 py-2 rounded-lg transition-all ${
                    selectedChatbot === chatbot.id
                      ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]"
                      : "bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l3)]"
                  }`}
                >
                  {chatbot.name}
                </button>
              ))}
            </div>
          </div>

          {showSupportTeam && selectedChatbot && (
            <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-text-default)]">
                  Support Team
                </h2>
                <button
                  onClick={() => setShowInviteSupport(true)}
                  className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span>Invite Member</span>
                </button>
              </div>

              {supportMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 text-[var(--text-text-tertiary)] mx-auto mb-3" />
                  <p className="text-[var(--text-text-secondary)]">
                    No support team members yet
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {supportMembers.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-4 bg-[var(--bg-bg-base-secondary)] rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-[var(--text-text-default)]">
                          {member.name}
                        </p>
                        <p className="text-sm text-[var(--text-text-secondary)]">
                          {member.email}
                        </p>
                      </div>
                      <button
                        onClick={() => removeSupportMember(member.id)}
                        className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all"
                        title="Remove Member"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="bg-[var(--bg-bg-overlay-l1)] rounded-xl border border-[var(--border-border-neutral-l1)] overflow-hidden">
            <div className="p-6 border-b border-[var(--border-border-neutral-l1)]">
              <h2 className="text-lg font-semibold text-[var(--text-text-default)]">Domain List</h2>
            </div>
            {domains.length === 0 ? (
              <div className="p-12 text-center">
                <Globe className="h-12 w-12 text-[var(--text-text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--text-text-secondary)]">No domains added yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[var(--bg-bg-base-secondary)]">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase tracking-wider">Domain</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase tracking-wider">Pages</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--text-text-secondary)] uppercase tracking-wider">Last Scraped</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-[var(--text-text-secondary)] uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-border-neutral-l1)]">
                    {domains.map((domain) => (
                      <tr key={domain.id} className="hover:bg-[var(--bg-bg-base-secondary)] transition-colors">
                        <td className="px-6 py-4">
                          <a
                            href={domain.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center space-x-2 text-[var(--text-text-default)] hover:text-[var(--bg-bg-brand)]"
                          >
                            <span>{domain.url}</span>
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(domain.status)}`}>
                            {domain.status === "scraping" && <Loader className="h-3 w-3 mr-1 animate-spin" />}
                            {domain.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[var(--text-text-default)]">{domain.pages_scraped}</td>
                        <td className="px-6 py-4 text-[var(--text-text-secondary)] text-sm">
                          {domain.last_scraped_at ? new Date(domain.last_scraped_at).toLocaleString() : 'Never'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/dashboard/pages?domain=${domain.id}&url=${encodeURIComponent(domain.url)}`}>
                              <button className="px-3 py-1 text-sm bg-[var(--bg-bg-overlay-l2)] hover:bg-[var(--bg-bg-overlay-l3)] rounded text-[var(--text-text-secondary)] transition-all">
                                View Pages
                              </button>
                            </Link>
                            <button
                              onClick={() => setDomainToDelete({ id: domain.id, url: domain.url })}
                              disabled={deletingDomain === domain.id}
                              className="p-2 text-red-500 hover:bg-red-500/10 rounded transition-all disabled:opacity-50"
                              title="Delete Domain"
                            >
                              {deletingDomain === domain.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {showAddDomain && selectedChatbot && (
        <AddDomainModal
          isOpen={showAddDomain}
          onClose={() => {
            setShowAddDomain(false);
          }}
          chatbotId={selectedChatbot}
          onDomainAdded={() => {
            fetchDomains(selectedChatbot);
          }}
        />
      )}

      {showInviteSupport && selectedChatbot && (
        <InviteSupportModal
          isOpen={showInviteSupport}
          onClose={() => setShowInviteSupport(false)}
          chatbotId={selectedChatbot}
          onMemberAdded={() => {
            fetchSupportTeam(selectedChatbot);
          }}
        />
      )}

      <DeleteDomainModal
        isOpen={!!domainToDelete}
        onClose={() => setDomainToDelete(null)}
        onConfirm={() => domainToDelete && deleteDomain(domainToDelete.id)}
        domainUrl={domainToDelete?.url || ""}
        isDeleting={!!deletingDomain}
      />
    </div>
  );
}

