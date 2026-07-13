const STATUS_BADGE_STYLES = {
  Encrypted: 'bg-green-50 text-[#16A34A] ring-green-100',
  Shared: 'bg-indigo-50 text-[#4F46E5] ring-indigo-100',
  Private: 'bg-slate-100 text-[#0F172A] ring-slate-200',
  'Pending Review': 'bg-amber-50 text-[#F59E0B] ring-amber-100',
};

export default function FileGridView({ files, onDownload, onToggleShare, onToggleEncrypt, onDelete }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <article
          key={file.id}
          className="group relative flex flex-col justify-between rounded-xl border border-[#E2E8F0] bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
        >
          {/* Card Header Actions */}
          <div className="flex items-center justify-between">
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-xs font-extrabold text-[#4F46E5] ring-1 ring-indigo-100">
              {file.type}
            </span>
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                STATUS_BADGE_STYLES[file.status] ?? STATUS_BADGE_STYLES.Private
              }`}
            >
              {file.status}
            </span>
          </div>

          {/* Card Body - Large File Name */}
          <div className="my-6">
            <div className="flex items-center gap-3">
              <svg className="h-8 w-8 text-[#94A3B8] transition group-hover:text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h4 className="truncate text-sm font-bold text-[#0F172A] w-full" title={file.name}>
                {file.name}
              </h4>
            </div>
            <p className="mt-2 text-xs text-[#64748B] flex items-center gap-2">
              <span>{file.size}</span>
              <span className="h-1 w-1 rounded-full bg-[#E2E8F0]" />
              <span>{file.lastModified}</span>
            </p>
          </div>

          {/* Card Footer - Info & Action Bar */}
          <div className="border-t border-[#E2E8F0] pt-4 flex items-center justify-between">
            <span className="text-xs font-semibold text-[#0F172A]">By {file.owner}</span>
            
            <div className="flex items-center gap-1">
              {/* Download */}
              <button
                onClick={() => onDownload(file)}
                type="button"
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#4F46E5] focus:outline-none"
                title="Download"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Share Toggle */}
              <button
                onClick={() => onToggleShare(file)}
                type="button"
                className={`rounded-lg p-1.5 focus:outline-none ${
                  file.status === 'Shared' ? 'text-[#4F46E5] bg-indigo-50' : 'text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
                title="Share"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.63-2.315a3 3 0 110 3.146l-4.63 2.316a3 3 0 110-3.147z" />
                </svg>
              </button>

              {/* Encrypt/Decrypt Toggle */}
              <button
                onClick={() => onToggleEncrypt(file)}
                type="button"
                className={`rounded-lg p-1.5 focus:outline-none ${
                  file.status === 'Encrypted' ? 'text-[#16A34A] bg-green-50' : 'text-[#64748B] hover:bg-[#F8FAFC]'
                }`}
                title={file.status === 'Encrypted' ? 'Decrypt' : 'Encrypt'}
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {file.status === 'Encrypted' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                  )}
                </svg>
              </button>

              {/* Delete */}
              <button
                onClick={() => onDelete(file)}
                type="button"
                className="rounded-lg p-1.5 text-[#64748B] hover:bg-red-50 hover:text-[#DC2626] focus:outline-none"
                title="Delete"
              >
                <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
