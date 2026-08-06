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
    # Read in chunks of 64KB to support large files without consuming massive memory
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
    # Remove non-alphanumeric characters, lowercase everything, and split on spaces/punctuation
    words = re.findall(r'\b[a-zA-Z]+\b', text.lower())
    # Filter out stop words and single-character words (unless they are important, but usually not)
    return [word for word in words if word not in STOP_WORDS and len(word) > 1]

def calculate_text_similarity(query_text: str, existing_files_data: list[tuple[dict, str]]) -> list[tuple[dict, float]]:
    """
    Computes TF-IDF Cosine Similarity between a query document and a list of existing documents.
    
    Args:
        query_text: The string content of the uploaded query file.
        existing_files_data: A list of tuples containing (file_metadata_dict, file_content_str)
        
    Returns:
        A list of tuples (file_metadata_dict, similarity_score) sorted by score descending.
    """
    if not existing_files_data:
        return []
        
    # Tokenize query text
    query_tokens = tokenize_text(query_text)
    if not query_tokens:
        return []
        
    # Tokenize all existing text documents
    all_documents_tokens = [query_tokens]
    valid_existing_files = []
    
    for meta, content in existing_files_data:
        tokens = tokenize_text(content)
        if tokens:  # Only count documents with actual content
            all_documents_tokens.append(tokens)
            valid_existing_files.append((meta, tokens))
            
    if not valid_existing_files:
        return []
        
    # 1. Build Global Vocabulary
    vocabulary = set()
    for doc_tokens in all_documents_tokens:
        vocabulary.update(doc_tokens)
        
    if not vocabulary:
        return []
        
    # Convert vocabulary to a sorted list for indexing consistency
    vocab_list = sorted(list(vocabulary))
    
    # 2. Compute Document Frequencies (DF) for each term in the vocabulary
    # DF(t) = number of documents in the corpus that contain term t
    df_counts = {term: 0 for term in vocab_list}
    for doc_tokens in all_documents_tokens:
        doc_unique_terms = set(doc_tokens)
        for term in doc_unique_terms:
            df_counts[term] += 1
            
    # 3. Compute Inverse Document Frequencies (IDF)
    # IDF(t) = ln(1 + (N / (1 + DF(t)))) + 1 (smoothed to prevent division by zero and ensure positive scores)
    num_docs = len(all_documents_tokens)
    idf = {}
    for term in vocab_list:
        idf[term] = math.log(1 + (num_docs / (1 + df_counts[term]))) + 1
        
    # 4. Compute TF-IDF Vectors
    # We represent vectors as dictionaries of term -> tf_idf_score to save memory (sparse representation)
    def compute_tfidf_vector(doc_tokens: list[str]) -> dict[str, float]:
        vector = {}
        doc_len = len(doc_tokens)
        if doc_len == 0:
            return vector
            
        # Term Counts
        term_counts = {}
        for token in doc_tokens:
            term_counts[token] = term_counts.get(token, 0) + 1
            
        # Compute Term Frequency (TF) and multiply by IDF
        for term, count in term_counts.items():
            tf = count / doc_len
            vector[term] = tf * idf[term]
            
        return vector

    # Compute TF-IDF for query
    query_tfidf = compute_tfidf_vector(query_tokens)
    
    # Compute Cosine Similarity for each existing file
    results = []
    for meta, tokens in valid_existing_files:
        doc_tfidf = compute_tfidf_vector(tokens)
        
        # Calculate dot product
        dot_product = sum(query_tfidf[term] * doc_tfidf.get(term, 0.0) for term in query_tfidf)
        
        # Calculate vector norms
        norm_query = math.sqrt(sum(val ** 2 for val in query_tfidf.values()))
        norm_doc = math.sqrt(sum(val ** 2 for val in doc_tfidf.values()))
        
        similarity = 0.0
        if norm_query > 0 and norm_doc > 0:
            similarity = dot_product / (norm_query * norm_doc)
            
        results.append((meta, similarity))
        
    # Sort by similarity score descending
    results.sort(key=lambda x: x[1], reverse=True)
    return results

# --- Perceptual Image Hashing (Average Hash - aHash) ---

def calculate_image_ahash(image_bytes: bytes) -> str:
    """
    Computes an Average Hash (aHash) for an image.
    Resizes image to 8x8, converts to grayscale, computes average luminance,
    and returns a 64-character binary string ('0's and '1's).
    """
    try:
        img = Image.open(io.BytesIO(image_bytes))
        # 1. Convert to grayscale and resize to 8x8 using high-quality downsampling
        img = img.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
        
        # 2. Get list of 64 pixel values (0-255)
        pixels = list(img.tobytes())
        
        # 3. Calculate average pixel value
        avg = sum(pixels) / len(pixels)
        
        # 4. Generate 64-bit binary representation: 1 if pixel >= avg, else 0
        hash_bits = ["1" if pixel >= avg else "0" for pixel in pixels]
        return "".join(hash_bits)
    except Exception as e:
        print(f"Error calculating image perceptual hash: {e}")
        return ""

def calculate_hamming_distance(hash1: str, hash2: str) -> int:
    """Calculates the Hamming Distance (number of differing bits) between two binary hashes."""
    if not hash1 or not hash2 or len(hash1) != len(hash2):
        return 64  # Max difference for a 64-bit hash
    return sum(c1 != c2 for c1, c2 in zip(hash1, hash2))

def calculate_image_similarity(hash1: str, hash2: str) -> float:
    """Computes similarity percentage between two image hashes based on Hamming Distance."""
    distance = calculate_hamming_distance(hash1, hash2)
    # 0 distance means 100% similarity, 64 distance means 0% similarity
    return 1.0 - (distance / 64.0)
