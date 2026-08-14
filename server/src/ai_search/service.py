from .parser import extract_text
from .chunker import chunk_text
from .embedding import EmbeddingModel
from .vector_db import store_embedding


class AISearchService:

    @staticmethod
    def index_document(
        file_id: str,
        user_id: str,
        file_path: str,
        file_name: str,
    ):
        print("=" * 60)
        print(f"Indexing File : {file_name}")

        text = extract_text(file_path)

        print(f"Characters Extracted : {len(text)}")

        if not text.strip():
            print("No text found.")
            return

        chunks = chunk_text(text)

        print(f"Chunks Created : {len(chunks)}")

        for i, chunk in enumerate(chunks):

            print(f"Embedding Chunk {i+1}")

            embedding = EmbeddingModel.create_embedding(chunk)

            store_embedding(
                file_id=file_id,
                user_id=user_id,
                file_name=file_name,
                chunk_number=i,
                chunk_text=chunk,
                embedding=embedding,
            )

        print("Document Indexed Successfully")
        print("=" * 60)