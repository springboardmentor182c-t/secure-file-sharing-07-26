import { useRef, useState } from 'react';
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
    setSelectedCategory,
    setSearchQuery,
    uploadFiles,
    createFolder,
    deleteFile,
    deleteFolder,
  } = useMyFilesData();

  const fileInputRef = useRef(null);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [statusMessage, setStatusMessage] = useState(null);

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
    if (!window.confirm('Are you sure you want to delete this folder?')) return;
    try {
      await deleteFolder(id);
      showNotification('Folder deleted.');
    } catch (err) {
      showNotification('Failed to delete folder.', true);
    }
  };

  return (
    <div className="mx-auto max-w-7xl">
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
      <header className="mb-8 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#4F46E5]">My Files</p>
            <h1 className="mt-2 text-3xl font-semibold text-[#0F172A]">Secure files and folder details</h1>
            <p className="mt-2 max-w-2xl text-sm text-[#64748B]">
              Upload, organize, and manage your encrypted project files and folder structures seamlessly.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => setShowNewFolderModal(true)}
              className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#475569] transition hover:bg-slate-50 hover:text-[#0F172A]"
            >
              📁 New Folder
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="rounded-2xl bg-[#4338CA] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3730A3] disabled:opacity-50"
            >
              {uploading ? `Uploading (${uploadProgress}%)` : '⬆️ Upload File'}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
      </header>

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="mb-8 rounded-3xl border border-[#EEF2FF] bg-[#F8FAFC] p-6 shadow-sm">
          <form onSubmit={handleCreateFolder} className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Enter folder name..."
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              className="flex-1 rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm outline-none focus:border-[#4F46E5]"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="rounded-2xl bg-[#4F46E5] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#3730A3]"
              >
                Create Folder
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewFolderModal(false);
                  setNewFolderName('');
                }}
                className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-2.5 text-sm font-semibold text-[#64748B] transition hover:bg-slate-50"
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
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-[#64748B]">Folders ({folderCards.length})</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {folderCards.map((folder) => (
              <FolderCard key={folder.id} {...folder} onDelete={handleDeleteFolder} />
            ))}
          </div>
        </section>
      )}

      {/* Filter Chips Bar */}
      <section className="mb-6 rounded-3xl border border-[#E2E8F0] bg-white p-6 shadow-sm shadow-slate-100">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[#0F172A]">All files</h2>
            <p className="mt-1 text-sm text-[#64748B]">
              {filteredFiles.length} file{filteredFiles.length === 1 ? '' : 's'} found
            </p>
          </div>
          <FilterChips chips={filterChips} activeId={selectedCategory} onChange={setSelectedCategory} />
        </div>
      </section>

      {/* Files Grid or Empty State */}
      {isLoading ? (
        <div className="flex h-48 items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white p-12 text-center text-slate-500">
          <div className="space-y-3">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#4F46E5] border-t-transparent"></div>
            <p className="text-sm font-medium">Loading files...</p>
          </div>
        </div>
      ) : filteredFiles.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredFiles.map((file) => (
            <FileCard key={file.id} file={file} onDelete={handleDeleteFile} />
          ))}
        </section>
      ) : (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto mb-4 text-4xl">📂</div>
          <h3 className="text-lg font-semibold text-[#0F172A]">
            {searchQuery ? `No files matching "${searchQuery}"` : 'No files uploaded yet'}
          </h3>
          <p className="mt-2 text-sm text-[#64748B]">
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
