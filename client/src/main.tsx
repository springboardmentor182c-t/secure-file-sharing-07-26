/// <reference types="vite/client" />
import { createRoot } from "react-dom/client";
import App from "./App";
import "./styles/index.css";
import { logBackendStatus } from "./services/healthCheck";

// NOTE: this used to import App from "./security/security.tsx", an
// unrelated "Security Control Center" scaffold (see that file's own
// TopBar/branding) that doesn't call any endpoint this backend actually
// exposes and never rendered the real TrustShare app (Sidebar, routes,
// Shared Links screen, etc). Flag this with your team if `security.tsx`
// was meant to be wired in some other way - for now the real app
// (App.js -> routes/AppRoutes.js) is what boots.

// Initialize backend health check on app startup
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
logBackendStatus(API_BASE_URL).catch(console.error);

const root = document.getElementById("root");

if (root) {
  createRoot(root).render(<App />);
}