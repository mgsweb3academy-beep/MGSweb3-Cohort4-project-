import * as React from 'react';

interface PdfViewerProps {
  url: string;
  onProgress?: (pageNumber: number) => void;
  startPosition?: number;
}

export const PdfViewer = ({ url, onProgress, startPosition = 1 }: PdfViewerProps) => {
  // A real PDF viewer would use pdf.js or similar. We use an iframe or embed for a quick implementation.
  // We can't track scroll progress accurately in a cross-origin iframe.
  return (
    <div className="w-full h-[600px] border border-line rounded-lg overflow-hidden bg-white">
      <iframe src={`${url}#page=${startPosition}`} className="w-full h-full border-none" title="PDF Viewer" />
    </div>
  );
};
