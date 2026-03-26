import type { FunctionComponent, JSX } from 'react';
import githubIcon from '../../assets/brand-github.svg';

interface Props {
  title?: string | undefined;
  html: string;
  githubUrl?: string | undefined;
  githuTitle?: string | undefined;
  urlPath?: string | undefined;
  urlTitle?: string | undefined;
  footer?: JSX.Element | string | undefined;
  height?: string | undefined;
}

export const CodePanel: FunctionComponent<Props> = ({ title, html, githubUrl, githuTitle = 'View on GitHub', urlPath, urlTitle, footer, height }: Props) => {
  const styles = height ? { height } : {};
  const hasHeader = title || githubUrl || (urlPath && urlTitle);
  return (
    <div className="code-snippet-root">
      {hasHeader && (
        <div className="code-snippet-header">
          <span className="code-snippet-title">{title}</span>

          {githubUrl && (
            <a href={githubUrl} target="_blank" rel="noreferrer" className="code-snippet-link" aria-label={githuTitle}>
              <span>{githuTitle}</span>
              <img src={githubIcon} alt="GitHub" width={16} height={16} style={{ display: 'block' }} />
            </a>
          )}
          {urlPath && urlTitle && (
            <a href={urlPath} target="_self" className="code-snippet-link" aria-label={urlTitle}>
              <span>{urlTitle}</span>
            </a>
          )}
        </div>
      )}
      <div className="code-snippet-body" style={styles}>
        <div dangerouslySetInnerHTML={{ __html: html }} />
      </div>
      {footer && <div className="code-snippet-footer">{footer}</div>}
    </div>
  );
};

export default CodePanel;
