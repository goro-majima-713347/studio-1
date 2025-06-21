'use server';

/**
 * @fileOverview An AI agent for generating unique responses from a virtual being.
 *
 * - generateUniqueResponse - A function that generates a unique response from the virtual being.
 * - GenerateUniqueResponseInput - The input type for the generateUniqueResponse function.
 * - GenerateUniqueResponseOutput - The return type for the generateUniqueResponse function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateUniqueResponseInputSchema = z.object({
  personalityTraits: z
    .string()
    .describe("The personality traits of the virtual being."),
  userInput: z.string().describe('The user input to the virtual being.'),
});
export type GenerateUniqueResponseInput = z.infer<
  typeof GenerateUniqueResponseInputSchema
>;

const GenerateUniqueResponseOutputSchema = z.object({
  response: z.string().describe('The unique response from the virtual being.'),
});
export type GenerateUniqueResponseOutput = z.infer<
  typeof GenerateUniqueResponseOutputSchema
>;

export async function generateUniqueResponse(
  input: GenerateUniqueResponseInput
): Promise<GenerateUniqueResponseOutput> {
  return generateUniqueResponseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateUniqueResponsePrompt',
  input: {schema: GenerateUniqueResponseInputSchema},
  output: {schema: GenerateUniqueResponseOutputSchema},
  prompt: `You are a virtual being with the following personality traits: {{{personalityTraits}}}. Respond to the following user input with a unique response that reflects your personality:\n\nUser Input: {{{userInput}}}`,
});

const generateUniqueResponseFlow = ai.defineFlow(
  {
    name: 'generateUniqueResponseFlow',
    inputSchema: GenerateUniqueResponseInputSchema,
    outputSchema: GenerateUniqueResponseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
