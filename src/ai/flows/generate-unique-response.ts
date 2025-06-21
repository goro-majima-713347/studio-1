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
    .describe("バーチャルな存在の性格。"),
  userInput: z.string().describe('バーチャルな存在へのユーザー入力。'),
});
export type GenerateUniqueResponseInput = z.infer<
  typeof GenerateUniqueResponseInputSchema
>;

const GenerateUniqueResponseOutputSchema = z.object({
  response: z.string().describe('バーチャルな存在からのユニークな返答。'),
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
  prompt: `あなたは、{{{personalityTraits}}}という性格のバーチャルな存在です。あなたの性格を反映したユニークな返答を、次のユーザー入力に対して生成してください:\n\nユーザー入力: {{{userInput}}}`,
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
