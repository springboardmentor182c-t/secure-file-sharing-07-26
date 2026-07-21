import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import {
  listSharedLinks,
  createSharedLink,
  updateSharedLink,
  toggleSharedLink,
  revokeSharedLink,
  deleteSharedLink,
  getStats,
  getMonthlyActivity,
} from "../services/sharedLinksApi";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

/**
 * Owns all Shared Links data + UI state, backed by the real FastAPI +
 * PostgreSQL backend (server/src/shared_links). No mock data, no
 * client-side fabrication - every list, stat, and chart value here comes
 * straight from the API.
 */
export default function useSharedLinks() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [stats, setStats] = useState({ activeLinks: 0, totalViews: 0, totalDownloads: 0, expiringSoon: 0 });
  const [chartData, setChartData] = useState([]);

  const requestId = useRef(0);

  // Debounce free-typed search input before it drives a real request.
  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchLinks = useCallback(async () => {
    const thisRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const { links: fetched, pagination } = await listSharedLinks({
        search: searchQuery,
        status: statusFilter,
        sortBy,
        page,
        pageSize: PAGE_SIZE,
      });
      if (thisRequest !== requestId.current) return; // a newer request already landed
      setLinks(fetched);
      setTotalCount(pagination.total_items);
      setTotalPages(pagination.total_pages);
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      setError(err.message || "Couldn't load shared links.");
      setLinks([]);
    } finally {
      if (thisRequest === requestId.current) setIsLoading(false);
    }
  }, [searchQuery, statusFilter, sortBy, page]);

  const fetchSummary = useCallback(async () => {
    try {
      const [statsResult, chartResult] = await Promise.all([getStats(), getMonthlyActivity()]);
      setStats(statsResult);
      setChartData(chartResult);
    } catch {
      // Non-fatal: the table is still usable without the stat cards/chart.
    }
  }, []);

  useEffect(() => {
    fetchLinks();
  }, [fetchLinks]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Clamp page if filters shrink the result set below the current page.
  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [totalPages, page]);

  const refreshAll = useCallback(() => {
    fetchLinks();
    fetchSummary();
  }, [fetchLinks, fetchSummary]);

  const updateSearch = useCallback((q) => setSearchInput(q), []);

  const updateSort = useCallback((s) => {
    setSortBy(s);
    setPage(1);
  }, []);

  const updateStatusFilter = useCallback((s) => {
    setStatusFilter(s);
    setPage(1);
  }, []);

  const createLink = useCallback(async (formValues) => {
    const newLink = await createSharedLink(formValues);
    await refreshAll();
    return newLink;
  }, [refreshAll]);

  const updateLink = useCallback(async (id, patch) => {
    const updated = await updateSharedLink(id, patch);
    await refreshAll();
    return updated;
  }, [refreshAll]);

  const toggleLinkEnabled = useCallback(async (id) => {
    const updated = await toggleSharedLink(id);
    await refreshAll();
    return updated;
  }, [refreshAll]);

  const revokeLink = useCallback(async (id) => {
    const updated = await revokeSharedLink(id);
    await refreshAll();
    return updated;
  }, [refreshAll]);

  const deleteLink = useCallback(async (id) => {
    await deleteSharedLink(id);
    await refreshAll();
  }, [refreshAll]);

  const hasActiveFilters = !!searchInput || statusFilter !== "all";

  const clearFilters = useCallback(() => {
    setSearchInput("");
    setSearchQuery("");
    setStatusFilter("all");
    setPage(1);
  }, []);

  return useMemo(() => ({
    isLoading,
    error,
    links,
    pageLinks: links,
    totalCount,
    stats,
    chartData,
    searchQuery: searchInput,
    updateSearch,
    sortBy,
    updateSort,
    statusFilter,
    updateStatusFilter,
    hasActiveFilters,
    clearFilters,
    page,
    totalPages,
    setPage,
    createLink,
    updateLink,
    toggleLinkEnabled,
    revokeLink,
    deleteLink,
    refreshAll,
  }), [
    isLoading, error, links, totalCount, stats, chartData, searchInput, updateSearch,
    sortBy, updateSort, statusFilter, updateStatusFilter, hasActiveFilters, clearFilters,
    page, totalPages, createLink, updateLink, toggleLinkEnabled, revokeLink, deleteLink, refreshAll,
  ]);
}
