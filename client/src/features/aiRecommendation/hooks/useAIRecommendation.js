import { useCallback, useEffect, useRef, useState } from "react";
import { recommendFolder } from "../services/aiRecommendationApi";

/**
 * Fetches an AI folder recommendation for a single file and exposes
 * loading/error/data state plus a `refresh()` action. Fetches
 * automatically whenever `file` changes (e.g. the user picks a different
 * file to preview in the upload modal); pass `null`/`undefined` to skip.
 *
 * This hook never throws into the render tree - a failed request just
 * surfaces `error`, so the rest of the upload flow (folder picker,
 * Proceed button) keeps working even if the recommendation call fails.
 */
export default function useAIRecommendation(file) {
  const [recommendation, setRecommendation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const requestId = useRef(0);

  const fetchRecommendation = useCallback(async (targetFile) => {
    if (!targetFile) {
      setRecommendation(null);
      setError(null);
      return;
    }
    const thisRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const data = await recommendFolder(targetFile);
      if (thisRequest !== requestId.current) return; // a newer request superseded this one
      setRecommendation(data);
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      setError(err.message || "Couldn't get a recommendation right now.");
      setRecommendation(null);
    } finally {
      if (thisRequest === requestId.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecommendation(file);
  }, [file, fetchRecommendation]);

  const refresh = useCallback(() => fetchRecommendation(file), [file, fetchRecommendation]);

  return { recommendation, isLoading, error, refresh };
}
