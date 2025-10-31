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
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-6 w-6 text-yellow-500" />
            <h2 className="text-xl font-semibold text-[var(--text-text-default)]">
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

        <div className="mb-6">
          <p className="text-[var(--text-text-secondary)] mb-4">
            You've reached the limit of your {currentPlan === 'free' ? 'Free' : currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} plan.
          </p>
          
          <div className="bg-[var(--bg-bg-overlay-l2)] rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--text-text-secondary)]">Current Usage</span>
              <span className="text-sm font-semibold text-[var(--text-text-default)]">
                {currentCount}/{chatbotLimit === -1 ? '∞' : chatbotLimit} chatbots
              </span>
            </div>
            <div className="w-full bg-[var(--bg-bg-base-secondary)] rounded-full h-2">
              <div
                className="bg-[var(--bg-bg-brand)] h-2 rounded-full"
                style={{ width: `${chatbotLimit === -1 ? 0 : Math.min((currentCount / chatbotLimit) * 100, 100)}%` }}
              />
            </div>
          </div>

          <p className="text-sm text-[var(--text-text-secondary)]">
            Upgrade your plan to create more chatbots and unlock additional features.
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleUpgrade}
            className="flex-1 px-4 py-2 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] rounded-lg hover:bg-[var(--bg-bg-brand-hover)] transition-all font-medium flex items-center justify-center space-x-2"
          >
            <span>Upgrade Now</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

