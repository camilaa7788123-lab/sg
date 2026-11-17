import React, { useState } from 'react';
import { Gamepad2 } from 'lucide-react';

interface GameArtworkProps {
  src: string;
  alt: string;
  title: string;
  className?: string;
}

export const GameArtwork: React.FC<GameArtworkProps> = ({
  src,
  alt,
  title,
  className = 'w-full h-full object-cover',
}) => {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div
        className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-[#162033] via-[#131A26] to-[#0B0F17] p-4 text-center"
        role="img"
        aria-label={alt}
      >
        <Gamepad2 className="h-9 w-9 text-amber-400/80" aria-hidden="true" />
        <span className="font-display text-sm font-semibold text-slate-200">{title}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={className}
    />
  );
};
