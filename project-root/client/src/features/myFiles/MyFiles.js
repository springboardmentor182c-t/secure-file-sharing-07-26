import { useEffect, useRef, useState } from 'react';
import FolderCard from './components/FolderCard';
import FileCard from './components/FileCard';
import FilterChips from './components/FilterChips';
import SearchBar from './components/SearchBar';
import { useMyFilesData } from './hooks/useMyFilesData';

export default function MyFiles() {
  const {
    folderCards,
    filterChips,
    selectedCategory,
    searchQuery,
    filteredFiles,
    isLoading,
    uploading,
    uploadProgress,
    folderPath,
    setSelectedCategory,
    setSearchQuery,
    uploadFiles,
    createFolder,
    deleteFile,
    deleteFolder,
    downloadFile,
    moveFile,
    openFolder,
    goToFolder,
    goToRoot,
  } = useMyFilesData();

  const fileInputRef = useRef(null);
  const moveInProgressRef = useRef(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);
  const [pointerDraggedFile, setPointerDraggedFile] = useState(null);

  const showNotification = (msg, isError = false) => {
    setStatusMessage({ text: msg, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  const handleFileChange = async (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;
    try {
      await uploadFiles(selectedFiles);
      showNotification(`${selectedFiles.length} file(s) uploaded successfully!`);
    } catch (err) {
      showNotification('File upload failed. Please try again.', true);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCreateFolder = async (e) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      await createFolder(newFolderName.trim());
      showNotification(`Folder "${newFolderName.trim()}" created!`);
      setNewFolderName('');
      setShowNewFolderModal(false);
    } catch (err) {
      showNotification('Failed to create folder.', true);
    }
  };

  const handleDeleteFile = async (id) => {
    if (!window.confirm('Are you sure you want to delete this file?')) return;
    try {
      await deleteFile(id);
      showNotification('File deleted.');
    } catch (err) {
      showNotification('Failed to delete file.', true);
    }
  };

  const handleDeleteFolder = async (id) => {
    const folder = folderCards.find((item) => item.id === id);
    const folderName = folder?.title || 'this folder';
    if (!window.confirm(`Delete "${folderName}" and all files and subfolders inside it? This cannot be undone.`)) return;
    try {
      await deleteFolder(id);
      showNotification(`Folder "${folderName}" and its contents were deleted.`);
    } catch (err) {
      showNotification(err.response?.data?.detail || 'Failed to delete folder.', true);
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFile(file);
    } catch (err) {
      showNotification('File download failed. Please try again.', true);
    }
  };

  useEffect(() => {
    if (!pointerDraggedFile) return undefined;
    const clearPointerDrag = () => setPointerDraggedFile(null);
    window.addEventListener('pointerup', clearPointerDrag);
    return () => window.removeEventListener('pointerup', clearPointerDrag);
  }, [pointerDraggedFile]);

  const handleFileDrop = async (folder, file) => {
    if (moveInProgressRef.current) return;
    moveInProgressRef.current = true;
    setPointerDraggedFile(null);
    try {
      await moveFile(file.id, folder.id);
      showNotification(`${file.name} moved to ${folder.name}`);
    } catch (err) {
      showNotification('File could not be moved. Please try again.', true);
    } finally {
      moveInProgressRef.current = false;
    }
  };

  return (
    <div className="my-files-page mx-auto max-w-7xl">
      {/* Toast Notification */}
      {statusMessage && (
        <div
          className={`fixed top-5 right-5 z-50 rounded-2xl px-5 py-3 text-sm font-medium shadow-lg transition-all ${
            statusMessage.isError
              ? 'bg-rose-50 text-rose-700 border border-rose-200'
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}
        >
          {statusMessage.isError ? '❌ ' : '✅ '}
          {statusMessage.text}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Page Header */}
      <header className="my-files-surface mb-8 rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">My Files</p>
            <h1 className="my-files-title mt-2 text-3xl font-semibold text-[#0F172A]">Secure files and folder details</h1>
            <p className="my-files-muted mt-2 max-w-2xl text-sm text-[#64748B]">
              Upload, organize, and manage your encrypted project files and folder structures seamlessly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNewFolderModal(true)}
              className="my-files-secondary-button rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-slate-50 hover:text-[#0F172A]"
            >
              📁 New Folder
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-[#4338CA] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3] disabled:opacity-50"
            >
              {uploading ? `Uploading (${uploadProgress}%)` : '⬆️ Upload File'}
            </button>
          </div>
        </div>

        <nav className="my-files-muted mt-5 flex flex-wrap items-center gap-2 text-sm text-[#64748B]" aria-label="Folder path">
          <button type="button" onClick={goToRoot} className="font-semibold text-[#4F46E5] hover:text-[#3730A3]">My Files</button>
          {folderPath.map((folder, index) => (
            <div className="flex items-center gap-2" key={folder.id}>
              <span>/</span>
              <button type="button" onClick={() => goToFolder(index)} className="font-semibold text-[#4F46E5] hover:text-[#3730A3]">{folder.name}</button>
            </div>
          ))}
        </nav>

        {/* Search Bar */}
        <div className="mt-6">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            onClear={() => setSearchQuery('')}
          />
        </div>
      </header>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="my-files-surface mb-8 rounded-lg border border-[#EEF2FF] bg-[#F8FAFC] p-6 shadow-sm">
          <form onSubmit={handleCreateFolder} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="my-files-input flex-1 rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5]"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-lg bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3730A3]"
              >
                Create Folder
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="my-files-secondary-button rounded-lg border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#64748B] transition hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Folders Section */}
      {folderCards.length > 0 && (
        <section className="mb-8 space-y-4">
          <h2 className="my-files-muted text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">Folders ({folderCards.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {folderCards.map((folder) => (
              <FolderCard
                key={folder.id}
                {...folder}
                onDelete={handleDeleteFolder}
                onOpen={openFolder}
                onFileDrop={handleFileDrop}
                pointerDraggedFile={pointerDraggedFile}
              />
            ))}
          </div>
        </section>
      )}

      {/* Filter Chips Bar */}
      <section className="my-files-surface mb-6 rounded-lg border border-[#E2E8F0] bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="my-files-title text-lg font-semibold text-[#0F172A]">All files</h2>
            <p className="my-files-muted mt-1 text-sm text-[#64748B]">
              {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} found
            </p>
          </div>
          <FilterChips chips={filterChips} activeId={selectedCategory} onChange={setSelectedCategory} />
        </div>
      </section>

      {/* Files Grid or Empty State */}
      {isLoading ? (
        <div className="my-files-surface my-files-muted flex h-48 items-center justify-center rounded-lg border border-[#E2E8F0] bg-white p-12 text-center text-slate-500">
          <div className="space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#4F46E5] border-t-transparent"></div>
            <p className="text-sm font-medium">Loading files...</p>
          </div>
        </div>
      ) : filteredFiles.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFiles.map((file) => (
            <FileCard
              key={file.id}
              file={file}
              onDelete={handleDeleteFile}
              onDownload={handleDownload}
              onPointerDragStart={setPointerDraggedFile}
            />
          ))}
        </section>
      ) : (
        <div className="my-files-surface rounded-lg border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 text-4xl">📂</div>
          <h3 className="my-files-title text-lg font-semibold text-[#0F172A]">
            {searchQuery ? `No files matching "${searchQuery}"` : 'No files uploaded yet'}
          </h3>
          <p className="my-files-muted mt-2 text-sm text-[#64748B]">
            {searchQuery
              ? 'Try searching with a different term or clear filters.'
              : 'Upload your first file to securely store and share documents.'}
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#4F46E5] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3]"
            >
              ⬆️ Upload File
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
