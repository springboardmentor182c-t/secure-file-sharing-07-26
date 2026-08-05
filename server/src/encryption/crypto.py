import os
from dotenv import load_dotenv
from cryptography.hazmat.primitives.ciphers.aead import AESGCM

load_dotenv()

SECRET_KEY = bytes.fromhex(os.getenv("AES_SECRET_KEY"))


def encrypt_data(data: bytes):
    """
    Encrypt bytes using AES-256-GCM.
    Returns (nonce, encrypted_data).
    """
    aes = AESGCM(SECRET_KEY)
    nonce = os.urandom(12)  # Recommended nonce size for GCM
    encrypted = aes.encrypt(nonce, data, None)
    return nonce, encrypted


def decrypt_data(nonce: bytes, encrypted_data: bytes):
    """
    Decrypt AES-256-GCM encrypted bytes.
    """
    aes = AESGCM(SECRET_KEY)
    decrypted = aes.decrypt(nonce, encrypted_data, None)
    return decrypted