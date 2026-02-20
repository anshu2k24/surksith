/**
 * Cryptography utilities using the native Web Crypto API.
 * This ensures all encryption and decryption of credentials
 * happens strictly within the user's browser (Zero-Knowledge).
 */

// We will use AES-GCM for encryption and PBKDF2 for deriving the key from a master password.
const ALGO_NAME = "AES-GCM";
const PBKDF2_ITERATIONS = 100000;
const SALT_SIZE = 16;
const IV_SIZE = 12;

/**
 * Derives a cryptographic key from a master password string using PBKDF2.
 * @param password The user's master password.
 * @param salt A unique salt (Uint8Array) for the user. If not provided, a random one is generated.
 * @returns An object containing the derived CryptoKey and the salt used.
 */
export async function deriveKeyFromPassword(
    password: string,
    salt?: Uint8Array
): Promise<{ key: CryptoKey; salt: Uint8Array }> {
    const enc = new TextEncoder();
    const passwordBuffer = enc.encode(password);

    const importedPassword = await window.crypto.subtle.importKey(
        "raw",
        passwordBuffer,
        { name: "PBKDF2" },
        false,
        ["deriveKey"]
    );

    const keySalt = salt || window.crypto.getRandomValues(new Uint8Array(SALT_SIZE));

    const key = await window.crypto.subtle.deriveKey(
        {
            name: "PBKDF2",
            salt: keySalt as BufferSource,
            iterations: PBKDF2_ITERATIONS,
            hash: "SHA-256",
        },
        importedPassword,
        { name: ALGO_NAME, length: 256 },
        false,
        ["encrypt", "decrypt"]
    );

    return { key, salt: keySalt };
}

/**
 * Encrypts a plaintext string using the derived AES-GCM key.
 * @param plaintext The secret data to encrypt.
 * @param key The derived CryptoKey.
 * @returns An object containing the ciphertext (base64) and the Initialization Vector (base64) used.
 */
export async function encryptData(
    plaintext: string,
    key: CryptoKey
): Promise<{ ciphertext: string; iv: string }> {
    const enc = new TextEncoder();
    const encodedText = enc.encode(plaintext);

    const iv = window.crypto.getRandomValues(new Uint8Array(IV_SIZE));

    const encryptedBuffer = await window.crypto.subtle.encrypt(
        {
            name: ALGO_NAME,
            iv: iv,
        },
        key,
        encodedText
    );

    // Convert ArrayBuffers to Base64 strings for easy storage
    const ciphertextBase64 = bufferToBase64(encryptedBuffer);
    const ivBase64 = bufferToBase64(iv.buffer as ArrayBuffer);

    return { ciphertext: ciphertextBase64, iv: ivBase64 };
}

/**
 * Decrypts a base64 ciphertext using the AES-GCM key and IV.
 * @param ciphertextBase64 The base64 encoded encrypted data.
 * @param ivBase64 The base64 encoded IV used during encryption.
 * @param key The derived CryptoKey.
 * @returns The decrypted plaintext string.
 */
export async function decryptData(
    ciphertextBase64: string,
    ivBase64: string,
    key: CryptoKey
): Promise<string> {
    const ciphertext = base64ToBuffer(ciphertextBase64);
    const iv = base64ToBuffer(ivBase64);

    try {
        const decryptedBuffer = await window.crypto.subtle.decrypt(
            {
                name: ALGO_NAME,
                iv: new Uint8Array(iv),
            },
            key,
            ciphertext
        );

        const dec = new TextDecoder();
        return dec.decode(decryptedBuffer);
    } catch (error) {
        console.error("Decryption failed. Incorrect key or corrupted data.", error);
        throw new Error("Decryption failed");
    }
}

// Helpers to convert between ArrayBuffer and Base64 string

function bufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
}

function base64ToBuffer(base64: string): ArrayBuffer {
    const binary_string = window.atob(base64);
    const len = binary_string.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binary_string.charCodeAt(i);
    }
    return bytes.buffer;
}
