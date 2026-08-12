import hashlib
import os
import re
import io
import math
from PIL import Image

# A list of common English stop words to filter out before running text similarity calculations
STOP_WORDS = {
    'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'aren', 't', 'as', 'at',
    'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'can', 'cannot', 'could',
    'couldn', 'did', 'didn', 'do', 'does', 'doesn', 'doing', 'don', 't', 'down', 'during', 'each', 'few', 'for', 'from',
    'further', 'had', 'hadn', 'has', 'hasn', 'have', 'haven', 'having', 'he', 'd', 'll', 'm', 're', 've', 's', 'her',
    'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'if', 'in', 'into', 'is', 'isn', 'it', 'its', 'itself',
    'me', 'more', 'most', 'mustn', 'my', 'myself', 'no', 'nor', 'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other',
    'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'shan', 'she', 'should', 'shouldn', 'so', 'some', 'such',
    'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those',
    'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasn', 'we', 'were', 'weren', 'what', 'when',
    'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'won', 'would', 'wouldn', 'you', 'your', 'yours',
    'yourself', 'yourselves'
}

def calculate_sha256(file_content: bytes) -> str:
    """Calculates the SHA-256 hash of a file's binary content."""
    hasher = hashlib.sha256()
    chunk_size = 65536
    for i in range(0, len(file_content), chunk_size):
        hasher.update(file_content[i:i + chunk_size])
    return hasher.hexdigest()

def get_file_category(filename: str, mime_type: str) -> str:
    """Categorizes the file based on its extension and MIME type."""
    ext = os.path.splitext(filename)[1].lower()
    
    text_extensions = {'.txt', '.md', '.csv', '.json', '.html', '.css', '.js', '.py', '.xml', '.yaml', '.yml'}
    image_extensions = {'.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp', '.tiff'}
    
    if mime_type.startswith('text/') or ext in text_extensions:
        return 'text'
    elif mime_type.startswith('image/') or ext in image_extensions:
        return 'image'
    else:
        return 'other'

# --- NLP Text Similarity (TF-IDF & Cosine Similarity) ---

def tokenize_text(text: str) -> list[str]:
    """Tokenizes raw text: lowercases, extracts alphabetic tokens, and removes stop words."""
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    return [word for word in words if word not in STOP_WORDS and len(word) > 1]

def calculate_text_similarity(query_text: str, existing_files_data: list[tuple[dict, str]]) -> list[tuple[dict, float]]:
    """
    Computes TF-IDF Cosine Similarity between a query document and a list of existing documents.
    """
    if not existing_files_data:
        return []
        
    query_tokens = tokenize_text(query_text)
    if not query_tokens:
        return []
        
    all_documents_tokens = [query_tokens]
    valid_existing_files = []
    
    for meta, content in existing_files_data:
        tokens = tokenize_text(content)
        if tokens:
            all_documents_tokens.append(tokens)
            valid_existing_files.append((meta, tokens))
            
    if not valid_existing_files:
        return []
        
    vocabulary = set()
    for doc_tokens in all_documents_tokens:
        vocabulary.update(doc_tokens)
        
    if not vocabulary:
        return []
        
    vocab_list = sorted(list(vocabulary))
    
    df_counts = {term: 0 for term in vocab_list}
    for doc_tokens in all_documents_tokens:
        doc_unique_terms = set(doc_tokens)
        for term in doc_unique_terms:
            df_counts[term] += 1
            
    num_docs = len(all_documents_tokens)
    idf = {}
    for term in vocab_list:
        idf[term] = math.log(1 + (num_docs / (1 + df_counts[term]))) + 1
        
    def compute_tfidf_vector(doc_tokens: list[str]) -> dict[str, float]:
        vector = {}
        doc_len = len(doc_tokens)
        if doc_len == 0:
            return vector
            
        term_counts = {}
        for token in doc_tokens:
            term_counts[token] = term_counts.get(token, 0) + 1
            
        for term, count in term_counts.items():
            tf = count / doc_len
            vector[term] = tf * idf[term]
            
        return vector

    query_tfidf = compute_tfidf_vector(query_tokens)
    
    results = []
    for meta, tokens in valid_existing_files:
        doc_tfidf = compute_tfidf_vector(tokens)
        dot_product = sum(query_tfidf[term] * doc_tfidf.get(term, 0.0) for term in query_tfidf)
        norm_query = math.sqrt(sum(val ** 2 for val in query_tfidf.values()))
        norm_doc = math.sqrt(sum(val ** 2 for val in doc_tfidf.values()))
        
        similarity = 0.0
        if norm_query > 0 and norm_doc > 0:
            similarity = dot_product / (norm_query * norm_doc)
            
        results.append((meta, similarity))
        
    results.sort(key=lambda x: x[1], reverse=True)
    return results

# --- Perceptual Image Hashing (Average Hash - aHash) ---

def calculate_image_ahash(image_bytes: bytes) -> str:
    """
    Computes an Average Hash (aHash) for an image.
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        img = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
        pixels = list(img.tobytes())
        avg = sum(pixels) / len(pixels)
        hash_bits = ["1" if pixel >= avg else "0" for pixel in pixels]
        return "".join(hash_bits)
    except Exception as e:
        print(f"Error calculating image perceptual hash: {e}")
        return ""

def calculate_hamming_distance(hash1: str, hash2: str) -> int:
    """Calculates the Hamming Distance (number of differing bits) between two binary hashes."""
    if not hash1 or not hash2 or len(hash1) != len(hash2):
        return 64
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

def calculate_image_similarity(hash1: str, hash2: str) -> float:
    """Computes similarity percentage between two image hashes based on Hamming Distance."""
    distance = calculate_hamming_distance(hash1, hash2)
    return 1.0 - (distance / 64.0)
