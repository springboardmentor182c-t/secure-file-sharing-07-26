import { useCallback, useEffect, useMemo, useState } from 'react';
import { filesAPI, foldersAPI } from '../../../utils/api';
import { events, EVENTS } from '../../../utils/events';

export function useMyFilesData() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [folderPath, setFolderPath] = useState([]);
  const activeFolder = folderPath[folderPath.length - 1];

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [filesRes, foldersRes] = await Promise.allSettled([
        filesAPI.list(activeFolder?.id),
        foldersAPI.list(activeFolder?.id),
      ]);

      if (filesRes.status === 'fulfilled') {
        const rawFiles = filesRes.value?.data?.files || filesRes.value?.data || [];
        setFiles(Array.isArray(rawFiles) ? rawFiles : []);
      } else {
        setFiles([]);
      }

      if (foldersRes.status === 'fulfilled') {
        const rawFolders = foldersRes.value?.data || [];
        setFolders(Array.isArray(rawFolders) ? rawFolders : []);
      } else {
        setFolders([]);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load files');
    } finally {
      setIsLoading(false);
    }
  }, [activeFolder?.id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    const returnToRoot = () => {
      setFolderPath([]);
      setSelectedCategory('all');
      setSearchQuery('');
    };
    return events.on(EVENTS.MY_FILES_ROOT, returnToRoot);
  }, []);

  // Dynamically generated filter categories based on actual files
  const filterChips = useMemo(() => {
    const categories = new Set();
    files.forEach((file) => {
      const cat = file.category || file.file_type || file.mimetype?.split('/')[0];
      if (cat) {
        categories.add(cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase());
      }
    });

    const chips = [{ id: 'all', label: 'All' }];
    categories.forEach((cat) => {
      chips.push({ id: cat.toLowerCase(), label: cat });
    });

    return chips;
  }, [files]);

  // Filter files by selected category and search query
  const filteredFiles = useMemo(() => {
    return files.filter((file) => {
      const cat = (file.category || file.file_type || file.mimetype?.split('/')[0] || '').toLowerCase();
      const matchesCategory = selectedCategory === 'all' || cat === selectedCategory;

      const fileName = (file.name || file.original_name || '').toLowerCase();
      const matchesSearch = !searchQuery || fileName.includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [files, selectedCategory, searchQuery]);

  // File upload handler
  const uploadFiles = async (fileList) => {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      for (const file of fileList) {
        const formData = new FormData();
        formData.append('file', file);
        await filesAPI.upload(formData, (pct) => setUploadProgress(pct), activeFolder?.id);
      }
      await loadData();
      events.emit(EVENTS.FILE_UPLOADED);
      events.emit(EVENTS.STORAGE_CHANGED);
      events.emit(EVENTS.NOTIFICATIONS_CHANGED);
    } catch (err) {
      console.error('File upload failed:', err);
      throw err;
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  // Create folder handler
  const createFolder = async (folderName) => {
    if (!folderName || !folderName.trim()) return;
    try {
      await foldersAPI.create(folderName.trim(), activeFolder?.id);
      await loadData();
      events.emit(EVENTS.NOTIFICATIONS_CHANGED);
    } catch (err) {
      console.error('Create folder failed:', err);
      throw err;
    }
  };

  // Delete file handler
  const deleteFile = async (id) => {
    try {
      await filesAPI.delete(id);
      setFiles((prev) => prev.filter((f) => f.id !== id));
      events.emit(EVENTS.FILE_DELETED, id);
      events.emit(EVENTS.STORAGE_CHANGED);
    } catch (err) {
      console.error('Delete file failed:', err);
      throw err;
    }
  };

  // Delete folder handler
  const deleteFolder = async (id) => {
    try {
      await foldersAPI.delete(id);
      setFolders((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      console.error('Delete folder failed:', err);
      throw err;
    }
  };

  const downloadFile = async (file) => {
    const response = await filesAPI.download(file.id);
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name || file.original_name || 'download';
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    events.emit(EVENTS.NOTIFICATIONS_CHANGED);
  };

  const moveFile = async (fileId, folderId) => {
    const response = await filesAPI.move(fileId, folderId);
    await loadData();
    return response.data;
  };

  const openFolder = (folder) => {
    setFolderPath((current) => [...current, folder]);
    setSelectedCategory('all');
    setSearchQuery('');
  };

  const goToFolder = (index) => {
    setFolderPath((current) => current.slice(0, index + 1));
    setSelectedCategory('all');
    setSearchQuery('');
  };

  return {
    files,
    folders,
    folderCards: folders.map((f, i) => ({
      id: f.id || `folder-${i}`,
      title: f.name || 'Untitled Folder',
      subtitle: `${f.item_count ?? 0} item${f.item_count === 1 ? '' : 's'}`,
      color: i % 3 === 0 ? 'from-[#E0F2FE] to-[#DBEAFE]' : i % 3 === 1 ? 'from-[#E9D5FF] to-[#EDE9FE]' : 'from-[#DCFCE7] to-[#ECFDF5]',
    })),
    filterChips,
    selectedCategory,
    searchQuery,
    filteredFiles,
    isLoading,
    error,
    uploading,
    uploadProgress,
    folderPath,
    setSelectedCategory,
    setSearchQuery,
    refetch: loadData,
    uploadFiles,
    createFolder,
    deleteFile,
    deleteFolder,
    downloadFile,
    moveFile,
    openFolder,
    goToFolder,
    goToRoot: () => {
      setFolderPath([]);
      setSelectedCategory('all');
      setSearchQuery('');
    },
  };
}
