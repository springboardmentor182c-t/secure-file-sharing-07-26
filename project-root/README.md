# SecureShare — Secure End-to-End Encrypted File Sharing System

SecureShare is a modern, premium secure file storage and sharing application featuring **End-to-End Encryption (E2EE)**. Designed with user security and premium aesthetics in mind, it allows users to organize files, create folders, toggle encryption, search, sort, and download files with zero-knowledge server-side exposure.

---

## 🔒 Security Architecture: End-to-End Encryption (E2EE)

SecureShare uses a zero-knowledge security model. The server and database have no knowledge of your actual files, filenames, or file types:

1. **Key Derivation:** A stable 256-bit AES key is derived in the browser locally using the Web Crypto API, based on the user's secure credentials.
2. **Metadata Encryption:** Filenames and mimetypes are encrypted to base64-encoded strings (prefixed with `e2ee:`) in the browser using **AES-GCM 256-bit** before they are sent to the server.
3. **Content Encryption:** Raw file bytes are encrypted into a secure binary blob in the browser before upload.
4. **Local Decryption:** Decryption keys never leave the browser. Decrypting file names for UI rendering and decrypting file contents for downloading is performed completely in-memory in the browser.

---

## 🚀 Key Features

* **🗂️ Physical Directory Syncing:** Creating folders in the UI physically creates directories under `server/uploads/` (supporting subfolders). Files uploaded inside a folder are physically stored in that folder on disk.
* **📱 Grid & List Views:** Toggle between a standard table List View and a rich card-based Grid View.
* **✨ Pulsing Encryption Glow:** Interactive Lock/Unlock action buttons that pulse with an emerald green glow when a file is encrypted.
* **🔍 Real-time Search:** Top bar and table search inputs filter files in real-time.
* **📊 Column Sorting & Filtering:** Click table headers (Name, Size, Date, Status) to sort ascending/descending, or filter list views to show only encrypted or plaintext files.
* **🗑️ Safe Hard Deletion:** Deleting files or folders instantly deletes database records and removes physical files from the host disk.

---

## 🛠️ Project Structure

```
project-root/
├── client/          # React Frontend SPA
│   ├── src/
│   │   ├── pages/   # Pages (Files, Dashboard, Settings, etc.)
│   │   ├── utils/   # API bindings and crypto.js utilities
│   │   └── context/ # Global state and context providers
└── server/          # FastAPI Backend API
    ├── src/
    │   ├── files/   # Files service, models, and controller
    │   ├── folders/ # Folders CRUD operations
    │   └── auth/    # Auth dependencies and routes
    └── uploads/     # Physical directory storage root for files
```

---

## 💻 Getting Started

### Prerequisites
* Python 3.10+
* Node.js 16+
* npm or yarn

---

### Backend Setup (FastAPI)

1. Navigate to the server folder:
   ```bash
   cd server
   ```

2. Create a virtual environment and activate it:
   ```bash
   python -m venv .venv
   # Windows:
   .venv\Scripts\activate
   # macOS/Linux:
   source .venv/bin/activate
   ```

3. Install the dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the FastAPI development server:
   ```bash
   python -m uvicorn src.api:app --reload --port 8000
   ```
   The backend API will run on `http://localhost:8000`.

---

### Frontend Setup (React)

1. Navigate to the client folder:
   ```bash
   cd ../client
   ```

2. Install the node packages:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```
   The frontend will open in your browser at `http://localhost:3000`.

---

## 🧪 Testing and Verification

* **Database Check:** To inspect the zero-knowledge database metadata:
  ```sqlite3 server/app.db "SELECT original_name FROM files;"```
  You will see that filenames are encrypted base64 blocks starting with `e2ee:` rather than plaintext names.
* **Glow Verification:** Toggle encryption on any file and observe the pulsing green aura indicating active E2EE.
