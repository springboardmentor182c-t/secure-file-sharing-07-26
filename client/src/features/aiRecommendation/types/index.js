/**
 * @typedef {Object} AIRecommendation
 * @property {"EXISTING_FOLDER"|"NEW_FOLDER"} [recommendation_type]
 * @property {string|null} recommended_folder_id
 * @property {string|null} recommended_folder_name
 * @property {number} confidence - 0.0 - 1.0
 * @property {string} reason
 * @property {"grok"|"embedding"|"fallback"} source
 * @property {boolean} [has_folders]
 */

export {};

