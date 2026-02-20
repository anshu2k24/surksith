# Contributing to सुरक्षितः (Surksith)

Thank you for your interest in contributing to **सुरक्षितः**! We are actively looking for developers, designers, and security enthusiasts to help make this zero-knowledge, natural-language password manager even better.

This document serves as a guide for anyone looking to contribute, understand the architecture, or propose changes.

## 🏗️ Architecture & Layout 

To successfully contribute, it's important to understand how the app is structured to maintain strict security boundaries while providing a beautiful user experience. 

### Key Technologies 
- **Next.js (App Router, Node 22+)**: Handles rendering, routing, and deployment. 
- **Tailwind CSS v4 & Framer Motion**: Handles the "breezy" pastel gradients and glassmorphism.
- **Supabase**: Handles raw Data Storage and Authentication.
- **Web Crypto API**: Native browser API handling all AES-GCM encryption/decryption. 

### Directory Structure

```plaintext
src/
├── app/
│   ├── globals.css         # Pastel themes, animations, & glassmorphism roots
│   ├── layout.tsx          # App wrapper (contains VaultProvider context)
│   └── page.tsx            # Main layout containing the Auth or Dashboard views
├── components/
│   ├── AuthScreen.tsx      # Handles Auth, Login, & derivation of Master Key
│   ├── CommandBar.tsx      # Global Cmd+K Natural Language parser & Speech API 
│   ├── Dashboard.tsx       # Main vault UI fetching and decrypting passwords
│   └── VaultProvider.tsx   # React Context holding the session & derived Master Key
├── lib/
│   └── crypto.ts           # Core Web Crypto PBKDF2 + AES-GCM logic 
└── utils/
    └── supabase/
        └── client.ts       # Supabase initialization client
```

### The Security Model (Crucial for Contributors)

If you are modifying anything related to `crypto.ts`, `AuthScreen.tsx`, or `Dashboard.tsx`, please adhere strictly to these principles:

1.  **Zero-Knowledge Rule**: The user's original `Master Password` or any decrypted credentials must **NEVER** leave the client's browser context. 
2.  **State Management**: We store the derived `CryptoKey` in the `VaultProvider.tsx` context. It exists only in memory. When the page refreshes, it is destroyed. Do not attempt to save this key to `localStorage` or `cookies`. 
3.  **Encrypted Payload**: We only send the Base64-encoded `ciphertext` and `IV (Initialization Vector)` to Supabase. Supabase has zero ability to decrypt the vault items. 

### The Parser Model (Command Bar)

We want to keep this project $0 to run. Therefore, we parse natural language commands directly inside the user's browser in `CommandBar.tsx`. 

-   **Current Approach**: Regular Expressions (Regex). 
-   **Future Ideas Expected from Contributors**: We are very interested in replacing the Regex parser with a local, in-browser AI model using `Transformers.js` + WebGPU to run a small LLM inference directly on the client. 

## 🛠️ How to Contribute

### 1. Find an Issue
Look through the "Issues" tab on GitHub. Issues marked `good first issue` are great places to start.

### 2. Fork & Clone
1.  Fork the repository to your own GitHub account.
2.  Clone it locally:
    ```bash
    git clone https://github.com/anshu2k24/surksith.git
    ```
3.  Create a separate branch for your feature/fix:
    ```bash
    git checkout -b feature/my-awesome-idea
    ```

### 3. Make Changes
*   Ensure your UI components utilize the core `glass-card` and `glass-input` classes defined in `globals.css` to maintain visual consistency. 
*   If you're tackling any `lib/crypto.ts` functions, please heavily comment your logic. Cryptography should be explicitly documented. 

### 4. Submit a Pull Request
1.  Commit your changes with clear, descriptive messages:
    ```bash
    git commit -m "feat: added support for categorizing credit cards in parser"
    ```
2.  Push to your fork:
    ```bash
    git push origin feature/my-awesome-idea
    ```
3.  Open a Pull Request against the main repository. 
4.  In your PR, describe what you changed, why you changed it, and confirm you tested it alongside the Zero-Knowledge requirements above. 

We review PRs frequently! Thank you for helping build **सुरक्षितः**!
