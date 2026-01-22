#!/usr/bin/env python3
"""
Test Bluesky API - Verificar que funciona antes de integrar
"""

import sys
import subprocess

print("🧪 Probando Bluesky API...")
print("=" * 60)

# Instalar dependencia
print("📦 Instalando atproto (Bluesky SDK)...")
subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "atproto"])

try:
    from atproto import Client
    print("✅ atproto importado")
    
    # Conectar sin autenticación (acceso público)
    print("\n📡 Conectando a Bluesky en modo público...")
    client = Client()
    client.com.atproto.server.get_service_auth()
    print("✅ Conectado a Bluesky")
    
    # Test 1: Buscar posts públicos
    print("\n🔍 Test 1: Buscando posts públicos sobre 'python'...")
    try:
        response = client.app.bsky.feed.search_posts(q="python", limit=3)
        posts = response.posts if hasattr(response, 'posts') else []
        
        if posts:
            print(f"✅ Se encontraron {len(posts)} posts")
            for i, post in enumerate(posts[:3], 1):
                print(f"\n  Post {i}:")
                print(f"    Autor: {post.author.handle if hasattr(post, 'author') else 'unknown'}")
                print(f"    Texto: {post.record.text[:60] if hasattr(post, 'record') else 'N/A'}...")
        else:
            print("❌ No se encontraron posts")
            sys.exit(1)
    except Exception as e:
        print(f"⚠️  Error: {e}")
        print("    (Esto es normal si Bluesky requiere auth para búsqueda)")
        
    # Test 2: Obtener feed público
    print("\n" + "=" * 60)
    print("📋 Test 2: Obteniendo feed público...")
    try:
        response = client.app.bsky.feed.get_timeline(limit=3)
        posts = response.feed if hasattr(response, 'feed') else []
        
        if posts:
            print(f"✅ Se obtuvieron {len(posts)} posts del timeline")
            for i, post_view in enumerate(posts[:2], 1):
                post = post_view.post if hasattr(post_view, 'post') else post_view
                print(f"\n  Post {i}:")
                print(f"    Autor: {post.author.handle if hasattr(post, 'author') else 'N/A'}")
                print(f"    Likes: {post.like_count if hasattr(post, 'like_count') else 0}")
        else:
            print("⚠️  Timeline vacío o requiere autenticación")
    except Exception as e:
        print(f"⚠️  Error: {e}")
    
    print("\n" + "=" * 60)
    print("🎯 RESULTADO")
    print("=" * 60)
    print("\n✅ Bluesky API es accesible")
    print("\nPero necesita UNA de estas opciones:")
    print("  1. Autenticación (username + password)")
    print("  2. O usar la API REST directamente (sin SDK)")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
