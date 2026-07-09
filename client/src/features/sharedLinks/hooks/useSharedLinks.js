import { useMemo, useState, useCallback, useEffect } from "react";
import { createInitialLinks } from "../data/mockLinks";
import {
  computeStats, filterLinks, sortLinks, buildChartData,
  generateShareUrl, getEffectiveStatus,
} from "../utils/linkUtils";

const PAGE_SIZE = 10;

/**
 * Owns all Shared Links data + UI state: the mock "backend" for this module.
 * Swap the initial state / mutators for real API calls once the endpoints
 * exist — the shape returned here is designed to stay the same either way.
 */
export default function useSharedLinks() {
  const [links, setLinks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  // Simulate an initial fetch so the LoadingSkeleton has a moment to show.
  useEffect(() => {
    const t = setTimeout(() => {
      setLinks(createInitialLinks());
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  const filteredSorted = useMemo(() => {
    let result = filterLinks(links, searchQuery);
    if (statusFilter !== "all") {
      result = result.filter((l) => getEffectiveStatus(l) === statusFilter);
    }
    return sortLinks(result, sortBy);
  }, [links, searchQuery, sortBy, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredSorted.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const pageLinks = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filteredSorted.slice(start, start + PAGE_SIZE);
  }, [filteredSorted, safePage]);

  const stats = useMemo(() => computeStats(links), [links]);
  const chartData = useMemo(() => buildChartData(links), [links]);

  const resetToFirstPage = useCallback(() => setPage(1), []);

  const updateSearch = useCallback((q) => {
    setSearchQuery(q);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const updateSort = useCallback((s) => {
    setSortBy(s);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const updateStatusFilter = useCallback((s) => {
    setStatusFilter(s);
    resetToFirstPage();
  }, [resetToFirstPage]);

  const createLink = useCallback((formValues) => {
    const newLink = {
      id: `lnk_${Date.now()}`,
      fileName: formValues.fileName,
      fileType: formValues.fileType || "pdf",
      shareUrl: generateShareUrl(),
      createdAt: new Date(),
      expiresAt: formValues.expiresAt ? new Date(formValues.expiresAt) : null,
      views: 0,
      downloads: 0,
      access: formValues.access,
      status: "active",
      passwordProtected: !!formValues.password,
      allowDownload: !!formValues.allowDownload,
      recipientEmail: formValues.recipientEmail,
    };
    setLinks((prev) => [newLink, ...prev]);
    resetToFirstPage();
    return newLink;
  }, [resetToFirstPage]);

  const updateLink = useCallback((id, patch) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }, []);

  const toggleLinkEnabled = useCallback((id) => {
    setLinks((prev) => prev.map((l) => {
      if (l.id !== id) return l;
      const nextStatus = l.status === "disabled" ? "active" : "disabled";
      return { ...l, status: nextStatus };
    }));
  }, []);

  const revokeLink = useCallback((id) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, status: "revoked" } : l)));
  }, []);

  const deleteLink = useCallback((id) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const registerView = useCallback((id) => {
    setLinks((prev) => prev.map((l) => (l.id === id ? { ...l, views: l.views + 1 } : l)));
  }, []);

  return {
    isLoading,
    links,
    pageLinks,
    totalCount: filteredSorted.length,
    stats,
    chartData,
    searchQuery,
    updateSearch,
    sortBy,
    updateSort,
    statusFilter,
    updateStatusFilter,
    page: safePage,
    totalPages,
    setPage,
    createLink,
    updateLink,
    toggleLinkEnabled,
    revokeLink,
    deleteLink,
    registerView,
  };
}
