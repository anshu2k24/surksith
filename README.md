# सुरक्षितः (Surksith) - Secure Password Manager

A beautiful, conversational, zero-knowledge password manager. "सुरक्षितः" (meaning "Secure") combines the robust security of Client-Side Web Crypto Encryption with a sleek glassmorphic UI, soft pastel animations, and a hands-free, natural language Command Bar powered by the Browser Speech API.

## Features ✨

*   **Zero-Knowledge Security**: Your Master Password and credentials **never leave your device**. Everything is encrypted and decrypted natively in your browser using the local Web Crypto API (`AES-GCM` & `PBKDF2`).
*   **Natural Language Parser**: Press `Cmd + K` and type or *speak* statements like *"Save my Netflix login user is email@me.com and pass is 1234"* to instantly categorize and store credentials.
*   **Built-in Web Speech API**: No expensive AI API keys required. We utilize the free, built-in browser SpeechRecognition engine for dictation.
*   **Breezy Aesthetics**: Fluid pastel background gradients and glass-pane layered UI components powered by Framer Motion and Tailwind CSS.
*   **Self-Destructing Clipboard**: "Click to Copy" safely. The app automatically clears your device clipboard gracefully after 10 seconds.

## Usage Guide 🚀

### 1. Account Creation
*   Navigate to the homepage and create a new account (handled by Supabase Auth).
*   You will be asked to create a **Master Password**. **Do not lose this password.** Because your data is encrypted purely on the client side without involving the backend, if you lose this password, your vault data is completely unrecoverable.

### 2. Adding a Credential
*   Press **`Cmd + K`** to open the Command Bar.
*   Type or click the microphone to dictate your prompt. Example: *"Save Netflix, my user is test@example.com and the pass is MySecret123"*.
*   The Natural Language Parser will extract the `Site`, `Username`, and `Password`. 
*   Click **"Save to Vault"**. 

### 3. Retrieving a Credential
*   Locate the credential card in your Dashboard.
*   Click **"Copy Password"**.
*   The password is decrypted in real-time within your browser and moved to your clipboard.
*   A visual green progress bar will "shrink" over 10 seconds, after which your clipboard is securely erased. 

## Technology Stack 🛠️

*   **Framework**: [Next.js App Router (v16+)](https://nextjs.org/)
*   **Database & Auth**: [Supabase](https://supabase.com/)
*   **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Shadcn UI
*   **Animations**: [Framer Motion](https://www.framer.com/motion/)
*   **Icons**: [Lucide React](https://lucide.dev/)

---

## Setting up locally 💻

1. **Clone the repository:**
   ```bash
   git clone https://github.com/anshu2k24/surksith.git
   cd surksith
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Initialize Supabase Schema:**
   Run the SQL provided in `supabase_schema.sql` within your Supabase SQL Editor. This sets up the `vault` table and handles the vital Row Level Security (RLS) policies.

5. **Start Development Server:**
   ```bash
   npm run dev
   ```
   *Open [http://localhost:3000](http://localhost:3000) to view the application in your browser.*

---

## Contributing 🤝

We welcome all contributions to make **सुरक्षितः** even more secure, beautiful, and intelligent! 

Please refer to the detailed [CONTRIBUTING.md](./CONTRIBUTING.md) guide for information on exactly how the codebase is structured, our architectural principles, and the process for submitting Pull Requests.
