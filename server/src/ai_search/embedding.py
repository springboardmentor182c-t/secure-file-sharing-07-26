from sentence_transformers import SentenceTransformer

from .config import MODEL_NAME


class EmbeddingModel:

    _model = None

    @classmethod
    def get_model(cls):

        if cls._model is None:
            print("Loading embedding model...")

            cls._model = SentenceTransformer(
                MODEL_NAME,
                device="cpu",
                model_kwargs={
                    "torch_dtype": "float32",
                    "low_cpu_mem_usage": False,
                },
            )

            print("Embedding model loaded successfully.")

        return cls._model

    @classmethod
    def create_embedding(cls, text: str):

        model = cls.get_model()

        return model.encode(
            text,
            convert_to_numpy=True,
            normalize_embeddings=True,
        ).tolist()