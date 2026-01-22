
'use client';

import type { Post, Comment } from '@/app/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Heart, MessageCircle, Share2 } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

export function PostDisplay({ post, comments }: { post: Post; comments: Comment[] }) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar>
          <AvatarImage src={post.author.avatarUrl} alt={`@${post.author.handle}`} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-grow">
          <p className="font-semibold">{post.author.name}</p>
          <p className="text-sm text-muted-foreground">@{post.author.handle}</p>
        </div>
        <p className="text-sm text-muted-foreground">{post.timestamp}</p>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <p className="text-foreground/90 whitespace-pre-wrap">{post.content}</p>
        <Separator />
        <div className="flex items-center justify-around text-muted-foreground">
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(post.stats.likes)}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(post.stats.comments)}</span>
            </Button>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                <span>{Intl.NumberFormat('en-US', { notation: 'compact' }).format(post.stats.shares)}</span>
            </Button>
        </div>
      </CardContent>
      <Separator />
      <ScrollArea className="flex-grow h-[200px]">
        <div className="p-6 pt-4 space-y-6">
        <h4 className="text-sm font-medium text-muted-foreground">Comments</h4>
        {comments.map((comment) => (
          <div key={comment.id} className="flex items-start gap-4">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.author.avatarUrl} alt={`@${comment.author.handle}`} />
              <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-grow">
              <div className="flex items-baseline gap-2">
                <p className="font-semibold text-sm">{comment.author.name}</p>
                <p className="text-xs text-muted-foreground">@{comment.author.handle}</p>
                <p className="text-xs text-muted-foreground">· {comment.timestamp}</p>
              </div>
              <p className="text-sm text-foreground/80 mt-1">{comment.content}</p>
            </div>
          </div>
        ))}
        </div>
      </ScrollArea>
    </Card>
  );
}
