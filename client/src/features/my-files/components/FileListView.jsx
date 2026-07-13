const STATUS_BADGE_STYLES = {
  Encrypted: 'bg-green-50 text-[#16A34A] ring-green-100',
  Shared: 'bg-indigo-50 text-[#4F46E5] ring-indigo-100',
  Private: 'bg-slate-100 text-[#0F172A] ring-slate-200',
  'Pending Review': 'bg-amber-50 text-[#F59E0B] ring-amber-100',
};

export default function FileListView({ files, onDownload, onToggleShare, onToggleEncrypt, onDelete }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E8F0] bg-white shadow-sm">
      <table className="min-w-[800px] w-full divide-y divide-[#E2E8F0] text-left">
        <thead className="bg-[#F8FAFC]">
          <tr>
            {['File Name', 'Owner', 'Last Modified', 'Size', 'Status', 'Actions'].map((heading) => (
              <th key={heading} scope="col" className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-[#64748B]">
                {heading}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-[#E2E8F0] bg-white">
          {files.map((file) => (
            <tr key={file.id} className="transition hover:bg-[#F8FAFC]/60">
              {/* File name and icon */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-xs font-extrabold text-[#4F46E5] ring-1 ring-indigo-100">
                    {file.type}
                  </span>
                  <span className="font-semibold text-[#0F172A]">{file.name}</span>
                </div>
              </td>

              {/* Owner */}
              <td className="px-6 py-4 text-sm text-[#0F172A] font-medium">{file.owner}</td>

              {/* Last Modified */}
              <td className="px-6 py-4 text-sm text-[#64748B]">{file.lastModified}</td>

              {/* Size */}
              <td className="px-6 py-4 text-sm text-[#64748B]">{file.size}</td>

              {/* Status */}
              <td className="px-6 py-4">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                    STATUS_BADGE_STYLES[file.status] ?? STATUS_BADGE_STYLES.Private
                  }`}
                >
                  {file.status}
                </span>
              </td>

              {/* Actions */}
              <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                  {/* Download */}
                  <button
                    onClick={() => onDownload(file)}
                    type="button"
                    className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#4F46E5] focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10"
                    title="Download decrypted copy"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>

                  {/* Share Toggle */}
                  <button
                    onClick={() => onToggleShare(file)}
                    type="button"
                    className={`rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10 ${
                      file.status === 'Shared' ? 'text-[#4F46E5] bg-indigo-50' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#4F46E5]'
                    }`}
                    title={file.status === 'Shared' ? 'Revoke sharing link' : 'Generate secure sharing link'}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 10.742l4.63-2.315a3 3 0 110 3.146l-4.63 2.316a3 3 0 110-3.147z" />
                    </svg>
                  </button>

                  {/* Encrypt/Decrypt Toggle */}
                  <button
                    onClick={() => onToggleEncrypt(file)}
                    type="button"
                    className={`rounded-lg p-1.5 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/10 ${
                      file.status === 'Encrypted' ? 'text-[#16A34A] bg-green-50' : 'text-[#64748B] hover:bg-[#F8FAFC] hover:text-[#16A34A]'
                    }`}
                    title={file.status === 'Encrypted' ? 'Decrypt file' : 'Encrypt file with AES-256'}
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
                    className="rounded-lg p-1.5 text-[#64748B] hover:bg-[#DC2626]/10 hover:text-[#DC2626] focus:outline-none focus:ring-2 focus:ring-[#DC2626]/10"
                    title="Delete permanently"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
