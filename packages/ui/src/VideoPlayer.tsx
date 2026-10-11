import * as React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  onProgress?: (currentTime: number) => void;
  startPosition?: number;
}
export const VideoPlayer = ({ url, onProgress, startPosition = 0 }: VideoPlayerProps) => {
  const playerRef = React.useRef<HTMLVideoElement>(null);
  const startedUrl = React.useRef<string | null>(null);
  const handleReady = () => {
    if (startedUrl.current !== url && playerRef.current) {
      playerRef.current.currentTime = startPosition;
      startedUrl.current = url;
    }
  };
  return <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-line relative">
    <ReactPlayer ref={playerRef} src={url} controls width="100%" height="100%"
      onReady={handleReady} onTimeUpdate={event => onProgress?.(event.currentTarget.currentTime)} />
  </div>;
};
