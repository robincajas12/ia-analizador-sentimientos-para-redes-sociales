import { z } from 'zod';

export type Sentiment = 'Positive' | 'Negative' | 'Neutral';

const sentimentEnum: [Sentiment, ...Sentiment[]] = ['Positive', 'Negative', 'Neutral'];
const SentimentSchema = z.enum(sentimentEnum);

export const SentimentInputSchema = z.object({
  text: z.string().describe('The text to analyze.'),
});
export type SentimentInput = z.infer<typeof SentimentInputSchema>;

export const SentimentOutputSchema = z.object({
  sentiment: SentimentSchema.describe('The overall sentiment of the text.'),
  confidence: z
    .number()
    .min(0)
    .max(1)
    .describe('The confidence score for the overall sentiment, from 0 to 1.'),
  probabilities: z
    .array(
      z.object({
        name: SentimentSchema,
        value: z.number().min(0).max(1),
      })
    )
    .length(3)
    .describe(
      'An array of probabilities for each sentiment type (Positive, Negative, Neutral).'
    ),
});
export type SentimentOutput = z.infer<typeof SentimentOutputSchema>;
