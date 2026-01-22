
'use client';
import { useFormStatus } from 'react-dom';
import { analyzeSentiment } from '@/app/actions';
import type { AnalysisResult } from '@/app/types';
import { useActionState, useEffect, useRef, useState } from 'react';
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

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full sm:w-auto">
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Analyze
    </Button>
  );
}

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
  const [analysisState, analysisAction] = useActionState(analyzeSentiment, null);
  const [url, setUrl] = useState('https://example.com/post/123');
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    onAnalysisComplete(analysisState);
  }, [analysisState, onAnalysisComplete]);

  const handleUrlSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUrlSubmit(url);
  };

  const textToAnalyze = initialText;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle>Analyze Post</CardTitle>
        <CardDescription>
          Enter a URL to a social media post to fetch and analyze it.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleUrlSubmit} className="flex items-start gap-2">
          <Input
            name="url"
            placeholder="https://..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
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

      <form ref={formRef} action={analysisAction} className="flex flex-col flex-grow">
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <input type="hidden" name="text" value={textToAnalyze} />
          <div className="flex-grow rounded-md border bg-muted/50 p-3 text-sm text-muted-foreground min-h-[150px] overflow-auto">
            <p className="font-semibold text-foreground mb-2">Text to be analyzed:</p>
            {textToAnalyze ? (
              <pre className="whitespace-pre-wrap font-sans">{textToAnalyze}</pre>
            ) : (
              <p>Fetch a post to see the content that will be analyzed.</p>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex-col sm:flex-row items-start sm:items-center gap-4">
          <SubmitButton />
          {analysisState?.error && <p className="text-sm text-destructive">{analysisState.error}</p>}
        </CardFooter>
      </form>
    </Card>
  );
}
