"use client";

import { X, AlertTriangle, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  chatbotLimit: number;
  currentCount: number;
}

export default function UpgradeModal({ isOpen, onClose, currentPlan, chatbotLimit, currentCount }: UpgradeModalProps) {
  const router = useRouter();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    router.push('/dashboard/billing');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] p-8 w-full max-w-md relative">
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-[var(--bg-bg-brand)]"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-[var(--bg-bg-brand)]"></div>

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            <h2 className="text-lg font-bold text-[var(--text-text-default)] uppercase tracking-wider">
              Chatbot Limit Reached
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-text-tertiary)] hover:text-[var(--text-text-default)]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-8">
          <p className="text-[var(--text-text-secondary)] mb-6 font-mono text-xs">
            You've reached the limit of your <span className="text-[var(--text-text-default)] font-bold uppercase">{currentPlan === 'free' ? 'Free' : currentPlan}</span> plan.
          </p>

          <div className="bg-[var(--bg-bg-overlay-l2)] border border-[var(--border-border-neutral-l1)] p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] text-[var(--text-text-secondary)] uppercase tracking-wider font-mono">Current Usage</span>
              <span className="text-xs font-bold text-[var(--text-text-default)] font-mono">
                {currentCount}/{chatbotLimit === -1 ? '∞' : chatbotLimit} chatbots
              </span>
            </div>
            <div className="w-full bg-[var(--bg-bg-base-secondary)] h-1.5">
              <div
                className="bg-[var(--bg-bg-brand)] h-1.5"
                style={{ width: `${chatbotLimit === -1 ? 0 : Math.min((currentCount / chatbotLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-xs text-[var(--text-text-secondary)] font-mono">
            Upgrade your plan to create more chatbots and unlock additional features.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-transparent border border-[var(--border-border-neutral-l1)] text-[var(--text-text-default)] font-bold uppercase tracking-wider font-mono text-xs hover:bg-[var(--bg-bg-overlay-l2)] hover:border-[var(--text-text-tertiary)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-3 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] font-bold uppercase tracking-wider font-mono text-xs hover:bg-[var(--bg-bg-brand-hover)] transition-all flex items-center justify-center space-x-2"
          >
            <span>UPGRADE NOW</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

