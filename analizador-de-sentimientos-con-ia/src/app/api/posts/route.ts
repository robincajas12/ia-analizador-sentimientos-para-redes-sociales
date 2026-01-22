import type { Post, Comment } from '@/app/types';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query || !query.trim()) {
    return Response.json(
      { error: 'Please enter a search query or topic.' },
      { status: 400 }
    );
  }

  try {
    console.log(`Buscando posts en Bluesky sobre: "${query}"`);
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/bluesky/search?q=${encodeURIComponent(query)}&limit=1`,
      {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      }
    );

    if (!response.ok) {
      const body = await response.json().catch(() => ({} as any));
      return Response.json(
        { error: body?.error || `Failed to fetch posts about "${query}"` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const blueskyPost = data.posts?.[0];

    if (!blueskyPost) {
      return Response.json(
        { error: `No posts found about "${query}"` },
        { status: 404 }
      );
    }

    // Transformar post de Bluesky al formato de la app
    const post: Post = {
      id: blueskyPost.id,
      author: {
        name: blueskyPost.author,
        handle: blueskyPost.author,
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${blueskyPost.author}`,
      },
      content: blueskyPost.text,
      timestamp: new Date(blueskyPost.created).toLocaleString(),
      stats: {
        likes: blueskyPost.likes || 0,
        comments: blueskyPost.replies || 0,
        shares: blueskyPost.reposts || 0,
      },
    };

    return Response.json({
      post,
      comments: [] as Comment[],
    });
  } catch (error: any) {
    console.error('Error fetching Bluesky post:', error);
    return Response.json(
      { error: `Could not fetch posts: ${error?.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}
