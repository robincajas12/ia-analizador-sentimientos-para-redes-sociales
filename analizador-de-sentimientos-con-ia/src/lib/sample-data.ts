
import type { Post, Comment } from '@/app/types';

export const samplePost: { post: Post; comments: Comment[] } = {
  post: {
    id: '1',
    author: {
      name: 'Devin',
      avatarUrl: 'https://picsum.photos/seed/devin/48/48',
      handle: 'devin',
    },
    content:
      "Just launched our new Next.js starter kit on Product Hunt! It's packed with features like ShadCN UI, Tailwind, and Genkit for AI integration. We've poured our hearts into this to make it the best starting point for any modern web app. Would love to hear your feedback!",
    timestamp: '2h ago',
    stats: {
      likes: 1200,
      comments: 256,
      shares: 312,
    },
  },
  comments: [
    {
      id: 'c1',
      author: {
        name: 'Alex',
        avatarUrl: 'https://picsum.photos/seed/alex/48/48',
        handle: 'alex',
      },
      content: 'This looks amazing! Congrats on the launch! 🚀 Will definitely check it out this weekend.',
      timestamp: '1h ago',
    },
    {
      id: 'c2',
      author: {
        name: 'Sarah',
        avatarUrl: 'https://picsum.photos/seed/sarah/48/48',
        handle: 'sarah_dev',
      },
      content: 'I was looking for something exactly like this. The Genkit integration is a game-changer. Great work!',
      timestamp: '55m ago',
    },
    {
        id: 'c3',
        author: {
            name: 'Mike',
            avatarUrl: 'https://picsum.photos/seed/mike/48/48',
            handle: 'mike_codes',
        },
        content: "Hmm, the setup seems a bit complicated. I ran into some issues with the environment variables. The documentation could be clearer on that part.",
        timestamp: '45m ago',
    },
    {
      id: 'c4',
      author: {
        name: 'Jane',
        avatarUrl: 'https://picsum.photos/seed/jane/48/48',
        handle: 'jane_ux',
      },
      content: "The UI is so clean! Love the choice of components. It's so easy to build on top of.",
      timestamp: '30m ago',
    },
  ],
};
