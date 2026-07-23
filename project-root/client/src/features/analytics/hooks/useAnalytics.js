// client/src/features/analytics/hooks/useAnalytics.js

import { useCallback, useEffect, useRef, useState } from "react";
import { getAnalyticsSummary } from "../services/analyticsService";

function formatStorageValue(gb) {
  if (gb < 1) return { value: gb * 1024, unit: " MB", decimals: 1 };
  return { value: gb, unit: " GB", decimals: 1 };
}

function formatTransferred(gb, mb) {
  if (gb >= 1) return `${gb} GB transferred`;
  if (mb >= 1) return `${mb} MB transferred`;
  return "< 1 MB transferred";
}

function formatChange(pct) {
  if (pct > 0) return `+${pct}% vs last`;
  if (pct < 0) return `${pct}% vs last`;
  return "same as last";
}

// Simple cache to prevent re-fetching on tab switch
const cache = {};
function getCacheKey(days, userId) {
  return `${days}-${userId || "all"}`;
}

// ═══ ✅ NEW: Auto-refresh interval (30 seconds) ═══
const AUTO_REFRESH_INTERVAL = 30000;

export default function useAnalytics(days = 30, userId = null) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const lastFetchRef = useRef(null);

  // ═══ ✅ NEW: Auto-refresh state ═══
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefreshedAt, setLastRefreshedAt] = useState(null);
  const [nextRefreshIn, setNextRefreshIn] = useState(AUTO_REFRESH_INTERVAL / 1000);
  const intervalRef = useRef(null);
  const countdownRef = useRef(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    const key = getCacheKey(days, userId);

    // Use cache if available and not force refreshing (within 60 seconds)
    if (!forceRefresh && cache[key] && Date.now() - cache[key].time < 60000) {
      setData(cache[key].data);
      setLoading(false);
      return;
    }

    try {
      // Only show loading on first load, not on auto-refresh
      if (!lastFetchRef.current) {
        setLoading(true);
      }
      setError(null);

      const result = await getAnalyticsSummary(days, userId);

      const s = result.storage;
      const u = result.uploads;
      const d = result.downloads;
      const del = result.deletes;
      const sh = result.sharing;
      const trends = result.trends || {};

      const storageGB = s?.storage_used_gb ?? 0;
      const storageFmt = formatStorageValue(storageGB);

      // Dynamic KPI overrides
      if (result.ui_config?.file_kpis) {
        result.ui_config = {
          ...result.ui_config,
          file_kpis: result.ui_config.file_kpis.map((kpi) =>
            kpi.key === "storage"
              ? { ...kpi, suffix: storageFmt.unit, decimals: storageFmt.decimals }
              : kpi
          ),
        };
      }

      // Subtitles from real DB data
      const storageSub = `of ${s?.storage_quota_gb ?? 0} GB · ${(s?.storage_percentage ?? 0).toFixed(1)}% capacity`;
      const uploadsSub = `this month · ${formatChange(u?.change_pct ?? 0)}`;
      const downloadsSub = `this month · ${formatTransferred(d?.transferred_gb ?? 0, d?.transferred_mb ?? 0)}`;
      const sharesSub = (sh?.new_this_week ?? 0) > 0
        ? `+${sh.new_this_week} new this week`
        : `${sh?.inactive_links ?? 0} inactive`;
      const deletesSub = (del?.this_week_deletes ?? 0) > 0
        ? `${del.this_week_deletes} this week`
        : `${del?.this_month_deletes ?? 0} this month`;

      // Trend indicators from DB
      const trendData = trends?.trends || {};

      const enriched = {
        ...result,
        kpi: {
          storage: storageFmt.value,
          uploads: u?.total_uploads ?? 0,
          downloads: d?.total_downloads ?? 0,
          shares: sh?.active_links ?? 0,
          deletes: del?.total_deletes ?? 0,
        },
        subtitles: {
          storage_subtitle: storageSub,
          uploads_subtitle: uploadsSub,
          downloads_subtitle: downloadsSub,
          shares_subtitle: sharesSub,
          deletes_subtitle: deletesSub,
        },
        // Trend arrows for KPI cards (from DB)
        kpiTrends: {
          uploads: trendData.uploads || null,
          downloads: trendData.downloads || null,
          shares: trendData.shares || null,
          logins: trendData.logins || null,
          failed: trendData.failed || null,
        },
        // File access history (from DB)
        fileAccessHistory: trends?.file_access_history || [],
      };

      // Cache the result
      cache[key] = { data: enriched, time: Date.now() };
      lastFetchRef.current = Date.now();
      setLastRefreshedAt(Date.now()); // ═══ ✅ NEW ═══

      setData(enriched);
    } catch (err) {
      console.error("[useAnalytics] error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [days, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Force refresh (bypasses cache)
  const refresh = useCallback(() => {
    const key = getCacheKey(days, userId);
    delete cache[key];
    setNextRefreshIn(AUTO_REFRESH_INTERVAL / 1000); // ═══ ✅ Reset countdown ═══
    return fetchData(true);
  }, [fetchData, days, userId]);

  // ═══════════════════════════════════════════════════════════
  // ✅ NEW: Auto-refresh logic
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // Clean up existing intervals
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);

    if (!autoRefreshEnabled) {
      setNextRefreshIn(AUTO_REFRESH_INTERVAL / 1000);
      return;
    }

    // Countdown timer (updates every second)
    countdownRef.current = setInterval(() => {
      setNextRefreshIn((prev) => {
        if (prev <= 1) return AUTO_REFRESH_INTERVAL / 1000;
        return prev - 1;
      });
    }, 1000);

    // Auto-refresh timer (fires every 30s)
    intervalRef.current = setInterval(() => {
      // Silent refresh - no loading spinner
      const key = getCacheKey(days, userId);
      delete cache[key];
      fetchData(true);
    }, AUTO_REFRESH_INTERVAL);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [autoRefreshEnabled, days, userId, fetchData]);

  const toggleAutoRefresh = useCallback(() => {
    setAutoRefreshEnabled((prev) => !prev);
  }, []);

  return {
    data,
    loading,
    error,
    refresh,
    autoRefreshEnabled,
    toggleAutoRefresh,
    lastRefreshedAt,
    nextRefreshIn,
  };
}