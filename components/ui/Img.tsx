import Image, { type ImageProps } from 'next/image';
import { blurData } from '@/content/blur';

/**
 * next/image with an automatic blurred placeholder for every local photo
 * (see content/blur.ts). The frame is never empty: a soft preview paints
 * with the HTML and the full image sharpens in when it arrives.
 */
export function Img({ src, alt, ...props }: ImageProps & { src: string }) {
  const blur = blurData[src];
  return <Image src={src} alt={alt} {...(blur ? { placeholder: 'blur' as const, blurDataURL: blur } : {})} {...props} />;
}
