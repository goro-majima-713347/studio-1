"use client";

import Image from "next/image";
import { Sparkles, LoaderCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const colors = {
  primary: "bg-primary/20",
  accent: "bg-accent/20",
  blue: "bg-blue-500/20",
  green: "bg-green-500/20",
};

export function VirtualBeing({ name, color, evolutionStage, evolutionType, imageUrl, onGenerateImage, isGeneratingImage }) {
  const colorClass = colors[color] || colors.primary;

  let placeholderSrc, imageAlt, imageHint, imageSize, generationPrompt;

  if (evolutionStage === 2) {
    if (evolutionType === 'queen') {
      placeholderSrc = "https://placehold.co/350x350.png";
      imageAlt = "A queen chicken with a tiara";
      imageHint = "queen chicken";
      generationPrompt = "A queen chicken with a beautiful tiara";
      imageSize = 350;
    } else { // king or default
      placeholderSrc = "https://placehold.co/350x350.png";
      imageAlt = "A king chicken with a crown";
      imageHint = "king chicken";
      generationPrompt = "A king chicken with a majestic crown";
      imageSize = 350;
    }
  } else if (evolutionStage === 1) {
    placeholderSrc = "https://placehold.co/300x300.png";
    imageAlt = "A majestic chicken";
    imageHint = "majestic chicken";
    generationPrompt = "A proud, majestic chicken";
    imageSize = 300;
  } else {
    placeholderSrc = "https://placehold.co/250x250.png";
    imageAlt = "A cute chick";
    imageHint = "cute chick";
    generationPrompt = "A cute, fluffy yellow chick";
    imageSize = 250;
  }

  const imageToDisplay = imageUrl || placeholderSrc;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative animate-float">
        <div 
          className={cn("absolute inset-0 rounded-full blur-2xl", colorClass)}
          style={{ transform: 'scale(1.2)'}}
        />
        <Image
          src={imageToDisplay}
          alt={imageAlt}
          data-ai-hint={imageHint}
          width={imageSize}
          height={imageSize}
          className="rounded-full relative z-10 object-cover aspect-square"
          priority
        />
      </div>
      <h2 className="text-3xl font-bold font-headline text-primary-foreground/90">{name}</h2>
       <Button
          onClick={() => onGenerateImage(generationPrompt)}
          disabled={isGeneratingImage}
          size="lg"
        >
          {isGeneratingImage ? (
            <>
              <LoaderCircle className="mr-2" />
              生成中...
            </>
          ) : (
            <>
              <Sparkles className="mr-2" />
              新しい画像を生成
            </>
          )}
        </Button>
    </div>
  );
}
