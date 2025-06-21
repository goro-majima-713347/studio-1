// @/app/actions.ts
"use server";

import { generateUniqueResponse } from "@/ai/flows/generate-unique-response";
import { z } from "zod";

const messageSchema = z.object({
  userInput: z.string(),
  personalityTraits: z.string(),
});

export async function handleUserMessage(data) {
  const parsedData = messageSchema.parse(data);
  try {
    const aiResponse = await generateUniqueResponse({
      userInput: parsedData.userInput,
      personalityTraits: parsedData.personalityTraits,
    });
    return aiResponse;
  } catch (error) {
    console.error("Error generating AI response:", error);
    return { response: "I'm feeling a bit quiet right now..." };
  }
}
