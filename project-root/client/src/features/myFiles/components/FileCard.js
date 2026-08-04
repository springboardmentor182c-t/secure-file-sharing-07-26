const getFileIcon = (file) => {
  const mime = file?.mimetype || file?.file_type || '';
  const name = file?.name || file?.original_name || '';
  if (mime.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(name)) return '🖼️';
  if (mime.startsWith('video/') || /\.(mp4|webm|avi|mov)$/i.test(name)) return '🎬';
  if (mime.startsWith('audio/') || /\.(mp3|wav|ogg)$/i.test(name)) return '🎵';
  if (mime.includes('pdf') || /\.pdf$/i.test(name)) return '📕';
  if (mime.includes('spreadsheet') || mime.includes('excel') || /\.(xlsx|xls|csv)$/i.test(name)) return '📊';
  if (mime.includes('zip') || mime.includes('compressed') || /\.(zip|tar|gz|7z)$/i.test(name)) return '📦';
  return '📄';
};

const formatSize = (size) => {
  if (typeof size === 'string') return size;
  if (!size || isNaN(size)) return '0 B';
  if (size < 1024) return `${size} B`;
  if (size < 1048576) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / 1048576).toFixed(1)} MB`;
};

function Tag({ label }) {
  return (
    <span className="inline-flex rounded-full bg-[#EEF2FF] px-2.5 py-1 text-xs font-semibold text-[#3730A3]">
      {label}
    </span>
  );
}

export default function FileCard({ file, onDelete, onDownload }) {
  const fileName = file?.name || file?.original_name || 'Untitled File';
  const category = file?.category || file?.file_type || file?.mimetype?.split('/')[1]?.toUpperCase() || 'General';
  const displaySize = formatSize(file?.size);
  const displayModified = file?.modified || file?.last_modified || (file?.created_at ? new Date(file.created_at).toLocaleDateString() : 'Recent');
  const isEncrypted = file?.encrypted !== false; // Default encrypted badge to true if not specified
  const tags = Array.isArray(file?.tags) ? file.tags : [];

  return (
    <article className="group relative rounded-3xl border border-[#E2E8F0] bg-white p-5 shadow-sm shadow-slate-100 transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-3xl bg-[#EEF2FF] text-xl">
          {getFileIcon(file)}
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-[#475569]">
            {category}
          </span>
          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(file.id)}
              className="rounded-full p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
              title="Delete File"
            >
              🗑️
            </button>
          )}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="truncate text-base font-semibold text-[#0F172A]" title={fileName}>
          {fileName}
        </h3>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tag key={tag} label={tag} />
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between gap-3 text-sm text-[#64748B]">
        <p>{displaySize}</p>
        <p>{displayModified}</p>
      </div>

      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span
          className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-medium ${
            isEncrypted ? 'bg-[#ECFDF5] text-[#166534]' : 'bg-[#F8FAFC] text-[#64748B]'
          }`}
        >
          {isEncrypted ? '🔒 Encrypted' : '🔓 Unencrypted'}
        </span>
        {onDownload ? (
          <button
            type="button"
            onClick={() => onDownload(file)}
            className="text-sm font-semibold text-[#4F46E5] transition hover:text-[#3730A3]"
          >
            Download
          </button>
        ) : (
          <span className="text-xs text-slate-400">Protected</span>
        )}
      </div>
    </article>
  );
}
