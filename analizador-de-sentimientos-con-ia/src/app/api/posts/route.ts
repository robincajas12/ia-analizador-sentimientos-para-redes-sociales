import type { Post, Comment } from '@/app/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get('url');
  const limitParam = searchParams.get('limit');
  const limit = limitParam ? Math.max(0, Number(limitParam) || 0) : undefined;

  if (!url || !url.trim()) {
    return Response.json(
      { error: 'Please provide a valid social post/page URL.' },
      { status: 400 }
    );
  }

  try {
    const isBluesky = /bsky\.app/i.test(url);
    const isFacebook = /facebook\.com/i.test(url);

    if (!isBluesky && !isFacebook) {
      return Response.json(
        { error: 'Only Bluesky and Facebook URLs are supported.' },
        { status: 400 }
      );
    }

    const base = 'https://redsky-api.onrender.com/api/social';
    const endpoint = isBluesky
      ? `${base}/bluesky?url=${encodeURIComponent(url)}${typeof limit === 'number' ? `&limit=${limit}` : ''}`
      : `${base}/facebook?url=${encodeURIComponent(url)}`;

    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({} as any));
      return Response.json(
        { error: body?.error || `Failed to fetch from provider API (${response.status}).` },
        { status: response.status }
      );
    }

    const data: any = await response.json();

    // Attempt to normalize to a SocialPost-like object
    const root: any = (data && (data.post || data.data || data.item || data)) || {};
    // If some APIs return arrays
    const socialPost: any = Array.isArray(root)
      ? root[0]
      : (root.posts && Array.isArray(root.posts) ? root.posts[0] : root);

    if (!socialPost || !socialPost.id) {
      return Response.json(
        { error: 'No post found or invalid response from provider API.' },
        { status: 404 }
      );
    }

    const author = socialPost.author || {};
    const metrics = socialPost.metrics || {};
    const created = socialPost.createdAt || socialPost.created || socialPost.timestamp || Date.now();

    const post: Post = {
      id: String(socialPost.id),
      author: {
        name: author.displayName || author.name || author.handle || 'Unknown',
        handle: author.handle || author.username || 'unknown',
        avatarUrl:
          author.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(author.handle || 'user')}`,
      },
      content: socialPost.text || socialPost.content || '',
      timestamp: new Date(created).toLocaleString(),
      stats: {
        likes: Number(metrics.likes || socialPost.likes || 0),
        comments: Number(metrics.comments || socialPost.comments || 0),
        shares: Number(metrics.reposts || socialPost.reposts || socialPost.shares || 0),
      },
    };

    // Map replies to Comment[] only for Bluesky (Facebook tier has no comments)
    let comments: Comment[] = [];
    if (isBluesky) {
      const replies: any[] = socialPost.replies || [];
      comments = (Array.isArray(replies) ? replies : []).map((r) => {
        const ra = r.author || {};
        const rCreated = r.createdAt || r.created || r.timestamp || Date.now();
        return {
          id: String(r.id ?? `${post.id}-reply-${Math.random().toString(36).slice(2)}`),
          author: {
            name: ra.displayName || ra.name || ra.handle || 'Unknown',
            handle: ra.handle || ra.username || 'unknown',
            avatarUrl:
              ra.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(ra.handle || 'user')}`,
          },
          content: r.text || r.content || '',
          timestamp: new Date(rCreated).toLocaleString(),
        } satisfies Comment;
      });
    }

    return Response.json({ post, comments });
  } catch (error: any) {
    console.error('Error fetching social post:', error);
    return Response.json(
      { error: `Could not fetch posts: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
