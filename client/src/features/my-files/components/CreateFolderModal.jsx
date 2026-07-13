import { useState } from 'react';

export default function CreateFolderModal({ isOpen, onClose, onCreateFolder }) {
  const [folderName, setFolderName] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  function handleSubmit(e) {
    e.preventDefault();
    if (!folderName.trim()) {
      setError('Folder name is required');
      return;
    }

    onCreateFolder(folderName.trim());
    setFolderName('');
    setError('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[#0F172A]/40 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog box */}
      <div className="relative w-full max-w-md transform rounded-2xl bg-white p-6 shadow-xl transition-all border border-[#E2E8F0] animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-[#E2E8F0] pb-4">
          <h3 className="text-lg font-bold text-[#0F172A] flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-50 text-[#D97706]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
            </span>
            Create Secure Folder
          </h3>
          <button
            onClick={onClose}
            type="button"
            className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#0F172A] focus:outline-none"
            aria-label="Close modal"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label htmlFor="folderName" className="block text-sm font-semibold text-[#0F172A]">
              Folder Name
            </label>
            <input
              id="folderName"
              type="text"
              value={folderName}
              onChange={(e) => {
                setFolderName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Legal_Documents"
              className="mt-1.5 block w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
            />
            {error && <p className="mt-1 text-xs font-semibold text-[#DC2626]">{error}</p>}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E2E8F0] pt-4">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#D97706] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-amber-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#D97706] focus:ring-offset-2"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
