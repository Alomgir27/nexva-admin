"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CreditCard, CheckCircle, XCircle, Loader, ExternalLink } from "lucide-react";
import PricingCards from "@/app/components/PricingCards";
import { API_BASE_URL, API_ENDPOINTS } from "@/app/config/api";

interface SubscriptionInfo {
  plan_tier: string;
  status: string;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
}

function BillingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [subscription, setSubscription] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showCancelMessage, setShowCancelMessage] = useState(false);

  useEffect(() => {
    const success = searchParams?.get("success");
    const canceled = searchParams?.get("canceled");
    
    if (success === "true") {
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    }
    if (canceled === "true") {
      setShowCancelMessage(true);
      setTimeout(() => setShowCancelMessage(false), 5000);
    }
    
    fetchSubscription();
  }, [searchParams]);

  const fetchSubscription = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(API_ENDPOINTS.billing.subscription, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to fetch subscription");
      const data = await response.json();
      setSubscription(data);
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = async (tier: string, billingPeriod: 'monthly' | 'annual') => {
    if (tier === "free" || tier === subscription?.plan_tier) return;

    setProcessingPlan(tier);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_ENDPOINTS.billing.createCheckoutSession, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ plan_tier: tier, billing_period: billingPeriod }),
      });

      if (!response.ok) throw new Error("Failed to create checkout session");
      const data = await response.json();
      
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      setProcessingPlan(null);
    }
  };

  const handleManageBilling = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(API_ENDPOINTS.billing.portalSession, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) throw new Error("Failed to create portal session");
      const data = await response.json();
      
      if (data.url) {
        window.open(data.url, "_blank");
      }
    } catch (error) {
      console.error("Error creating portal session:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-[var(--text-text-secondary)]" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--text-text-default)] mb-2">Billing & Subscription</h1>
        <p className="text-[var(--text-text-secondary)]">Manage your subscription and billing information</p>
      </div>

      {showSuccessMessage && (
        <div className="mb-6 bg-green-500/10 border border-green-500/20 rounded-lg p-4 flex items-center space-x-3">
          <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
          <div>
            <p className="text-green-500 font-medium">Payment Successful!</p>
            <p className="text-green-500/80 text-sm">Your subscription has been activated.</p>
          </div>
        </div>
      )}

      {showCancelMessage && (
        <div className="mb-6 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 flex items-center space-x-3">
          <XCircle className="h-5 w-5 text-yellow-500 flex-shrink-0" />
          <div>
            <p className="text-yellow-500 font-medium">Payment Canceled</p>
            <p className="text-yellow-500/80 text-sm">You can try again whenever you're ready.</p>
          </div>
        </div>
      )}

      {subscription && subscription.plan_tier !== "free" && (
        <div className="mb-8 bg-[var(--bg-bg-overlay-l1)] border border-[var(--border-border-neutral-l1)] rounded-lg p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="p-3 bg-[var(--bg-bg-brand)]/10 rounded-lg">
                <CreditCard className="h-6 w-6 text-[var(--bg-bg-brand)]" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[var(--text-text-default)] mb-1">Current Subscription</h2>
                <p className="text-[var(--text-text-secondary)] text-sm mb-2">
                  Plan: <span className="font-medium text-[var(--text-text-default)] capitalize">{subscription.plan_tier}</span>
                </p>
                <p className="text-[var(--text-text-secondary)] text-sm mb-2">
                  Status: <span className={`font-medium ${subscription.status === 'active' ? 'text-green-500' : 'text-yellow-500'}`}>
                    {subscription.status}
                  </span>
                </p>
                {subscription.current_period_end && (
                  <p className="text-[var(--text-text-secondary)] text-sm">
                    {subscription.cancel_at_period_end ? "Ends" : "Renews"} on: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleManageBilling}
              className="flex items-center space-x-2 px-4 py-2 bg-[var(--bg-bg-overlay-l2)] text-[var(--text-text-default)] rounded-lg hover:bg-[var(--bg-bg-overlay-l3)] transition-colors"
            >
              <span>Manage Billing</span>
              <ExternalLink className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h2 className="text-xl font-semibold text-[var(--text-text-default)] mb-4">Available Plans</h2>
      </div>

      <PricingCards
        currentPlan={subscription?.plan_tier || "free"}
        onSelectPlan={handleSelectPlan}
        loading={processingPlan}
      />
    </div>
  );
}

export default function BillingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="h-8 w-8 animate-spin text-[var(--text-text-secondary)]" />
      </div>
    }>
      <BillingContent />
    </Suspense>
  );
}
