import { useState } from 'react';

export default function UploadModal({ isOpen, onClose, onUpload }) {
  const [name, setName] = useState('');
  const [type, setType] = useState('PDF');
  const [status, setStatus] = useState('Encrypted');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const fileTypes = ['PDF', 'DOCX', 'XLSX', 'FIG', 'JPG', 'PNG', 'ZIP', 'MP4'];
  const statusOptions = ['Encrypted', 'Shared', 'Private', 'Pending Review'];

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('File name is required');
      return;
    }

    // Generate mock size between 1.0 MB and 45.0 MB
    const randomSize = (Math.random() * 44 + 1).toFixed(1);
    
    // Add extension if not present in the name
    let finalName = name.trim();
    const extension = `.${type.toLowerCase()}`;
    if (!finalName.toLowerCase().endsWith(extension)) {
      finalName += extension;
    }

    onUpload({
      id: `file-${Date.now()}`,
      name: finalName,
      type,
      owner: 'Abhishek',
      lastModified: 'Today, ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      size: `${randomSize} MB`,
      status,
    });

    setName('');
    setType('PDF');
    setStatus('Encrypted');
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
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-[#4F46E5]">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </span>
            Upload Secure File
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
            <label htmlFor="filename" className="block text-sm font-semibold text-[#0F172A]">
              File Name
            </label>
            <input
              id="filename"
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Q2_Financial_Statement"
              className="mt-1.5 block w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3.5 py-2.5 text-sm text-[#0F172A] placeholder-[#94A3B8] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
            />
            {error && <p className="mt-1 text-xs font-semibold text-[#DC2626]">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="filetype" className="block text-sm font-semibold text-[#0F172A]">
                File Type
              </label>
              <select
                id="filetype"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
              >
                {fileTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filestatus" className="block text-sm font-semibold text-[#0F172A]">
                Security Status
              </label>
              <select
                id="filestatus"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="mt-1.5 block w-full rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-sm text-[#0F172A] focus:border-[#4F46E5] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end gap-3 border-t border-[#E2E8F0] pt-4">
            <button
              onClick={onClose}
              type="button"
              className="rounded-lg border border-[#E2E8F0] bg-white px-4 py-2 text-sm font-semibold text-[#64748B] hover:bg-[#F8FAFC] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-semibold text-white shadow-md hover:bg-indigo-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2"
            >
              Encrypt & Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
