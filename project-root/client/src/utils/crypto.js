// Client-side End-to-End Encryption (E2EE) using Web Crypto API (AES-GCM)

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

// Helper to convert Base64 to ArrayBuffer
function base64ToArrayBuffer(base64) {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Derive a stable 256-bit AES-GCM key for the user.
 */
export async function getEncryptionKey(userId) {
  const encoder = new TextEncoder();
  const salt = encoder.encode(userId || "default-user-salt-2026");
  const passphraseKey = await window.crypto.subtle.importKey(
    "raw",
    encoder.encode("secureshare-client-side-passphrase-e2ee-key"),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 1000, // kept simple for faster key derivation in browser
      hash: "SHA-256",
    },
    passphraseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/**
 * Encrypt a plaintext string using the derived key.
 * Prepends a 12-byte IV and returns base64 string prefixed with 'e2ee:'.
 */
export async function encryptText(text, key) {
  if (!text) return text;
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    data
  );
  
  // Combine IV and ciphertext into one buffer
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return "e2ee:" + arrayBufferToBase64(combined.buffer);
}

/**
 * Decrypt a base64 ciphertext string starting with 'e2ee:' using the derived key.
 * If the string does not start with 'e2ee:', returns the string as-is (for backward compatibility).
 */
export async function decryptText(encryptedText, key) {
  if (!encryptedText || !encryptedText.startsWith("e2ee:")) {
    return encryptedText;
  }
  try {
    const base64Data = encryptedText.substring(5); // strip 'e2ee:'
    const combined = new Uint8Array(base64ToArrayBuffer(base64Data));
    
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    
    const decrypted = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext.buffer
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (err) {
    console.error("Failed to decrypt metadata:", err);
    return "[Decryption Failed]";
  }
}

/**
 * Encrypt a File or Blob.
 * Returns a new Blob containing 12-byte IV + encrypted data.
 */
export async function encryptFileBytes(file, key) {
  const arrayBuffer = await file.arrayBuffer();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    arrayBuffer
  );
  
  // Combine IV + ciphertext into a single Blob
  const combined = new Uint8Array(iv.length + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.length);
  
  return new Blob([combined], { type: "application/octet-stream" });
}

/**
 * Decrypt an encrypted File/Blob buffer.
 * Returns a decrypted Blob.
 */
export async function decryptFileBytes(encryptedBuffer, key, originalMimetype) {
  const combined = new Uint8Array(encryptedBuffer);
  
  const iv = combined.slice(0, 12);
  const ciphertext = combined.slice(12);
  
  const decrypted = await window.crypto.subtle.decrypt(
    { name: "AES-GCM", iv },
    key,
    ciphertext.buffer
  );
  
  return new Blob([decrypted], { type: originalMimetype || "application/octet-stream" });
}
