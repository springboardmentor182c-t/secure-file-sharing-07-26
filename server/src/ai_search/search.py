from .embedding import EmbeddingModel
from .vector_db import search_embeddings


def semantic_search(
    query: str,
    user_id: str,
    limit: int = 5,
):
    """
    Semantic search restricted to one user.
    """

    query_vector = EmbeddingModel.create_embedding(query)

    return search_embeddings(
        query_vector=query_vector,
        user_id=user_id,
        limit=limit,
    )