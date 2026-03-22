import { useEffect, useMemo, useState } from "react";
import {
  getSubscriptionStatus,
  hasConsent,
  onConsentChanged,
  onConsentDialogClosed,
  openConsentDialog,
  readConsent,
  type ConsentState,
  type SubscriptionStatusResponse,
} from "https://cdn.cookiekit.eu/cookiekit/index.esm.js";
import "./App.css";

type GuardScriptResult = {
  source: string;
  activatedAt: string;
  message: string;
};

declare global {
  interface Window {
    cookieKitGuardDemo?: GuardScriptResult;
  }
}

const consentExpressions = [
  "analytics",
  "marketing",
  "preferences",
  "analytics+marketing",
  "analytics|preferences",
];

function App() {
  const [consent, setConsent] = useState<ConsentState | null>(() =>
    readConsent(),
  );
  const [subscriptionStatus, setSubscriptionStatus] =
    useState<SubscriptionStatusResponse | null>(() => getSubscriptionStatus());
  const [dialogClosedAt, setDialogClosedAt] = useState<string | null>(null);
  const [guardScriptResult, setGuardScriptResult] =
    useState<GuardScriptResult | null>(() => window.cookieKitGuardDemo ?? null);

  useEffect(() => {
    const unsubscribeConsentChanged = onConsentChanged((nextConsent) => {
      setConsent(nextConsent);
      setSubscriptionStatus(getSubscriptionStatus());
      window.setTimeout(() => {
        setGuardScriptResult(window.cookieKitGuardDemo ?? null);
      }, 0);
    });

    const unsubscribeDialogClosed = onConsentDialogClosed(() => {
      setDialogClosedAt(new Date().toLocaleTimeString());
      setConsent(readConsent());
      setSubscriptionStatus(getSubscriptionStatus());
      window.setTimeout(() => {
        setGuardScriptResult(window.cookieKitGuardDemo ?? null);
      }, 0);
    });

    return () => {
      unsubscribeConsentChanged();
      unsubscribeDialogClosed();
    };
  }, []);

  const expressionChecks = useMemo(() => {
    return consentExpressions.map((expression) => ({
      expression,
      granted: hasConsent(expression),
    }));
  }, []);

  const openDialog = () => {
    openConsentDialog();
  };

  const refreshFromCookie = () => {
    setConsent(readConsent());
    setSubscriptionStatus(getSubscriptionStatus());
    setGuardScriptResult(window.cookieKitGuardDemo ?? null);
  };

  return (
    <main className="app-shell">
      <header>
        <p className="eyebrow">CookieKit demo</p>
        <h1>SDK utility methods in React</h1>
        <p className="lead">
          This demo reads consent state using CookieKit SDK utilities and reacts
          to consent changes.
        </p>
      </header>

      <section className="card">
        <h2>Dialog actions</h2>
        <div className="action-row">
          <button type="button" onClick={openDialog}>
            Open consent dialog
          </button>
          <button
            type="button"
            className="secondary"
            onClick={refreshFromCookie}
          >
            Refresh with readConsent()
          </button>
        </div>
        <p>
          Last dialog closed event:{" "}
          <strong>{dialogClosedAt ?? "No close event received yet"}</strong>
        </p>
      </section>

      <section className="card">
        <h2>Current consent (readConsent)</h2>
        <pre>{JSON.stringify(consent, null, 2)}</pre>
      </section>

      <section className="card">
        <h2>Subscription status (getSubscriptionStatus)</h2>
        <p>
          <code>getSubscriptionStatus()</code> returns{" "}
          <strong>{subscriptionStatus ? "value" : "null"}</strong>
        </p>
        <pre>{JSON.stringify(subscriptionStatus, null, 2)}</pre>
      </section>

      <section className="card">
        <h2>Consent guard script status</h2>
        <p>
          <code>readGuardScriptResult()</code> returns{" "}
          <strong>{guardScriptResult ? "value" : "null"}</strong>
        </p>
        <pre>{JSON.stringify(guardScriptResult, null, 2)}</pre>
      </section>

      <section className="card">
        <h2>Expression checks (hasConsent)</h2>
        <ul>
          {expressionChecks.map((item) => (
            <li key={item.expression}>
              <code>{item.expression}</code>:{" "}
              {item.granted ? "granted" : "not granted"}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}

export default App;
