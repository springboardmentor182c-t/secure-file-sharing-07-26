"""
AI Smart Folder Recommendation module (v2 - embeddings + Gemini reasoning).

Fully self-contained package - does not modify any existing module's
behavior. It reuses the existing `users` / `folders` / `files` tables
(read-only) and the existing encrypted storage backend (read-only, to
sample a bounded number of recent files per folder for richer folder
representations). It plugs into the upload flow as an optional,
non-blocking pre-step:

    POST /api/ai/recommend-folder   (this module)
    POST /files                     (existing upload endpoint, untouched)

Recommendation pipeline
------------------------
1. Extract file metadata + text content (PDF/DOCX/TXT/Markdown).
2. Generate a lightweight extractive summary + keywords.
3. Embed the document with a pretrained sentence-transformers model
   (all-MiniLM-L6-v2 by default).
4. Build a dynamic representation of every one of the user's folders
   (name, representative filenames, recent uploads, common keywords,
   recent document summaries) and embed each one.
5. Rank folders by cosine similarity; take the Top 3.
6. Ask Gemini to reason over the Top 3 (+ full folder list + history) and
   return strict JSON.
7. Reconcile: if Gemini agrees with the embedding Top 3, use it as-is; if
   it picks something outside the Top 3 (but still an existing folder),
   the embedding ranking adjusts the final pick; if Gemini's output is
   invalid/unreachable, the embedding engine's own Top-1 becomes the
   recommendation automatically.
8. If embeddings themselves are unavailable (dependency missing / no
   folders yet), fall back to a deterministic rule-based recommender.

The user is NEVER blocked or shown an error because of Gemini or the
embedding engine - something usable is always returned.
"""
