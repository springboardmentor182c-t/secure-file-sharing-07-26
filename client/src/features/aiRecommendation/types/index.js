// Plain-JS project (see client/vite.config.ts comment on JSX-in-.js) - this
// file documents shapes via JSDoc typedefs for editor intellisense instead
// of real TypeScript types. Nothing here is executed at runtime.

/**
 * @typedef {"ai"|"ai_adjusted"|"embedding"|"fallback"} RecommendationSource
 */

/**
 * @typedef {Object} CandidateFolder
 * @property {string} folder_name
 * @property {string|null} folder_id
 * @property {number} similarity_score - 0-1.
 */

/**
 * @typedef {Object} AIRecommendation
 * @property {string} recommended_folder - Folder name Gemini/embeddings/the fallback recommends.
 * @property {string|null} folder_id - UUID of an existing folder if the name matched one, else null.
 * @property {boolean} is_new_folder_suggestion - True when no existing folder matched the name.
 * @property {number} confidence - 0-100.
 * @property {string} reason - One-sentence explanation.
 * @property {RecommendationSource} source - Which tier of the pipeline produced this recommendation.
 * @property {number|null} similarity_score - 0-1 cosine similarity for the chosen folder, if embeddings ran.
 * @property {CandidateFolder[]} alternative_folders - Other top semantic candidates, excluding the chosen one.
 * @property {string[]} keywords - Keywords extracted from the document.
 * @property {string[]} available_folders - The user's folder names, as sent to the model.
 * @property {boolean} embedding_engine_available - Whether the semantic embedding engine ran for this request.
 */

export {};
