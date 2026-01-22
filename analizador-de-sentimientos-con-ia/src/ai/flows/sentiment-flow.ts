'use server';
/**
 * @fileOverview A sentiment analysis AI flow.
 *
 * - analyze - A function that handles the sentiment analysis.
 */

import { ai } from '@/ai/genkit';
import {
  SentimentInputSchema,
  SentimentOutputSchema,
  type SentimentOutput,
} from '@/ai/schema';

const sentimentAnalysisPrompt = ai.definePrompt({
    name: 'sentimentAnalysisPrompt',
    input: { schema: SentimentInputSchema },
    output: { schema: SentimentOutputSchema },
    prompt: `Analyze the sentiment of the following text. The text may be a combination of a social media post and its comments.

Determine if the overall sentiment is Positive, Negative, or Neutral.

Provide a confidence score for your prediction (from 0 to 1). The confidence should be the probability of the predicted sentiment.

Also, provide a breakdown of the probabilities for each sentiment category (Positive, Negative, Neutral). The sum of these probabilities must equal 1.

Respond ONLY with a valid JSON object that matches the specified output schema.

Text to analyze:
'''
{{{text}}}
'''`,
});

const sentimentAnalysisFlow = ai.defineFlow(
  {
    name: 'sentimentAnalysisFlow',
    inputSchema: SentimentInputSchema,
    outputSchema: SentimentOutputSchema,
  },
  async (input) => {
    const { output } = await sentimentAnalysisPrompt(input);
    if (!output) {
      throw new Error('The model did not return a valid response.');
    }
    return output;
  }
);

export async function analyze(text: string): Promise<SentimentOutput> {
    return await sentimentAnalysisFlow({ text });
}
