import React, { createContext, useContext, useCallback } from "react";

const AnalyticsContext = createContext(undefined);

/**
 * Minimal analytics context. Swap `track`/`page` internals for your real
 * provider (Segment, PostHog, Amplitude, GA4, etc.) - the rest of the app
 * only depends on this interface, not the provider.
 */
export function AnalyticsProvider({ children }) {
  const track = useCallback((eventName, properties = {}) => {
    // eslint-disable-next-line no-console
    console.debug("[analytics] track:", eventName, properties);
  }, []);

  const page = useCallback((pageName, properties = {}) => {
    // eslint-disable-next-line no-console
    console.debug("[analytics] page:", pageName, properties);
  }, []);

  return (
    <AnalyticsContext.Provider value={{ track, page }}>{children}</AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const ctx = useContext(AnalyticsContext);
  if (!ctx) throw new Error("useAnalytics must be used within AnalyticsProvider");
  return ctx;
}
