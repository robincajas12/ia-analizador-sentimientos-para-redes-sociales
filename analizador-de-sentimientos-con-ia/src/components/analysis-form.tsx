
'use client';
import type { AnalysisResult } from '@/app/types';
import { useEffect, useRef, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function AnalysisForm({
  onAnalysisComplete,
  onUrlSubmit,
  isFetchingPost,
  fetchError,
  initialText,
}: {
  onAnalysisComplete: (result: AnalysisResult | { error: string } | null) => void;
  onUrlSubmit: (url: string, limit?: number) => void;
  isFetchingPost: boolean;
  fetchError: string | null;
  initialText: string;
}) {
  const [analysisState, setAnalysisState] = useState<AnalysisResult | { error: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [url, setUrl] = useState('');
  const [limit, setLimit] = useState<number | ''>('');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    onAnalysisComplete(analysisState);
  }, [analysisState, onAnalysisComplete]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: initialText }),
      });
      const result = await response.json();
      setAnalysisState(result);
    } catch (error: any) {
      setAnalysisState({ error: error.message || 'Unknown error' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const limitNumber = typeof limit === 'number' ? limit : undefined;
    onUrlSubmit(url, limitNumber);
  };

  const textToAnalyze = initialText;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Fetch & Analyze</CardTitle>
        <CardDescription>
          Paste a Bluesky post URL or Facebook page/post URL, then analyze sentiment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleUrlSubmit} className="flex items-start gap-2">
          <div className="flex-grow space-y-2">
            <Input
              name="url"
              placeholder="https://bsky.app/... or https://www.facebook.com/..."
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full"
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <label htmlFor="limit" className="whitespace-nowrap">Max comments (Bluesky)</label>
              <Input
                id="limit"
                name="limit"
                type="number"
                min={0}
                placeholder="optional"
                value={limit}
                onChange={(e) => setLimit(e.target.value === '' ? '' : Number(e.target.value))}
                className="max-w-[130px]"
              />
            </div>
          </div>
          <Button type="submit" variant="secondary" disabled={isFetchingPost}>
            {isFetchingPost ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Fetch Post'
            )}
          </Button>
        </form>
        {(fetchError) && <p className="text-sm text-destructive">{fetchError}</p>}
      </CardContent>

      <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col flex-grow">
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <div className="flex-grow rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground min-h-[150px] overflow-auto">
            <p className="font-semibold text-foreground mb-2">Text to be analyzed:</p>
            {initialText ? (
              <pre className="whitespace-pre-wrap font-sans">{initialText}</pre>
            ) : (
              <p>Fetch a post to see the content and comments that will be analyzed.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row items-start sm:items-center gap-4">
          <Button type="submit" disabled={isAnalyzing || !initialText} className="w-full sm:w-auto">
            {isAnalyzing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Analyze
          </Button>
          {analysisState?.error && <p className="text-sm text-destructive">{analysisState.error}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}
