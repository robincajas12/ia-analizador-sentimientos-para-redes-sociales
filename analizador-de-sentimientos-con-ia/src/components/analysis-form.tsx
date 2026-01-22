
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
import { Textarea } from '@/components/ui/textarea';
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
  onUrlSubmit: (url: string) => void;
  isFetchingPost: boolean;
  fetchError: string | null;
  initialText: string;
}) {
  const [analysisState, setAnalysisState] = useState<AnalysisResult | { error: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [query, setQuery] = useState('');
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
    onUrlSubmit(query);
  };

  const textToAnalyze = initialText;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Search & Analyze</CardTitle>
        <CardDescription>
          Enter a topic to search Bluesky and analyze sentiment of posts.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleUrlSubmit} className="flex items-start gap-2">
          <Input
            name="query"
            placeholder="e.g., python, AI, technology..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            className="flex-grow"
          />
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
              <p>Fetch a post to see the content that will be analyzed.</p>
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
