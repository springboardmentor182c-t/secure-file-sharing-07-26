from src.encryption.crypto import encrypt_data, decrypt_data

message = b"Hello Tejaswi! AES-256 Encryption Test"

print("Original :", message)

nonce, encrypted = encrypt_data(message)
print("Encrypted:", encrypted)

decrypted = decrypt_data(nonce, encrypted)
print("Decrypted:", decrypted)

if message == decrypted:
    print("\nSUCCESS: Encryption and Decryption working!")
else:
    print("\nFAILED!")