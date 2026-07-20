// client/src/features/analytics/hooks/useAnalytics.js

import { useCallback, useEffect, useState } from "react";
import { getAnalyticsSummary } from "../services/analyticsService";

function formatStorageValue(gb) {
  if (gb < 1) {
    return { value: gb * 1024, unit: " MB", decimals: 1 };
  }
  return { value: gb, unit: " GB", decimals: 1 };
}

function formatTransferred(gb, mb) {
  if (gb >= 1) return `${gb} GB transferred`;
  if (mb >= 1) return `${mb} MB transferred`;
  return `< 1 MB transferred`;
}

function formatChange(pct) {
  if (pct > 0) return `+${pct}% vs last`;
  if (pct < 0) return `${pct}% vs last`;
  return `same as last`;
}

export default function useAnalytics(days = 30, userId = null) {
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getAnalyticsSummary(days, userId);

      const s   = result.storage;
      const u   = result.uploads;
      const d   = result.downloads;
      const del = result.deletes;
      const sh  = result.sharing;

      const storageGB  = s?.storage_used_gb ?? 0;
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

      // ── Subtitles (from real DB data) ─────────────────────────────────
      const storageSub =
        `of ${s?.storage_quota_gb ?? 0} GB · ${(s?.storage_percentage ?? 0).toFixed(1)}% capacity`;

      const uploadsSub =
        `this month · ${formatChange(u?.change_pct ?? 0)}`;

      const downloadsSub =
        `this month · ${formatTransferred(d?.transferred_gb ?? 0, d?.transferred_mb ?? 0)}`;

      const sharesSub =
        (sh?.new_this_week ?? 0) > 0
          ? `+${sh.new_this_week} new this week`
          : `${sh?.inactive_links ?? 0} inactive`;

      const deletesSub =
        (del?.this_week_deletes ?? 0) > 0
          ? `${del.this_week_deletes} this week`
          : `${del?.this_month_deletes ?? 0} this month`;

      const enriched = {
        ...result,
        kpi: {
          storage:   storageFmt.value,
          uploads:   u?.total_uploads    ?? 0,
          downloads: d?.total_downloads  ?? 0,
          shares:    sh?.active_links    ?? 0,
          deletes:   del?.total_deletes  ?? 0,
        },
        subtitles: {
          storage_subtitle:   storageSub,
          uploads_subtitle:   uploadsSub,
          downloads_subtitle: downloadsSub,
          shares_subtitle:    sharesSub,
          deletes_subtitle:   deletesSub,
        },
      };

      setData(enriched);
    } catch (err) {
      console.error("[useAnalytics] error:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [days, userId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refresh: fetch };
}