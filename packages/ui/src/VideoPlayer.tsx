import * as React from 'react';
import ReactPlayer from 'react-player';

interface VideoPlayerProps {
  url: string;
  onProgress?: (currentTime: number) => void;
  startPosition?: number;
}

export const VideoPlayer = ({ url, onProgress, startPosition = 0 }: VideoPlayerProps) => {
  const playerRef = React.useRef<ReactPlayer>(null);
  const [hasSetStart, setHasSetStart] = React.useState(false);

  const handleReady = () => {
    if (!hasSetStart && startPosition > 0 && playerRef.current) {
      playerRef.current.seekTo(startPosition, 'seconds');
      setHasSetStart(true);
    }
  };

  const handleProgress = (state: { playedSeconds: number }) => {
    if (onProgress) {
      onProgress(state.playedSeconds);
    }
  };

  return (
    <div className="w-full aspect-video bg-black rounded-lg overflow-hidden border border-line relative">
      <ReactPlayer
        ref={playerRef}
        url={url}
        controls
        width="100%"
        height="100%"
        onReady={handleReady}
        onProgress={handleProgress}
        progressInterval={1000}
      />
    </div>
  );
};
