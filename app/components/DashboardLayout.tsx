"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, Key, Globe, BookOpen, LogOut, Menu, X, Sparkles, Volume2, MessageCircle, Code, CreditCard, User } from "lucide-react";

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: "Overview", path: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { label: "Support", path: "/dashboard/support", icon: <MessageCircle className="h-5 w-5" /> },
  { label: "Domains", path: "/dashboard/domains", icon: <Globe className="h-5 w-5" /> },
  { label: "API Tokens", path: "/dashboard/tokens", icon: <Key className="h-5 w-5" /> },
  { label: "Widget Setup", path: "/dashboard/widget-setup", icon: <Code className="h-5 w-5" /> },
  { label: "Voice Characters", path: "/dashboard/voices", icon: <Volume2 className="h-5 w-5" /> },
  { label: "Billing", path: "/dashboard/billing", icon: <CreditCard className="h-5 w-5" /> },
  { label: "Profile", path: "/dashboard/profile", icon: <User className="h-5 w-5" /> },
  { label: "Playground", path: "/playground", icon: <Sparkles className="h-5 w-5" /> },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[var(--bg-bg-base-default)] flex">
      <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--bg-bg-base-secondary)] border-r border-[var(--border-border-neutral-l1)] transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200`}>
        <div className="flex flex-col h-full">
          <div className="p-6 border-b border-[var(--border-border-neutral-l1)]">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div className="relative">
                <div className="absolute inset-0 bg-[var(--bg-bg-brand)]/20 blur-md"></div>
                <Image src="/images/img.png" alt="Nexva" width={36} height={36} className="relative z-10" />
              </div>
              <span className="text-xl font-bold tracking-tighter uppercase text-[var(--text-text-default)]">Nexva</span>
            </Link>
          </div>

          <nav className="flex-1 p-0 space-y-px">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link key={item.path} href={item.path} onClick={() => setSidebarOpen(false)}>
                  <div className={`flex items-center space-x-3 px-6 py-4 transition-all border-l-2 ${isActive ? 'border-[var(--bg-bg-brand)] bg-[var(--bg-bg-brand)]/5 text-[var(--bg-bg-brand)]' : 'border-transparent text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)] hover:text-[var(--text-text-default)] hover:border-[var(--text-text-tertiary)]'}`}>
                    {item.icon}
                    <span className="font-mono text-xs font-bold uppercase tracking-wider">{item.label}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          <div className="p-0 border-t border-[var(--border-border-neutral-l1)]">
            <button onClick={logout} className="flex items-center space-x-3 w-full px-6 py-4 text-[var(--text-text-secondary)] hover:bg-[var(--bg-bg-overlay-l1)] hover:text-[var(--text-text-default)] transition-colors border-l-2 border-transparent hover:border-[var(--text-text-tertiary)]">
              <LogOut className="h-5 w-5" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[var(--bg-bg-base-secondary)] border-b border-[var(--border-border-neutral-l1)] p-4 lg:hidden">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="text-[var(--text-text-default)]">
            {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

