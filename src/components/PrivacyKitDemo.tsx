import { useEffect, useState, type FunctionComponent } from 'react';

const PrivacyKitDemo: FunctionComponent = () => {
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

      <div className="action-row">
        <button className="btn secondary" onClick={openDialog}>
          Open consent dialog
        </button>
      </div>

      <section className="section">
        <h3>Current consent (readConsent)</h3>
        <pre className="api-result">{JSON.stringify(consent, null, 2)}</pre>
      </section>

      <section className="section">
        <h3>Expression checks (hasConsent)</h3>
        <pre className="api-result">
          <ul>
            {expressionChecks.map(item => (
              <li key={item.expression} style={{ color: item.granted ? 'var(--secondary-color)' : '#717171' }}>
                {item.expression}: {item.granted ? 'granted' : 'not granted'}
              </li>
            ))}
          </ul>
        </pre>
      </section>
    </div>
  );
};

export default PrivacyKitDemo;
