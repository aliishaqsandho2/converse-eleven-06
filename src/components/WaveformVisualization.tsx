import React from 'react';

interface WaveformVisualizationProps {
  isPlaying: boolean;
}

export const WaveformVisualization: React.FC<WaveformVisualizationProps> = ({ isPlaying }) => {
  const bars = Array.from({ length: 12 }, (_, i) => i);

  return (
    <div className="flex items-center justify-center gap-1 h-12">
      {bars.map((bar) => (
        <div
          key={bar}
          className={`w-1 bg-gradient-to-t from-primary to-voice-secondary rounded-full transition-all duration-300 ${
            isPlaying ? 'wave-bar' : 'h-2'
          }`}
          style={{
            height: isPlaying ? `${Math.random() * 40 + 8}px` : '8px',
            animationDelay: `${bar * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
};