declare module "https://cdn.privacykit.eu/privacykit/index.esm.js" {
  export type ConsentState = {
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };

  export type ConsentCategory = "analytics" | "marketing" | "preferences";

  export type ConsentRecord = {
    consent: ConsentState;
    mode: "accept-all" | "reject-all" | "custom";
    timestamp: string;
  };

  export type SubscriptionStatusResponse = {
    active: boolean;
    plan: string;
    renewalDate: string | null;
  };

  export function readConsent(): ConsentState | null;
  export function getSubscriptionStatus(): SubscriptionStatusResponse | null;
  export function hasConsent(expression?: string): boolean;
  export function onConsentChanged(
    callback: (consent: ConsentState | null) => void,
  ): () => void;
  export function openConsentDialog(): void;
  export function onConsentDialogClosed(callback: () => void): () => void;
}
