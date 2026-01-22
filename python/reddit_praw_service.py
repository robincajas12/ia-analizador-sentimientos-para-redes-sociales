"""
Servicio de Reddit usando PRAW Anonymous Mode - Funciona sin credenciales
"""

import praw
from typing import Dict, List, Optional
from datetime import datetime

class RedditPrawService:
    def __init__(self):
        """
        Inicializar Reddit en modo anonymous.
        No necesita credenciales - usa modo read-only oficial de Reddit.
        """
        try:
            self.reddit = praw.Reddit(
                client_id="DO_NOT_EDIT_ME",
                client_secret=None,
                user_agent="SentimentAnalyzer/1.0"
            )
            print("✅ Reddit PRAW: Conectado en modo anonymous")
        except Exception as e:
            print(f"❌ Error inicializando Reddit: {e}")
            self.reddit = None

    def get_post_from_url(self, post_url: str) -> Optional[Dict]:
        """
        Obtener un post específico de Reddit por URL.
        
        Ejemplo: https://www.reddit.com/r/python/comments/abc123/titulo/
        """
        if not self.reddit:
            return None
        
        try:
            print(f"📄 Obteniendo post de: {post_url[:80]}...")
            
            # PRAW parsea la URL automáticamente
            submission = self.reddit.submission(url=post_url)
            
            post = {
                'id': submission.id,
                'author': {
                    'name': submission.author.name if submission.author else '[deleted]',
                    'handle': submission.author.name if submission.author else 'deleted',
                    'avatarUrl': f"https://reddit.com/u/{submission.author.name}/about.json" if submission.author else None,
                },
                'content': submission.title + '\n\n' + submission.selftext,
                'timestamp': datetime.fromtimestamp(submission.created_utc).isoformat(),
                'stats': {
                    'likes': submission.score,
                    'comments': submission.num_comments,
                    'shares': 0,
                },
                'subreddit': submission.subreddit.display_name,
                'url': submission.url,
            }
            
            # Obtener comentarios
            submission.comments.replace_more(limit=0)
            comments = []
            
            for i, comment in enumerate(submission.comments[:10]):
                if i >= 10:
                    break
                if comment.author is None:
                    continue
                
                comments.append({
                    'id': comment.id,
                    'author': {
                        'name': comment.author.name,
                        'handle': comment.author.name,
                        'avatarUrl': f"https://reddit.com/u/{comment.author.name}/about.json",
                    },
                    'content': comment.body,
                    'timestamp': datetime.fromtimestamp(comment.created_utc).isoformat(),
                })
            
            print(f"✅ Post obtenido: {submission.title[:60]}... ({len(comments)} comentarios)")
            return {'post': post, 'comments': comments}
        
        except Exception as e:
            print(f"❌ Error obteniendo post: {e}")
            return None

    def get_subreddit_posts(self, subreddit: str, sort: str = 'hot', limit: int = 10) -> List[Dict]:
        """
        Obtener posts de un subreddit.
        
        Ejemplo: get_subreddit_posts('python', sort='hot', limit=5)
        """
        if not self.reddit:
            return []
        
        try:
            print(f"📋 Obteniendo {sort} posts de r/{subreddit}...")
            
            subreddit_obj = self.reddit.subreddit(subreddit)
            results = []
            
            if sort == 'hot':
                posts = subreddit_obj.hot(limit=limit)
            elif sort == 'new':
                posts = subreddit_obj.new(limit=limit)
            elif sort == 'top':
                posts = subreddit_obj.top(time_filter='day', limit=limit)
            else:
                posts = subreddit_obj.hot(limit=limit)
            
            for submission in posts:
                results.append({
                    'id': submission.id,
                    'title': submission.title,
                    'url': f"https://reddit.com{submission.permalink}",
                    'author': submission.author.name if submission.author else '[deleted]',
                    'subreddit': submission.subreddit.display_name,
                    'score': submission.score,
                    'num_comments': submission.num_comments,
                    'created': datetime.fromtimestamp(submission.created_utc).isoformat(),
                })
            
            print(f"✅ Se obtuvieron {len(results)} posts de r/{subreddit}")
            return results
        
        except Exception as e:
            print(f"❌ Error obteniendo subreddit r/{subreddit}: {e}")
            return []

    def search_posts(self, subreddit: str, query: str, limit: int = 5) -> List[Dict]:
        """
        Buscar posts en un subreddit.
        
        Ejemplo: search_posts('python', 'machine learning', limit=5)
        """
        if not self.reddit:
            return []
        
        try:
            print(f"🔍 Buscando '{query}' en r/{subreddit}...")
            
            subreddit_obj = self.reddit.subreddit(subreddit)
            results = []
            
            for submission in subreddit_obj.search(query, time_filter='week', limit=limit):
                results.append({
                    'id': submission.id,
                    'title': submission.title,
                    'url': f"https://reddit.com{submission.permalink}",
                    'author': submission.author.name if submission.author else '[deleted]',
                    'score': submission.score,
                    'num_comments': submission.num_comments,
                })
            
            print(f"✅ Se encontraron {len(results)} resultados")
            return results
        
        except Exception as e:
            print(f"❌ Error buscando: {e}")
            return []
