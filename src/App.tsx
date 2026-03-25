import { useEffect, useMemo, useState } from 'react';

function App() {
  const consentExpressions = [
    'preferences',
    'analytics',
    'marketing',
    'preferences|analytics',
    'preferences|marketing',
    'analytics|marketing',
    'preferences+analytics',
    'preferences+marketing',
    'analytics+marketing',
  ];
  const [expressionChecks, setExpressionChecks] = useState<{ expression: string; granted: boolean }[]>([]);
  const [consent, setConsent] = useState<PrivacyKitConsentState | null>();

  useEffect(() => {
    const checkExpressions = () => {
      return consentExpressions.map(expression => ({
        expression,
        granted: window.PrivacyKit?.hasConsent(expression) ?? false,
      }));
    };

    const updateConsent = () => {
      setConsent(window.PrivacyKit?.readConsent());
      setExpressionChecks(checkExpressions());
    };
    const unsubscribeOnReady = window.PrivacyKit?.onReady(updateConsent);
    const unsubscribeConsentChanged = window.PrivacyKit?.onConsentChanged(updateConsent);
    return () => {
      unsubscribeConsentChanged?.();
      unsubscribeOnReady?.();
    };
  }, []);

  const openDialog = () => {
    window.PrivacyKit?.openConsentDialog();
  };

  return (
    <div>
      <div className="segment-header">
        <h2>Using PrivacyKit with React</h2>
      </div>
      <section className="section">
        <h3>Current consent (readConsent)</h3>
        <pre>{JSON.stringify(consent, null, 2)}</pre>
      </section>

      <section className="section">
        <h3>Expression checks (hasConsent)</h3>
        <pre>
          <ul>
            {expressionChecks.map(item => (
              <li key={item.expression} style={{ color: item.granted ? 'var(--primary-color)' : '#717171' }}>
                {item.expression}: {item.granted ? 'granted' : 'not granted'}
              </li>
            ))}
          </ul>
        </pre>
      </section>

      <div className="action-row">
        <button className="btn" onClick={openDialog}>
          Open consent dialog
        </button>
      </div>
    </div>
  );
}

export default App;
