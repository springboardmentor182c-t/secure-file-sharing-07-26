import React from "react";
import { CATEGORIES } from "../utils/fileUtils";

const TABS = ["All", ...CATEGORIES];

export default function CategoryTabs({ active, onChange }) {
  return (
    <div className="category-tabs" role="tablist" aria-label="Filter by category">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={active === tab}
          className={`category-tabs__tab ${active === tab ? "category-tabs__tab--active" : ""}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}
