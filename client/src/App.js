import React, { useState } from "react";
import Sidebar from "./layout/Sidebar";
import SharedLinksPage from "./features/sharedLinks/SharedLinksPage";

/**
 * NOTE for the team: this file was an empty scaffold stub. This minimal
 * version only wires up the Shared Links module (this contributor's task).
 * Other nav items currently render a lightweight placeholder — each teammate
 * should render their own page for their assigned `activeItem` id here (or,
 * once react-router-dom is added to the project, replace this with <Routes>
 * and hand Sidebar's onNavigate={navigate} instead of local state).
 */
function ComingSoon({ label }) {
  return (
    <div style={{ padding: 40, color: "var(--text-secondary)" }}>
      <h2 style={{ color: "var(--text-primary)" }}>{label}</h2>
      <p>This module hasn't been implemented yet by its owner.</p>
    </div>
  );
}

export default function App() {
  const [activeItem, setActiveItem] = useState("shared-links");

  let content;
  if (activeItem === "shared-links") {
    content = <SharedLinksPage />;
  } else {
    content = <ComingSoon label={activeItem} />;
  }

  return (
    <div className="app-shell">
      <Sidebar activeItem={activeItem} onNavigate={setActiveItem} />
      <main className="app-main">{content}</main>
    </div>
  );
}
