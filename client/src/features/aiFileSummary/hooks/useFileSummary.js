import { useState, useCallback, useRef, useEffect } from "react";
import { generateSummary, fetchSummary } from "../services/aiSummaryApi";

const POLL_INTERVAL_MS = 3000;

/**
 * Hook to generate and poll an AI summary for a given file.
 * status: "idle" | "pending" | "completed" | "failed" | "not_generated"
 */
export function useFileSummary(fileId) {
  const [status, setStatus] = useState("idle");
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState(null);
  const pollTimer = useRef(null);

  const stopPolling = useCallback(() => {
    if (pollTimer.current) {
      clearInterval(pollTimer.current);
      pollTimer.current = null;
    }
  }, []);

  const poll = useCallback(() => {
    pollTimer.current = setInterval(async () => {
      try {
        const data = await fetchSummary(fileId);
        setStatus(data.status);

        if (data.status === "completed") {
          setSummary(data.summary);
          stopPolling();
        } else if (data.status === "failed") {
          setError("Summary generation failed. Please try again.");
          stopPolling();
        }
      } catch (err) {
        setError(err.message);
        stopPolling();
      }
    }, POLL_INTERVAL_MS);
  }, [fileId, stopPolling]);

  const generate = useCallback(async () => {
    setError(null);
    setStatus("pending");
    try {
      await generateSummary(fileId);
      poll();
    } catch (err) {
      setError(err.message);
      setStatus("failed");
    }
  }, [fileId, poll]);

  const checkExisting = useCallback(async () => {
    try {
      const data = await fetchSummary(fileId);
      setStatus(data.status);
      if (data.status === "completed") {
        setSummary(data.summary);
      } else if (data.status === "pending") {
        poll(); // resume polling if generation was already in progress
      }
    } catch (err) {
      setError(err.message);
    }
  }, [fileId, poll]);

  useEffect(() => {
    return () => stopPolling(); // cleanup on unmount
  }, [stopPolling]);

  return { status, summary, error, generate, checkExisting };
}