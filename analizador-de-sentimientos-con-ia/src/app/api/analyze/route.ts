import type { AnalysisResult } from '@/app/types';

export async function POST(request: Request) {
  const { text } = await request.json();

  if (!text || !text.trim()) {
    return Response.json(
      { error: 'Text input cannot be empty.' },
      { status: 400 }
    );
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
    return Response.json(result);
  } catch (e: any) {
    console.error(e);
    const errorMessage = e.message?.includes('fetch')
      ? 'Analysis failed. Could not connect to the model API. Are the Docker services running correctly?'
      : `An error occurred: ${e.message}`;
    return Response.json({ error: errorMessage }, { status: 500 });
  }
}
