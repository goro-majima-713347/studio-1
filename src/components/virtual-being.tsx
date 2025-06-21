"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

const colors = {
  primary: "bg-primary/20",
  accent: "bg-accent/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
};

export function VirtualBeing({ name, color }) {
  const colorClass = colors[color] || colors.primary;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative animate-float">
        <div 
          className={cn("absolute inset-0 rounded-full blur-2xl", colorClass)}
          style={{ transform: 'scale(1.2)'}}
        />
        <Image
          src="https://placehold.co/250x250.png"
          alt="A cute virtual being"
          data-ai-hint="cute creature"
          width={250}
          height={250}
          className="rounded-full relative z-10"
          priority
        />
      </div>
      <h2 className="text-3xl font-bold font-headline text-primary-foreground/90">{name}</h2>
    </div>
  );
}
