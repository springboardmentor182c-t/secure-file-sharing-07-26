import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  createFolder as apiCreateFolder,
  deleteFolder as apiDeleteFolder,
  downloadFile as apiDownloadFile,
  getStorageStats,
  listFiles,
  listFolders,
  moveFile as apiMoveFile,
  permanentlyDeleteFile as apiPermanentlyDeleteFile,
  renameFile as apiRenameFile,
  renameFolder as apiRenameFolder,
  restoreFile as apiRestoreFile,
  setFileCategory as apiSetFileCategory,
  toggleStar as apiToggleStar,
  trashFile as apiTrashFile,
  uploadFile as apiUploadFile,
} from "../services/filesApi";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 350;

export default function useMyFiles(initialView = "files") {
  const [view, setView] = useState(initialView); // "files" | "trash" | "starred" | "recent"
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [folderId, setFolderId] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [folders, setFolders] = useState([]);
  const [storageStats, setStorageStats] = useState(null);

  const [selectedIds, setSelectedIds] = useState([]);

  const requestId = useRef(0);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchQuery(searchInput);
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fetchFiles = useCallback(async () => {
    const thisRequest = ++requestId.current;
    setIsLoading(true);
    setError(null);
    try {
      const { files: fetched, pagination } = await listFiles({
        search: searchQuery,
        category: (view === "files" || view === "recent") ? category : undefined,
        folderId: view === "files" ? folderId : undefined,
        starred: view === "starred",
        sortBy,
        page,
        pageSize: PAGE_SIZE,
        trashed: view === "trash",
      });
      if (thisRequest !== requestId.current) return;
      setFiles(fetched);
      setTotalCount(pagination.total_items);
      setTotalPages(pagination.total_pages);
      setSelectedIds([]);
    } catch (err) {
      if (thisRequest !== requestId.current) return;
      setError(err.message || "Couldn't load files.");
      setFiles([]);
    } finally {
      if (thisRequest === requestId.current) setIsLoading(false);
    }
  }, [searchQuery, category, folderId, sortBy, page, view]);

  const fetchFolders = useCallback(async () => {
    try {
      setFolders(await listFolders());
    } catch {
      // Non-fatal: the file table still works without the folder list.
    }
  }, []);

  const fetchStorageStats = useCallback(async () => {
    try {
      setStorageStats(await getStorageStats());
    } catch {
      // Non-fatal.
    }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);
  useEffect(() => { fetchFolders(); }, [fetchFolders]);
  useEffect(() => { fetchStorageStats(); }, [fetchStorageStats]);

  useEffect(() => {
    if (page > totalPages) setPage(Math.max(1, totalPages));
  }, [totalPages, page]);

  const refreshAll = useCallback(() => {
    fetchFiles();
    fetchFolders();
    fetchStorageStats();
  }, [fetchFiles, fetchFolders, fetchStorageStats]);

  const changeView = useCallback((v) => {
    setView(v);
    setPage(1);
    setFolderId(null);
    if (v !== "files") setCategory("All");
  }, []);

  const changeCategory = useCallback((c) => {
    setCategory(c);
    setFolderId(null);
    setView("files");
    setPage(1);
  }, []);

  const changeFolder = useCallback((id) => {
    setFolderId(id);
    setCategory("All");
    setView("files");
    setPage(1);
  }, []);

  const changeSort = useCallback((s) => { setSortBy(s); setPage(1); }, []);
  const updateSearch = useCallback((q) => setSearchInput(q), []);

  const toggleSelected = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const toggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === files.length ? [] : files.map((f) => f.id)));
  }, [files]);
  const clearSelection = useCallback(() => setSelectedIds([]), []);

  // ---- Mutations (each refreshes so counts/lists stay accurate) ----------

  const upload = useCallback(async (fileList) => {
    const targetFolderId = view === "files" ? folderId : null;
    const targetCategory = view === "files" && category !== "All" ? category : undefined;
    const results = [];
    for (const file of Array.from(fileList)) {
      try {
        await apiUploadFile({ file, folderId: targetFolderId, category: targetCategory });
        results.push({ file, ok: true });
      } catch (err) {
        results.push({ file, ok: false, error: err.message });
      }
    }
    await refreshAll();
    return results;
  }, [view, folderId, category, refreshAll]);

  const rename = useCallback(async (id, name) => {
    await apiRenameFile(id, name);
    await refreshAll();
  }, [refreshAll]);

  const move = useCallback(async (id, targetFolderId) => {
    await apiMoveFile(id, targetFolderId);
    await refreshAll();
  }, [refreshAll]);

  const changeFileCategory = useCallback(async (id, newCategory) => {
    await apiSetFileCategory(id, newCategory);
    await refreshAll();
  }, [refreshAll]);

  const toggleStar = useCallback(async (id) => {
    await apiToggleStar(id);
    await refreshAll();
  }, [refreshAll]);

  const trash = useCallback(async (id) => {
    await apiTrashFile(id);
    await refreshAll();
  }, [refreshAll]);

  const restore = useCallback(async (id) => {
    await apiRestoreFile(id);
    await refreshAll();
  }, [refreshAll]);

  const permanentlyDelete = useCallback(async (id) => {
    await apiPermanentlyDeleteFile(id);
    await refreshAll();
  }, [refreshAll]);

  const download = useCallback(async (id, filename) => {
    await apiDownloadFile(id, filename);
  }, []);

  const createFolder = useCallback(async (name) => {
    await apiCreateFolder(name, null);
    await fetchFolders();
  }, [fetchFolders]);

  const renameFolder = useCallback(async (id, name) => {
    await apiRenameFolder(id, name);
    await fetchFolders();
  }, [fetchFolders]);

  const deleteFolder = useCallback(async (id) => {
    await apiDeleteFolder(id);
    if (folderId === id) setFolderId(null);
    await refreshAll();
  }, [folderId, refreshAll]);

  return useMemo(() => ({
    view, changeView,
    isLoading, error, files, totalCount, page, totalPages, setPage,
    searchQuery: searchInput, updateSearch,
    category, changeCategory,
    folderId, changeFolder,
    sortBy, changeSort,
    folders, storageStats,
    selectedIds, toggleSelected, toggleSelectAll, clearSelection,
    upload, rename, move, changeFileCategory, toggleStar, trash, restore, permanentlyDelete, download,
    createFolder, renameFolder, deleteFolder,
    refreshAll,
  }), [
    view, changeView, isLoading, error, files, totalCount, page, totalPages,
    searchInput, updateSearch, category, changeCategory, folderId, changeFolder,
    sortBy, changeSort, folders, storageStats, selectedIds, toggleSelected, toggleSelectAll, clearSelection,
    upload, rename, move, changeFileCategory, toggleStar, trash, restore, permanentlyDelete, download,
    createFolder, renameFolder, deleteFolder, refreshAll,
  ]);
}
