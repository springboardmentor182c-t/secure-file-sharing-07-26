import { useCallback, useEffect, useMemo, useState } from 'react';
import { filesAPI, foldersAPI } from '../../../utils/api';

export function useMyFilesData() {
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [filesRes, foldersRes] = await Promise.allSettled([
        filesAPI.list(),
        foldersAPI.list(),
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
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

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
        await filesAPI.upload(formData, (pct) => setUploadProgress(pct));
      }
      await loadData();
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
      await foldersAPI.create(folderName.trim());
      await loadData();
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
    setSelectedCategory,
    setSearchQuery,
    refetch: loadData,
    uploadFiles,
    createFolder,
    deleteFile,
    deleteFolder,
  };
}
