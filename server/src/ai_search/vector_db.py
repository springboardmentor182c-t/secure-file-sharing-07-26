from uuid import uuid4

from qdrant_client import QdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchValue,
)

from .config import (
    COLLECTION_NAME,
    QDRANT_HOST,
    QDRANT_PORT,
)

client = QdrantClient(
    host=QDRANT_HOST,
    port=QDRANT_PORT,
    check_compatibility=False,
)


def create_collection():
    collections = client.get_collections().collections
    names = [collection.name for collection in collections]

    if COLLECTION_NAME not in names:
        client.create_collection(
            collection_name=COLLECTION_NAME,
            vectors_config=VectorParams(
                size=384,
                distance=Distance.COSINE,
            ),
        )
        print(f"Collection '{COLLECTION_NAME}' created.")
    else:
        print(f"Collection '{COLLECTION_NAME}' already exists.")


def store_embedding(
    file_id: str,
    file_name: str,
    user_id: str,
    chunk_number: int,
    chunk_text: str,
    embedding: list[float],
):
    """
    Store one document chunk embedding in Qdrant.
    """

    client.upsert(
        collection_name=COLLECTION_NAME,
        points=[
            PointStruct(
                id=str(uuid4()),
                vector=embedding,
                payload={
                    "file_id": file_id,
                    "user_id": user_id,
                    "file_name": file_name,
                    "chunk_number": chunk_number,
                    "text": chunk_text,
                },
            )
        ],
    )


def search_embeddings(
    query_vector: list[float],
    user_id: str,
    limit: int = 5,
):
    """
    Search only within the current user's indexed documents.
    Results are returned only when the cosine similarity
    is at least 0.30.
    """

    results = client.search(
        collection_name=COLLECTION_NAME,
        query_vector=query_vector,
        query_filter=Filter(
            must=[
                FieldCondition(
                    key="user_id",
                    match=MatchValue(value=user_id),
                )
            ]
        ),
        limit=limit,
        score_threshold=0.30,
    )

    for result in results:
        print(
            f"File: {result.payload.get('file_name')} | "
            f"Score: {result.score}"
        )

    return results


def delete_file_embeddings(file_id: str):
    """
    Delete all embeddings belonging to one file.
    """

    client.delete(
        collection_name=COLLECTION_NAME,
        points_selector=Filter(
            must=[
                FieldCondition(
                    key="file_id",
                    match=MatchValue(value=file_id),
                )
            ]
        ),
    )


def delete_all_embeddings():
    """
    Delete the entire collection and recreate it.
    """

    client.delete_collection(COLLECTION_NAME)
    create_collection()