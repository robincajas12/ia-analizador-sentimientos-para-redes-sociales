'use server';

import type { AnalysisResult, Post, Comment } from '@/app/types';
import { samplePost } from '@/lib/sample-data';
import { analyze as analyzeWithAi } from '@/ai/flows/sentiment-flow';

export async function getPostFromUrl(
  url: string
): Promise<{ post: Post; comments: Comment[] } | { error: string }> {
  if (!url || !url.trim() || !url.startsWith('http')) {
    return { error: 'Please enter a valid URL.' };
  }
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // In a real app, you would fetch and parse the URL here.
  // For now, we'll return the sample post regardless of the URL.
  return { post: samplePost.post, comments: samplePost.comments };
}

export async function analyzeSentiment(
  prevState: any,
  formData: FormData
): Promise<AnalysisResult | { error: string }> {
  const text = formData.get('text') as string;

  if (!text || !text.trim()) {
    return { error: 'Text input cannot be empty.' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({
        error: `API request failed with status: ${response.status}`,
      }));
      throw new Error(errorBody.error || `API request failed`);
    }

    const result: AnalysisResult = await response.json();
    return result;
  } catch (e: any) {
    console.error(e);
    const errorMessage = e.message?.includes('fetch')
      ? 'Analysis failed. Could not connect to the model API. Are the Docker services running correctly? (docker-compose up)'
      : `An error occurred: ${e.message}`;
    return { error: errorMessage };
  }
}
