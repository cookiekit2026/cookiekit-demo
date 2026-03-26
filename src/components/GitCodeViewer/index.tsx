import type { FunctionComponent } from 'react';
import { useEffect, useState } from 'react';
import { codeToHtml } from 'shiki';
import CodePanel from './CodePanel';

import './styles.css';

interface Props {
  title?: string | undefined;
  lang: string;
  repo: string;
  path: string;
  height?: string | undefined;
}

export const GitCodeViewer: FunctionComponent<Props> = ({ title, lang, repo, path, height }: Props) => {
  const githubUrl = `https://github.com/${repo}/blob/${path}`;
  const rawUrl = `https://raw.githubusercontent.com/${repo}/${path}`;

  const [html, setHtml] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCode() {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(rawUrl, { cache: 'no-store' });
        if (!res.ok) {
          throw new Error(`Failed to load ${path}`);
        }

        const code = await res.text();
        const renderedHtml = await codeToHtml(code, { lang, theme: 'github-dark' });
        if (isMounted) {
          setHtml(renderedHtml);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadCode();

    return () => {
      isMounted = false;
    };
  }, [lang, path, rawUrl]);

  if (isLoading) {
    return (
      <div className="code-snippet-root">
        <div className="code-snippet-header">
          <span>{title}</span>
        </div>
        <div className="code-snippet-body">Loading…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="code-snippet-root">
        <div className="code-snippet-header">
          <span>{title}</span>
        </div>
        <div className="code-snippet-error">{error}</div>
      </div>
    );
  }

  return <CodePanel title={title} html={html} githubUrl={githubUrl} height={height} />;
};

export default GitCodeViewer;
