
'use client';

import { useState, useTransition, useMemo } from 'react';
import type { AnalysisResult, Post, Comment } from '@/app/types';
import { AnalysisForm } from './analysis-form';
import { ResultsDisplay } from './results-display';
import { getPostFromUrl } from '@/app/actions';
import { PostDisplay } from './post-display';
import { Card, CardContent } from '@/components/ui/card';
import { Bot } from 'lucide-react';

export function MainContent() {
  const [result, setResult] = useState<AnalysisResult | { error: string } | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [isPending, startTransition] = useTransition();
  const [fetchError, setFetchError] = useState<string | null>(null);

  const handleUrlSubmit = (url: string) => {
    setFetchError(null);
    setResult(null);
    setPost(null);
    setComments([]);
    startTransition(async () => {
      const postData = await getPostFromUrl(url);
      if ('error' in postData) {
        setFetchError(postData.error);
        setPost(null);
        setComments([]);
      } else {
        setPost(postData.post);
        setComments(postData.comments);
      }
    });
  };

  const analysisResult = result && 'sentiment' in result ? result : null;

  const textToAnalyze = useMemo(() => {
    if (!post) return '';
    const commentsText = comments.map(c => c.content).join('\n\n');
    return `${post.content}\n\n${commentsText}`;
  }, [post, comments]);


  return (
    <main className="flex-1 overflow-auto p-4 md:p-6">
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2 h-full">
        <div className="flex flex-col gap-6">
            <AnalysisForm
              onAnalysisComplete={setResult}
              onUrlSubmit={handleUrlSubmit}
              isFetchingPost={isPending}
              fetchError={fetchError}
              initialText={textToAnalyze}
            />
        </div>
        <div className="flex flex-col gap-6">
          {post ? (
            <PostDisplay post={post} comments={comments} />
          ) : (
            <Card className="flex flex-col items-center justify-center min-h-[400px] border-dashed">
                <CardContent className="flex flex-col items-center justify-center text-center p-6">
                <div className="p-4 bg-muted rounded-full mb-4">
                    <Bot className="w-12 h-12 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold text-muted-foreground">Post Preview</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                    Fetch a post to see its content and comments here.
                </p>
                </CardContent>
            </Card>
          )}
          <ResultsDisplay result={analysisResult} />
        </div>
      </div>
    </main>
  );
}
