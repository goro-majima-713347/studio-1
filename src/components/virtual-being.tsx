"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const colors = {
  primary: "bg-primary/20",
  accent: "bg-accent/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
};

export function VirtualBeing({ name, color, evolutionStage }) {
  const colorClass = colors[color] || colors.primary;

  let imageSrc, imageAlt, imageHint, imageSize;

  if (evolutionStage === 2) {
    imageSrc = "https://placehold.co/350x350.png";
    imageAlt = "A king chicken with a crown";
    imageHint = "king chicken";
    imageSize = 350;
  } else if (evolutionStage === 1) {
    imageSrc = "https://placehold.co/300x300.png";
    imageAlt = "A majestic chicken";
    imageHint = "majestic chicken";
    imageSize = 300;
  } else {
    imageSrc = "https://placehold.co/250x250.png";
    imageAlt = "A cute chick";
    imageHint = "cute chick";
    imageSize = 250;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative animate-float">
        <div 
          className={cn("absolute inset-0 rounded-full blur-2xl", colorClass)}
          style={{ transform: 'scale(1.2)'}}
        />
        <Image
          src={imageSrc}
          alt={imageAlt}
          data-ai-hint={imageHint}
          width={imageSize}
          height={imageSize}
          className="rounded-full relative z-10"
          priority
        />
      </div>
      <h2 className="text-3xl font-bold font-headline text-primary-foreground/90">{name}</h2>
    </div>
  );
}
