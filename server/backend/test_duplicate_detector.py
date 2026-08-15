import unittest
import io
from PIL import Image, ImageDraw
try:
    from server.backend.duplicate_detector import (
        calculate_sha256,
        get_file_category,
        tokenize_text,
        calculate_text_similarity,
        calculate_image_ahash,
        calculate_image_similarity
    )
except ImportError:
    from duplicate_detector import (
        calculate_sha256,
        get_file_category,
        tokenize_text,
        calculate_text_similarity,
        calculate_image_ahash,
        calculate_image_similarity
    )

class TestDuplicateDetector(unittest.TestCase):

    def test_sha256_hash(self):
        """Tests that identical content produces identical SHA-256 hashes and different content doesn't."""
        content1 = b"Hello, World! Secure File Sharing System."
        content2 = b"Hello, World! Secure File Sharing System."
        content3 = b"hello, world! Secure File Sharing System." # slight case change
        
        hash1 = calculate_sha256(content1)
        hash2 = calculate_sha256(content2)
        hash3 = calculate_sha256(content3)
        
        self.assertEqual(hash1, hash2, "Identical content must yield identical hashes.")
        self.assertNotEqual(hash1, hash3, "Different content must yield different hashes.")
        self.assertEqual(len(hash1), 64, "SHA-256 hash must be 64 characters long.")

    def test_get_file_category(self):
        """Tests that files are correctly categorized based on names and MIME types."""
        self.assertEqual(get_file_category("notes.txt", "text/plain"), "text")
        self.assertEqual(get_file_category("doc.md", ""), "text")
        self.assertEqual(get_file_category("photo.jpg", "image/jpeg"), "image")
        self.assertEqual(get_file_category("logo.PNG", ""), "image")
        self.assertEqual(get_file_category("data.pdf", "application/pdf"), "other")
        self.assertEqual(get_file_category("code.py", ""), "text")

    def test_tokenize_text(self):
        """Tests that text tokenization filters punctuation and stop words properly."""
        text = "This is a simple TEST sentence, with punctuation: 1234!"
        tokens = tokenize_text(text)
        
        # 'this', 'is', 'a', 'with' are stop words, '1234' is numeric
        self.assertIn("simple", tokens)
        self.assertIn("test", tokens)
        self.assertIn("sentence", tokens)
        self.assertIn("punctuation", tokens)
        self.assertNotIn("is", tokens)
        self.assertNotIn("a", tokens)
        self.assertNotIn("1234", tokens)

    def test_text_similarity_identical_and_near(self):
        """Tests that custom TF-IDF calculates high similarity for near-duplicates and low for others."""
        query_text = "The quick brown fox jumps over the lazy dog."
        
        # 1. Existing identical file (but with slight formatting difference)
        existing_identical = "the quick, brown fox jumps over the lazy dog!"
        # 2. Existing near-duplicate (slight change: 'jumps' -> 'leaps', 'dog' -> 'cat')
        existing_near = "The quick brown fox leaps over a lazy cat."
        # 3. Existing completely different file
        existing_diff = "Software engineering internship at Infosys focuses on secure storage and duplicate files."
        
        existing_data = [
            ({"id": 1, "filename": "identical.txt"}, existing_identical),
            ({"id": 2, "filename": "near.txt"}, existing_near),
            ({"id": 3, "filename": "different.txt"}, existing_diff)
        ]
        
        results = calculate_text_similarity(query_text, existing_data)
        
        # Make matches dictionary for easy assertions
        matches = {item[0]["filename"]: item[1] for item in results}
        
        self.assertGreater(matches["identical.txt"], 0.95, "Identical content should yield near 100% similarity.")
        self.assertGreater(matches["near.txt"], 0.40, "Near duplicates should yield moderate-to-high similarity.")
        self.assertLess(matches["different.txt"], 0.15, "Unrelated documents should yield low similarity.")
        self.assertGreater(matches["identical.txt"], matches["near.txt"], "Identical should be more similar than near-duplicate.")
        self.assertGreater(matches["near.txt"], matches["different.txt"], "Near-duplicate should be more similar than different.")

    def test_image_ahash_and_similarity(self):
        """Tests that average hash similarity is invariant to minor changes but catches large differences."""
        # Create a simple test image (100x100 white block with a black square in center)
        img_original = Image.new('RGB', (100, 100), color = 'white')
        draw_orig = ImageDraw.Draw(img_original)
        draw_orig.rectangle([25, 25, 75, 75], fill='black')
        buf_original = io.BytesIO()
        img_original.save(buf_original, format='PNG')
        original_bytes = buf_original.getvalue()
        
        # Create a slightly modified image (90x90 white block with a black square in center - resized)
        img_resized = Image.new('RGB', (90, 90), color = 'white')
        draw_res = ImageDraw.Draw(img_resized)
        draw_res.rectangle([22, 22, 68, 68], fill='black')
        buf_resized = io.BytesIO()
        img_resized.save(buf_resized, format='PNG')
        resized_bytes = buf_resized.getvalue()
        
        # Create a completely different image (100x100 black block with a white square in center - color inversion)
        img_different = Image.new('RGB', (100, 100), color = 'black')
        draw_diff = ImageDraw.Draw(img_different)
        draw_diff.rectangle([25, 25, 75, 75], fill='white')
        buf_different = io.BytesIO()
        img_different.save(buf_different, format='PNG')
        different_bytes = buf_different.getvalue()
        
        # Compute hashes
        hash_original = calculate_image_ahash(original_bytes)
        hash_resized = calculate_image_ahash(resized_bytes)
        hash_different = calculate_image_ahash(different_bytes)
        
        # Verify hashes exist
        self.assertTrue(hash_original)
        self.assertTrue(hash_resized)
        self.assertTrue(hash_different)
        
        # Calculate similarities
        sim_resized = calculate_image_similarity(hash_original, hash_resized)
        sim_different = calculate_image_similarity(hash_original, hash_different)
        
        self.assertGreater(sim_resized, 0.90, "Resized versions of the same pattern must yield high average hash similarity.")
        self.assertLess(sim_different, 0.60, "Completely different patterns should yield low similarity.")

if __name__ == '__main__':
    unittest.main()
