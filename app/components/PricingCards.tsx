"use client";

import { Check } from "lucide-react";
import { useState } from "react";

interface Plan {
  tier: string;
  name: string;
  priceMonthly: number;
  priceAnnual: number;
  chatbotLimit: number | string;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    tier: "free",
    name: "Free",
    priceMonthly: 0,
    priceAnnual: 0,
    chatbotLimit: 1,
    features: [
      "1 chatbot",
      "Unlimited domains",
      "Basic support",
      "Web scraping",
      "Document upload"
    ]
  },
  {
    tier: "basic",
    name: "Basic",
    priceMonthly: 9.99,
    priceAnnual: 95.99,
    chatbotLimit: 5,
    features: [
      "5 chatbots",
      "Unlimited domains",
      "Priority support",
      "Web scraping",
      "Document upload",
      "Custom branding"
    ]
  },
  {
    tier: "pro",
    name: "Pro",
    priceMonthly: 24.99,
    priceAnnual: 239.99,
    chatbotLimit: 15,
    popular: true,
    features: [
      "15 chatbots",
      "Unlimited domains",
      "Priority support",
      "Web scraping",
      "Document upload",
      "Custom branding",
      "Advanced analytics",
      "API access"
    ]
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    priceMonthly: 49.99,
    priceAnnual: 479.99,
    chatbotLimit: "Unlimited",
    features: [
      "Unlimited chatbots",
      "Unlimited domains",
      "24/7 dedicated support",
      "Web scraping",
      "Document upload",
      "Custom branding",
      "Advanced analytics",
      "API access",
      "White-label solution",
      "Custom integrations"
    ]
  }
];

interface PricingCardsProps {
  currentPlan: string;
  onSelectPlan: (tier: string, billingPeriod: 'monthly' | 'annual') => void;
  loading?: string | null;
}

export default function PricingCards({ currentPlan, onSelectPlan, loading }: PricingCardsProps) {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');

  const calculateSavings = (monthly: number, annual: number) => {
    if (monthly === 0) return 0;
    const annualMonthly = annual / 12;
    return Math.round(((monthly - annualMonthly) / monthly) * 100);
  };

  return (
    <>
      <div className="flex justify-center mb-8">
        <div className="inline-flex items-center bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-lg p-1">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-6 py-2 rounded-md font-medium transition-all ${
              billingPeriod === 'monthly'
                ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]'
                : 'text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)]'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('annual')}
            className={`px-6 py-2 rounded-md font-medium transition-all relative ${
              billingPeriod === 'annual'
                ? 'bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)]'
                : 'text-[var(--text-text-secondary)] hover:text-[var(--text-text-default)]'
            }`}
          >
            Annual
            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              Save 20%
            </span>
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.tier;
          const isDisabled = plan.tier === 'free' || isCurrent;
          const price = billingPeriod === 'monthly' ? plan.priceMonthly : plan.priceAnnual;
          const displayPrice = billingPeriod === 'annual' ? (price / 12).toFixed(2) : price.toFixed(2);
          const savings = calculateSavings(plan.priceMonthly, plan.priceAnnual);
          
          return (
            <div
              key={plan.tier}
              className={`relative bg-[var(--bg-bg-overlay-l1)] border rounded-2xl p-6 flex flex-col ${
                plan.popular
                  ? "border-[var(--bg-bg-brand)] shadow-lg"
                  : "border-[var(--border-border-neutral-l1)]"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] text-xs font-semibold rounded-full">
                  Most Popular
                </div>
              )}
              
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-[var(--text-text-default)] mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-baseline">
                  <span className="text-4xl font-bold text-[var(--text-text-default)]">
                    ${displayPrice}
                  </span>
                  <span className="text-[var(--text-text-secondary)] ml-2">/month</span>
                </div>
                {billingPeriod === 'annual' && plan.tier !== 'free' && (
                  <p className="text-sm text-green-500 mt-1">
                    ${price.toFixed(2)} billed annually
                  </p>
                )}
              </div>

              <div className="mb-6">
                <p className="text-[var(--text-text-secondary)] text-sm">
                  {typeof plan.chatbotLimit === 'number' 
                    ? `Up to ${plan.chatbotLimit} chatbot${plan.chatbotLimit > 1 ? 's' : ''}`
                    : `${plan.chatbotLimit} chatbots`
                  }
                </p>
              </div>

              <ul className="space-y-3 mb-6 flex-1">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-[var(--text-text-secondary)]">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => onSelectPlan(plan.tier, billingPeriod)}
                disabled={isDisabled || loading !== null}
                className={`w-full px-4 py-2 rounded-lg font-medium transition-all ${
                  isCurrent
                    ? "bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-secondary)] cursor-not-allowed"
                    : isDisabled
                    ? "bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-tertiary)] cursor-not-allowed"
                    : plan.popular
                    ? "bg-[var(--bg-bg-brand)] text-[var(--text-text-onbrand)] hover:bg-[var(--bg-bg-brand-hover)]"
                    : "bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] hover:bg-[var(--bg-bg-overlay-l3)]"
                }`}
              >
                {loading === plan.tier ? "Processing..." : isCurrent ? "Current Plan" : isDisabled ? "Not Available" : "Upgrade"}
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}
