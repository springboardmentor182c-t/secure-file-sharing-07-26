import React from "react";
import "../styles/AIRecommendationCard.css";

function SparkleIcon({ width = 13, height = 13 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 1.5l1.2 3.3L12.5 6l-3.3 1.2L8 10.5l-1.2-3.3L3.5 6l3.3-1.2L8 1.5z"
        fill="currentColor"
      />
      <path d="M13 9.5l0.6 1.6 1.6 0.6-1.6 0.6-0.6 1.6-0.6-1.6-1.6-0.6 1.6-0.6L13 9.5z" fill="currentColor" />
    </svg>
  );
}

function RefreshIcon({ width = 12, height = 12 }) {
  return (
    <svg width={width} height={height} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function confidenceTier(confidence) {
  if (confidence >= 70) return "high";
  if (confidence >= 40) return "medium";
  return "low";
}

const SOURCE_LABELS = {
  ai: "Gemini",
  ai_adjusted: "Gemini + similarity",
  embedding: "Semantic match",
  fallback: "Suggested",
};

/**
 * AI Recommendation Card - shown inside the Upload modal after a file is
 * selected. The user always has final control: accepting (or picking an
 * alternative) just pre-fills the folder picker above it, it never
 * uploads or moves anything by itself.
 *
 * @param {object} props
 * @param {import("../types").AIRecommendation|null} props.recommendation
 * @param {boolean} props.isLoading
 * @param {string|null} props.error
 * @param {() => void} props.onRefresh
 * @param {() => void} props.onAccept - called when the user accepts the top recommendation.
 * @param {(folderId: string) => void} props.onSelectAlternative - called when the user picks one of the alternative folders.
 * @param {() => void} props.onChooseAnother - called when the user wants to pick a different folder manually.
 * @param {boolean} props.isAccepted - whether the recommended folder is the currently selected one.
 * @param {string|null} props.selectedFolderId - the folder currently selected in the picker below, to highlight a matching alternative.
 */
export default function AIRecommendationCard({
  recommendation,
  isLoading,
  error,
  onRefresh,
  onAccept,
  onSelectAlternative,
  onChooseAnother,
  isAccepted,
  selectedFolderId,
}) {
  if (isLoading) {
    return (
      <div className="ai-rec-card">
        <div className="ai-rec-card__loading">
          <span className="ai-rec-card__spinner" aria-hidden="true" />
          Analyzing content and matching folders…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ai-rec-card">
        <div className="ai-rec-card__error">{error}</div>
        <div className="ai-rec-card__actions">
          <button type="button" className="ai-rec-card__btn" onClick={onRefresh}>
            <RefreshIcon /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (!recommendation) return null;

  const {
    recommended_folder,
    confidence,
    reason,
    source,
    is_new_folder_suggestion,
    similarity_score,
    alternative_folders,
  } = recommendation;
  const tier = confidenceTier(confidence);
  const hasAlternatives = Array.isArray(alternative_folders) && alternative_folders.length > 0;

  return (
    <div className="ai-rec-card">
      <div className="ai-rec-card__header">
        <span className="ai-rec-card__badge">
          <SparkleIcon /> AI Recommendation
        </span>
        <span className="ai-rec-card__source">{SOURCE_LABELS[source] || "Suggested"}</span>
      </div>

      <div className="ai-rec-card__body">
        <div className="ai-rec-card__folder-row">
          <span className="ai-rec-card__folder-name">{recommended_folder}</span>
          {is_new_folder_suggestion && <span className="ai-rec-card__new-tag">New folder</span>}
        </div>

        <div className="ai-rec-card__confidence-row">
          <div className="ai-rec-card__confidence-track">
            <div
              className={`ai-rec-card__confidence-fill ai-rec-card__confidence-fill--${tier}`}
              style={{ width: `${Math.max(4, Math.min(100, confidence))}%` }}
            />
          </div>
          <span className="ai-rec-card__confidence-label">{Math.round(confidence)}%</span>
        </div>

        {typeof similarity_score === "number" && (
          <p className="ai-rec-card__similarity">
            Content similarity: <strong>{Math.round(similarity_score * 100)}%</strong>
          </p>
        )}

        <p className="ai-rec-card__reason">{reason}</p>

        {hasAlternatives && (
          <div className="ai-rec-card__alternatives">
            <span className="ai-rec-card__alternatives-label">Other matches:</span>
            <div className="ai-rec-card__alternatives-list">
              {alternative_folders.map((alt) => (
                <button
                  key={alt.folder_id || alt.folder_name}
                  type="button"
                  className={`ai-rec-card__chip ${selectedFolderId && alt.folder_id === selectedFolderId ? "ai-rec-card__chip--active" : ""}`}
                  onClick={() => alt.folder_id && onSelectAlternative(alt.folder_id)}
                  disabled={!alt.folder_id}
                >
                  {alt.folder_name}
                  <span className="ai-rec-card__chip-score">{Math.round(alt.similarity_score * 100)}%</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="ai-rec-card__actions">
        <button
          type="button"
          className={`ai-rec-card__btn ${isAccepted ? "ai-rec-card__btn--accepted" : "ai-rec-card__btn--accept"}`}
          onClick={onAccept}
          disabled={isAccepted || is_new_folder_suggestion}
          title={is_new_folder_suggestion ? "Create this folder first, then choose it below" : undefined}
        >
          {isAccepted ? "Accepted" : "Accept Recommendation"}
        </button>
        <button type="button" className="ai-rec-card__btn" onClick={onChooseAnother}>
          Choose Another Folder
        </button>
        <button type="button" className="ai-rec-card__btn" onClick={onRefresh}>
          <RefreshIcon /> Refresh
        </button>
      </div>
    </div>
  );
}
