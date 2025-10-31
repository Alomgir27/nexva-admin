"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { MessageSquare, Send, CheckCircle2, Loader } from "lucide-react";
import { API_BASE_URL, API_ENDPOINTS } from "@/app/config/api";

interface Ticket {
  id: number;
  conversation_id: number;
  chatbot_id: number;
  chatbot_name: string;
  status: string;
  priority: string;
  last_message: string;
  created_at: string;
  resolved_at: string | null;
}

interface Message {
  id: number;
  role: string;
  content: string;
  sender_type: string;
  sender_email: string | null;
  created_at: string;
}

interface TicketDetail {
  ticket: Ticket;
  messages: Message[];
}

export default function SupportPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<number | null>(null);
  const [ticketDetail, setTicketDetail] = useState<TicketDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("open");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }
    fetchTickets();

    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, [filter]);

  useEffect(() => {
    if (selectedTicket) {
      fetchTicketDetail(selectedTicket);
      connectWebSocket(selectedTicket);
    }
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [selectedTicket]);

  const connectWebSocket = (ticketId: number) => {
    if (wsRef.current) {
      wsRef.current.close();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//localhost:8000/ws/support/${ticketId}?support_email=support@nexva.ai`;
    
    console.log('[Support WS] Connecting to:', wsUrl);
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('[Support WS] ✅ Connected to ticket', ticketId);
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('[Support WS] Message received:', data);
      
      if (data.type === 'message') {
        fetchTicketDetail(ticketId);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('[Support WS] ❌ Error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('[Support WS] Disconnected');
    };
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [ticketDetail?.messages]);

  const fetchTickets = async () => {
    try {
      const token = localStorage.getItem("token");
      const url = filter === "all" 
        ? API_ENDPOINTS.support.tickets
        : `${API_ENDPOINTS.support.tickets}?status=${filter}`;
      
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setTickets(data);
      }
    } catch (error) {
      console.error("Failed to fetch tickets", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTicketDetail = async (ticketId: number) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_ENDPOINTS.support.tickets}/${ticketId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setTicketDetail(data);
      }
    } catch (error) {
      console.error("Failed to fetch ticket detail", error);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !selectedTicket || !ticketDetail) return;

    setSending(true);
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        console.log('[Support WS] Sending message via WebSocket');
        wsRef.current.send(JSON.stringify({ message: message.trim() }));
        setMessage("");
        
        setTimeout(() => fetchTicketDetail(selectedTicket), 200);
      } else {
        console.log('[Support API] WebSocket not ready, using REST API');
        const token = localStorage.getItem("token");
        const userEmail = "support@nexva.ai";

        const response = await fetch(
          `${API_ENDPOINTS.support.tickets}/${selectedTicket}/message`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ message, sender_email: userEmail }),
          }
        );

        if (response.ok) {
          setMessage("");
          fetchTicketDetail(selectedTicket);
        }
      }
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setSending(false);
    }
  };

  const resolveTicket = async () => {
    if (!selectedTicket) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${API_BASE_URL}/api/tickets/${selectedTicket}/resolve`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        fetchTickets();
        fetchTicketDetail(selectedTicket);
      }
    } catch (error) {
      console.error("Failed to resolve ticket", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-yellow-500";
      case "in_progress":
        return "bg-blue-500";
      case "resolved":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="h-8 w-8 animate-spin text-[var(--text-text-tertiary)]" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-bg-base-default)]">
      <div className="border-b border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-secondary)] px-6 py-4">
        <h1 className="text-2xl font-semibold text-[var(--text-text-default)]">Support Tickets</h1>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-96 border-r border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-secondary)] flex flex-col">
          <div className="p-4 border-b border-[var(--border-border-neutral-l1)]">
            <div className="flex space-x-1">
              {["all", "open", "in_progress", "resolved"].map((status) => (
                <button
                  key={status}
                  onClick={() => setFilter(status)}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium transition-all capitalize ${
                    filter === status
                      ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]"
                      : "text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)]"
                  }`}
                >
                  {status.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket.id)}
                className={`p-4 border-b border-[var(--border-border-neutral-l1)] cursor-pointer transition-colors ${
                  selectedTicket === ticket.id
                    ? "bg-[var(--bg-bg-overlay-l1)]"
                    : "hover:bg-[var(--bg-bg-overlay-l1)]"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`} />
                    <span className="font-medium text-[var(--text-text-default)] text-sm">
                      {ticket.chatbot_name}
                    </span>
                  </div>
                  <span className="text-xs text-[var(--text-text-tertiary)]">
                    {formatDate(ticket.created_at)}
                  </span>
                </div>
                <p className="text-sm text-[var(--text-text-secondary)] line-clamp-2">
                  {ticket.last_message}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex-1 flex flex-col bg-[var(--bg-bg-base-default)]">
          {selectedTicket && ticketDetail ? (
            <>
              <div className="border-b border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-secondary)] px-6 py-4 flex items-center justify-between">
                <div>
                  <h2 className="font-semibold text-[var(--text-text-default)]">
                    Ticket #{ticketDetail.ticket.id}
                  </h2>
                  <p className="text-sm text-[var(--text-text-secondary)]">
                    {ticketDetail.ticket.chatbot_name}
                  </p>
                </div>
                {ticketDetail.ticket.status !== "resolved" && (
                  <button
                    onClick={resolveTicket}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Resolve</span>
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {ticketDetail.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender_type === "support" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_type === "support"
                          ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]"
                          : "bg-[var(--bg-bg-overlay-l1)] text-[var(--text-text-default)]"
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                      <p className="text-xs mt-1 opacity-70">{formatTime(msg.created_at)}</p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {ticketDetail.ticket.status !== "resolved" && (
                <div className="border-t border-[var(--border-border-neutral-l1)] bg-[var(--bg-bg-base-secondary)] p-4">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && !sending && sendMessage()}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-2 bg-[var(--bg-bg-base-default)] border border-[var(--border-border-neutral-l1)] rounded-lg text-[var(--text-text-default)] focus:outline-none focus:border-[var(--bg-bg-brand)]"
                    />
                    <button
                      onClick={sendMessage}
                      disabled={sending || !message.trim()}
                      className="px-6 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] disabled:opacity-50 transition-all flex items-center space-x-2"
                    >
                      {sending ? <Loader className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-[var(--text-text-tertiary)] mx-auto mb-4" />
                <p className="text-[var(--text-text-secondary)]">
                  Select a ticket to view conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

