import * as React from 'react';

interface AudioPlayerProps {
  url: string;
  onProgress?: (currentTime: number) => void;
  startPosition?: number;
}

export const AudioPlayer = ({ url, onProgress, startPosition = 0 }: AudioPlayerProps) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  React.useEffect(() => {
    if (audioRef.current && startPosition > 0) {
      audioRef.current.currentTime = startPosition;
    }
  }, [startPosition]);

  const handleTimeUpdate = () => {
    if (audioRef.current && onProgress) {
      onProgress(audioRef.current.currentTime);
    }
  };

  return (
    <div className="w-full p-4 bg-ink-3 rounded-lg border border-line flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-signal flex items-center justify-center text-ink flex-shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>
      </div>
      <audio
        ref={audioRef}
        src={url}
        controls
        className="w-full"
        onTimeUpdate={handleTimeUpdate}
      />
    </div>
  );
};
