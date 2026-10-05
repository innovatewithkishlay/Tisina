'use client';

import { useEffect, useRef, useState } from 'react';
import { Img } from '@/components/ui/Img';
import { cn } from '@/lib/utils';

/**
 * A silent ambient loop — a candlelit, set table — behind the reservation page. The still is
 * painted first; the film fades in once it can play. Visitors who prefer
 * reduced motion keep the still.
 */
export function AmbientFilm({ poster, src, className }: { poster: string; src: string; className?: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) video.current?.pause();
  }, []);

  return (
    <div className={cn('absolute inset-0 overflow-hidden', className)} aria-hidden="true">
      <Img src={poster} alt="" fill priority sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
      <video
        ref={video}
        className={cn('absolute inset-0 h-full w-full object-cover transition-opacity duration-1000', ready ? 'opacity-100' : 'opacity-0')}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={poster}
        onCanPlay={() => setReady(true)}
      >
        <source src={src} type="video/mp4" />
      </video>
    </div>
  );
}
