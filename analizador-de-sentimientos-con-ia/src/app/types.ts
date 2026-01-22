import type { Sentiment, SentimentOutput } from '@/ai/schema';

export type { Sentiment };

export type AnalysisResult = SentimentOutput;

export type User = {
  name: string;
  avatarUrl: string;
  handle: string;
};

export type Post = {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
};

export type Comment = {
  id: string;
  author: User;
  content: string;
  timestamp: string;
};
