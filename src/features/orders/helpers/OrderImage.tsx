"use client";

import Image from "next/image";

interface PropsI {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
}

export function OrderImage({
  src,
  alt,
  width,
  height,
  className,
  sizes,
}: PropsI) {
  const isExternalUrl = src.startsWith("http://") || src.startsWith("https://");
  const fallbackSrc = "/placeholder.png";

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const image = e.currentTarget;

    if (image.src.includes(fallbackSrc)) {
      return;
    }

    image.src = fallbackSrc;
  };

  if (isExternalUrl) {
    return (
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        onError={handleError}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width ?? 88}
      height={height ?? 88}
      className={className}
      sizes={sizes}
      onError={handleError}
    />
  );
}
