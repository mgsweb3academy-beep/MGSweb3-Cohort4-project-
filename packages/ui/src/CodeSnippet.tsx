import * as React from 'react';

interface CodeSnippetProps {
  code: string;
  language?: string;
}

export const CodeSnippet = ({ code, language = 'javascript' }: CodeSnippetProps) => {
  return (
    <div className="relative rounded-lg overflow-hidden bg-ink-2 border border-line">
      <div className="flex items-center px-4 py-2 bg-ink-3 border-b border-line">
        <span className="mono text-dim text-xs">{language}</span>
        <button className="ml-auto text-dim hover:text-chalk transition-colors" title="Copy code">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
        </button>
      </div>
      <div className="p-4 overflow-x-auto">
        <pre className="font-mono text-sm text-chalk leading-relaxed">
          <code>{code}</code>
        </pre>
      </div>
    </div>
  );
};
