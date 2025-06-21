"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { handleUserMessage } from "@/app/actions";
import { cn } from "@/lib/utils";

export function InteractionPanel({ beingName, personality, conversation, onNewMessage }) {
  const [input, setInput] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
          viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [conversation]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isThinking) return;

    const userInput = input;
    onNewMessage({ sender: "user", text: userInput });
    setInput("");
    setIsThinking(true);

    try {
      const aiResponse = await handleUserMessage({ userInput, personalityTraits: personality });
      onNewMessage({ sender: "being", text: aiResponse.response });
    } catch (error) {
      console.error(error);
      onNewMessage({ sender: "being", text: "I... I don't feel like talking right now." });
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <span>Talk with {beingName}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-grow pr-4 -mr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {conversation.map((msg, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-end gap-2",
                  msg.sender === "user" ? "justify-end" : "justify-start"
                )}
              >
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    msg.sender === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <p>{msg.text}</p>
                </div>
              </div>
            ))}
            {isThinking && (
                 <div className="flex items-end gap-2 justify-start">
                    <div className="max-w-[80%] rounded-lg p-3 text-sm bg-muted text-muted-foreground">
                        <div className="flex items-center gap-2">
                            <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="h-2 w-2 bg-foreground/50 rounded-full animate-bounce"></span>
                        </div>
                    </div>
                </div>
            )}
          </div>
        </ScrollArea>
        <form onSubmit={handleSubmit} className="flex gap-2 items-center">
          <Input
            type="text"
            placeholder="Say something..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isThinking}
            className="flex-grow"
          />
          <Button type="submit" size="icon" disabled={isThinking || !input.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
