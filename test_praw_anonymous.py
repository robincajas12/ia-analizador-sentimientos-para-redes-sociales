#!/usr/bin/env python3
"""
Test PRAW Anonymous Mode - Verificar que funciona antes de integrar
"""

import sys

print("🧪 Probando PRAW en modo anonymous...")
print("=" * 60)

try:
    import praw
    print("✅ PRAW importado correctamente")
except ImportError:
    print("❌ PRAW no está instalado. Instalando...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", "praw"])
    import praw
    print("✅ PRAW instalado")

try:
    print("\n📡 Conectando a Reddit en modo anonymous...")
    reddit = praw.Reddit(
        client_id="DO_NOT_EDIT_ME",
        client_secret=None,
        user_agent="TestApp/1.0"
    )
    print("✅ Conectado a Reddit")
    
    # Test 1: Obtener posts de un subreddit
    print("\n📋 Test 1: Obteniendo 3 posts de r/python...")
    subreddit = reddit.subreddit("python")
    posts = []
    
    for i, post in enumerate(subreddit.hot(limit=3)):
        posts.append(post)
        print(f"\n  Post {i+1}:")
        print(f"    Título: {post.title[:60]}...")
        print(f"    Autor: {post.author}")
        print(f"    Score: {post.score}")
        print(f"    Comentarios: {post.num_comments}")
    
    if len(posts) >= 3:
        print("\n✅ Test 1 EXITOSO - Se obtuvieron posts correctamente")
    else:
        print("\n❌ Test 1 FALLÓ - No se obtuvieron suficientes posts")
        sys.exit(1)
    
    # Test 2: Obtener comentarios de un post
    print("\n" + "=" * 60)
    print("💬 Test 2: Obteniendo comentarios del primer post...")
    post = posts[0]
    post.comments.replace_more(limit=0)
    
    comments = []
    for i, comment in enumerate(post.comments[:5]):
        if comment.author:  # Evitar comentarios deletados
            comments.append(comment)
            print(f"\n  Comentario {i+1}:")
            print(f"    Autor: {comment.author}")
            print(f"    Texto: {comment.body[:60]}...")
    
    if len(comments) > 0:
        print(f"\n✅ Test 2 EXITOSO - Se obtuvieron {len(comments)} comentarios")
    else:
        print("\n⚠️  Test 2: No hay comentarios (normal en algunos posts)")
    
    # Test 3: Obtener un post específico por URL
    print("\n" + "=" * 60)
    print("📄 Test 3: Obteniendo un post por su URL...")
    
    # Usar el primer post que obtuvimos
    post_url = f"https://reddit.com{posts[0].permalink}"
    print(f"  URL: {post_url}")
    
    submission = reddit.submission(url=post_url)
    print(f"\n  ✅ Post obtenido:")
    print(f"    Título: {submission.title[:60]}...")
    print(f"    Score: {submission.score}")
    print(f"    Selftext: {submission.selftext[:80]}...")
    
    print("\n✅ Test 3 EXITOSO")
    
    # Resumen
    print("\n" + "=" * 60)
    print("🎉 TODOS LOS TESTS PASARON")
    print("✅ PRAW Anonymous funciona correctamente")
    print("=" * 60)
    print("\nCon esto podemos:")
    print("  ✓ Obtener posts de cualquier subreddit")
    print("  ✓ Obtener comentarios de posts")
    print("  ✓ Obtener posts por URL directa")
    print("  ✓ Todo sin necesitar credenciales complejas")
    print("\n🚀 Está listo para integrar al proyecto")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
