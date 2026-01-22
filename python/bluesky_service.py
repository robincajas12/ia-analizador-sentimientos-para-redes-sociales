"""
Servicio de Bluesky usando atproto - Conecta con tus credenciales
"""

import os
import sys
from typing import Dict, List, Optional
from datetime import datetime

try:
    from atproto import Client
    ATPROTO_AVAILABLE = True
except ImportError:
    ATPROTO_AVAILABLE = False

class BlueskyService:
    def __init__(self):
        """
        Inicializar Bluesky usando credenciales del .env
        """
        msg = "Iniciando BlueskyService..."
        print(msg, flush=True)
        sys.stdout.flush()
        
        if not ATPROTO_AVAILABLE:
            msg = "⚠️  atproto no está instalado"
            print(msg, flush=True)
            sys.stdout.flush()
            self.client = None
            return
        
        try:
            username = os.getenv('BLUESKY_USERNAME')
            password = os.getenv('BLUESKY_PASSWORD')
            
            msg = f"Usuario env: {username}, Password: {'*' * len(password) if password else 'NO SET'}"
            print(msg, flush=True)
            sys.stdout.flush()
            
            if not username or not password:
                msg = "❌ Error: BLUESKY_USERNAME o BLUESKY_PASSWORD no configurados en .env"
                print(msg, flush=True)
                sys.stdout.flush()
                self.client = None
                return
            
            msg = f"📡 Conectando a Bluesky con usuario: {username}..."
            print(msg, flush=True)
            sys.stdout.flush()
            
            self.client = Client()
            self.client.login(username, password)
            
            msg = "✅ Bluesky: Conectado exitosamente"
            print(msg, flush=True)
            sys.stdout.flush()
            
        except Exception as e:
            msg = f"❌ Error conectando a Bluesky: {e}"
            print(msg, flush=True)
            sys.stdout.flush()
            self.client = None

    def get_feed(self, limit: int = 10) -> List[Dict]:
        """
        Obtener posts del feed (timeline) del usuario conectado.
        """
        if not self.client:
            return []
        
        try:
            print(f"📋 Obteniendo {limit} posts del feed...")
            
            response = self.client.app.bsky.feed.get_timeline(limit=limit)
            posts = []
            
            for feed_item in response.feed:
                post = feed_item.post
                author = post.author
                
                posts.append({
                    'id': post.uri.split('/')[-1],
                    'title': f"Post de {author.handle}",
                    'text': post.record.text,
                    'author': author.handle,
                    'likes': post.like_count or 0,
                    'replies': post.reply_count or 0,
                    'reposts': post.repost_count or 0,
                    'created': post.record.created_at if hasattr(post.record, 'created_at') else datetime.now().isoformat(),
                    'uri': post.uri,
                })
            
            print(f"✅ Se obtuvieron {len(posts)} posts")
            return posts
        
        except Exception as e:
            print(f"❌ Error obteniendo feed: {e}")
            return []

    def search_posts(self, query: str, limit: int = 10) -> List[Dict]:
        """
        Buscar posts en Bluesky.
        """
        if not self.client:
            msg = "❌ No hay cliente de Bluesky disponible"
            print(msg, flush=True)
            sys.stdout.flush()
            return []
        
        try:
            msg = f"🔍 Buscando '{query}' en Bluesky (limit={limit})..."
            print(msg, flush=True)
            sys.stdout.flush()
            
            # Usar feed.search_posts sin crear objetos Params
            response = self.client.app.bsky.feed.search_posts(
                {"q": query, "limit": limit}
            )
            posts = []
            
            if not response or not response.posts:
                msg = f"⚠️ Bluesky no devolvió posts para '{query}'"
                print(msg, flush=True)
                sys.stdout.flush()
                return []
            
            for post in response.posts:
                author = post.author
                posts.append({
                    'id': post.uri.split('/')[-1],
                    'title': f"Post de {author.handle}",
                    'text': post.record.text,
                    'author': author.handle,
                    'likes': post.like_count or 0,
                    'replies': post.reply_count or 0,
                    'reposts': post.repost_count or 0,
                    'created': post.record.created_at if hasattr(post.record, 'created_at') else datetime.now().isoformat(),
                    'uri': post.uri,
                })
            
            msg = f"✅ Se encontraron {len(posts)} posts"
            print(msg, flush=True)
            sys.stdout.flush()
            return posts
        
        except Exception as e:
            msg = f"❌ Error buscando: {str(e)}"
            print(msg, flush=True)
            sys.stdout.flush()
            import traceback
            traceback.print_exc()
            return []

    def get_posts_by_author(self, author: str, limit: int = 10) -> List[Dict]:
        """
        Obtener posts de un autor específico.
        """
        if not self.client:
            return []
        
        try:
            print(f"👤 Obteniendo posts de @{author}...")
            
            response = self.client.app.bsky.feed.get_author_feed(actor=author, limit=limit)
            posts = []
            
            for feed_item in response.feed:
                post = feed_item.post
                author_obj = post.author
                
                posts.append({
                    'id': post.uri.split('/')[-1],
                    'title': f"Post de {author_obj.handle}",
                    'text': post.record.text,
                    'author': author_obj.handle,
                    'likes': post.like_count or 0,
                    'replies': post.reply_count or 0,
                    'reposts': post.repost_count or 0,
                    'created': post.record.created_at if hasattr(post.record, 'created_at') else datetime.now().isoformat(),
                    'uri': post.uri,
                })
            
            print(f"✅ Se obtuvieron {len(posts)} posts de @{author}")
            return posts
        
        except Exception as e:
            print(f"❌ Error obteniendo posts del autor: {e}")
            return []

    def format_post_for_app(self, bluesky_post: Dict) -> Dict:
        """
        Convertir un post de Bluesky al formato de la app.
        """
        return {
            'id': bluesky_post['id'],
            'author': {
                'name': bluesky_post['author'],
                'handle': bluesky_post['author'],
                'avatarUrl': f"https://api.dicebear.com/7.x/avataaars/svg?seed={bluesky_post['author']}",
            },
            'content': bluesky_post['text'],
            'timestamp': bluesky_post['created'],
            'stats': {
                'likes': bluesky_post['likes'],
                'comments': bluesky_post['replies'],
                'shares': bluesky_post['reposts'],
            },
            'platform': 'bluesky',
            'url': bluesky_post['uri'],
        }
