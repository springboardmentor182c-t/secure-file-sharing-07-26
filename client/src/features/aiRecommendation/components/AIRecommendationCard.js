import React from "react";
import { FolderIcon, CheckIcon } from "../../../layout/icons";
import "../styles/AIRecommendationCard.css";

/**
 * Optional suggestion shown inside the existing Upload Modal. Never forces
 * a choice - the user can always ignore it and pick a folder manually via
 * the existing folder list right below it.
 *
 * @param {{
 *   loading: boolean,
 *   error: string|null,
 *   recommendation: import("../types").AIRecommendation|null,
 *   onUseRecommended: (folderId: string) => void,
 *   isSelected: boolean,
 * }} props
 */
export default function AIRecommendationCard({ loading, error, recommendation, onUseRecommended, isSelected }) {
  if (loading) {
    return (
      <div className="ai-rec-card ai-rec-card--loading">
        <span className="ai-rec-card__spinner" aria-hidden="true" />
        <div>
          <p className="ai-rec-card__title">Analyzing file…</p>
          <p className="ai-rec-card__subtitle">Finding the best folder</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-rec-card ai-rec-card--muted">
        <p className="ai-rec-card__subtitle">
          AI recommendation is currently unavailable. Please select a folder manually.
        </p>
      </div>
    );
  }

  if (!recommendation) return null;

  // No folders yet, or nothing usable to suggest - stay out of the way.
  if (!recommendation.recommended_folder_id) {
    if (recommendation.has_folders === false) return null;
    return (
      <div className="ai-rec-card ai-rec-card--muted">
        <p className="ai-rec-card__subtitle">{recommendation.reason}</p>
      </div>
    );
  }

  const confidencePct = Math.round((recommendation.confidence || 0) * 100);
  const isFallback = recommendation.source === "fallback";
  const isNewFolder = recommendation.recommendation_type === "NEW_FOLDER";

  return (
    <div className={`ai-rec-card ${isSelected ? "ai-rec-card--active" : ""} ${isNewFolder ? "ai-rec-card--new-folder" : ""}`}>
      <div className="ai-rec-card__header">
        <span className={`ai-rec-card__badge ${isNewFolder ? "ai-rec-card__badge--new" : ""}`}>
          {isNewFolder ? "New Folder Created" : "AI Recommendation"}
        </span>
        {!isFallback && <span className="ai-rec-card__confidence">{confidencePct}% confidence</span>}
      </div>

      <div className="ai-rec-card__folder-row">
        <FolderIcon width={16} height={16} />
        <span className="ai-rec-card__folder-name">
          {isNewFolder ? "New folder created: " : "Recommended folder: "}
          <strong>{recommendation.recommended_folder_name}</strong>
        </span>
        {isSelected && <CheckIcon width={14} height={14} className="ai-rec-card__check" />}
      </div>

      <p className="ai-rec-card__reason">{recommendation.reason}</p>

      <button
        type="button"
        className="btn btn--ghost ai-rec-card__action"
        onClick={() => onUseRecommended(recommendation.recommended_folder_id)}
        disabled={isSelected}
      >
        {isSelected ? "Recommended folder selected" : "Use Recommended Folder"}
      </button>
    </div>
  );
}

