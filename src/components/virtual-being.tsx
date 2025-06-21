"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const colors = {
  primary: "bg-primary/20",
  accent: "bg-accent/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
};

export function VirtualBeing({ name, color, isEvolved }) {
  const colorClass = colors[color] || colors.primary;

  const imageSrc = isEvolved ? "https://placehold.co/300x300.png" : "https://placehold.co/250x250.png";
  const imageAlt = isEvolved ? "A majestic chicken" : "A cute chick";
  const imageHint = isEvolved ? "majestic chicken" : "cute chick";
  const imageSize = isEvolved ? 300 : 250;


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
