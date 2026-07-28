import * as React from 'react';

interface MarkdownViewerProps {
  content: string;
}

export const MarkdownViewer = ({ content }: MarkdownViewerProps) => {
  // Mock implementation of a markdown viewer.
  // In a real app, we would use react-markdown or similar.
  return (
    <div className="prose prose-invert max-w-none text-chalk">
      {content.split('\n').map((line, i) => {
        if (line.startsWith('# ')) {
          return <h1 key={i} className="text-3xl font-display font-bold mt-6 mb-4">{line.replace('# ', '')}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={i} className="text-2xl font-display font-bold mt-5 mb-3">{line.replace('## ', '')}</h2>;
        }
        if (line.startsWith('- ')) {
          return <li key={i} className="ml-4 list-disc">{line.replace('- ', '')}</li>;
        }
        if (line === '') {
          return <br key={i} />;
        }
        return <p key={i} className="mb-2 leading-relaxed">{line}</p>;
      })}
    </div>
  );
};
