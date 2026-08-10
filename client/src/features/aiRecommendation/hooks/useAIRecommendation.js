import { useCallback, useEffect, useRef, useState } from "react";
import { getRecommendation } from "../services/aiRecommendationApi";

/**
 * Fetches an AI folder recommendation for a single file, once, whenever
 * `file` changes. Fully non-blocking: consumers get `loading`/`error`
 * state back and decide how to render around it, and the caller's own
 * upload flow never depends on this resolving.
 *
 * @param {File|null} file - the first selected file to analyze (or null to skip)
 * @param {string|null} currentFolderId
 */
export default function useAIRecommendation(file, currentFolderId) {
  const [recommendation, setRecommendation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestId = useRef(0);

  const fetchRecommendation = useCallback(async () => {
    if (!file) {
      setRecommendation(null);
      setError(null);
      return;
    }

    const thisRequest = ++requestId.current;
    setLoading(true);
    setError(null);
    try {
      const result = await getRecommendation(file, currentFolderId);
      if (requestId.current === thisRequest) {
        setRecommendation(result);
      }
    } catch (err) {
      if (requestId.current === thisRequest) {
        setError(err.message || "AI recommendation is currently unavailable.");
        setRecommendation(null);
      }
    } finally {
      if (requestId.current === thisRequest) {
        setLoading(false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file, currentFolderId]);

  useEffect(() => {
    fetchRecommendation();
  }, [fetchRecommendation]);

  return { recommendation, loading, error, retry: fetchRecommendation };
}
