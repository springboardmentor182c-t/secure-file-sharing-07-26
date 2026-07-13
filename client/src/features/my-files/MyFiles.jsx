import { useState, useRef, useCallback } from 'react';

// ─── File type icon config ─────────────────────────────────────────────────
const FILE_TYPE_CONFIG = {
  PDF:  { bg: '#FEE2E2', color: '#DC2626', label: 'PDF' },
  DOCX: { bg: '#DBEAFE', color: '#2563EB', label: 'W'  },
  DOC:  { bg: '#DBEAFE', color: '#2563EB', label: 'W'  },
  XLSX: { bg: '#DCFCE7', color: '#16A34A', label: 'X'  },
  XLS:  { bg: '#DCFCE7', color: '#16A34A', label: 'X'  },
  PPTX: { bg: '#FEF3C7', color: '#D97706', label: 'P'  },
  PNG:  { bg: '#EDE9FE', color: '#7C3AED', label: 'IMG'},
  JPG:  { bg: '#EDE9FE', color: '#7C3AED', label: 'IMG'},
  JPEG: { bg: '#EDE9FE', color: '#7C3AED', label: 'IMG'},
  ZIP:  { bg: '#F1F5F9', color: '#475569', label: 'ZIP'},
};

function getFileType(name) {
  const ext = name.split('.').pop()?.toUpperCase() ?? '';
  return FILE_TYPE_CONFIG[ext] ?? { bg: '#F1F5F9', color: '#475569', label: ext.slice(0, 3) || 'FILE' };
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

// Simulate a random file size between 1 MB and 48 MB
function randomSize() {
  return Math.floor(Math.random() * 47 * 1024 * 1024) + 1 * 1024 * 1024;
}

let idCounter = 0;
function makeFileEntry(name, sizeBytes) {
  return {
    id: `upload-${++idCounter}-${Date.now()}`,
    name,
    sizeBytes,
    progress: 0,   // 0-100
    done: false,
  };
}

// ─── File type badge ───────────────────────────────────────────────────────
function FileTypeBadge({ name }) {
  const cfg = getFileType(name);
  return (
    <span
      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-extrabold"
      style={{ background: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ─── Single upload row ──────────────────────────────────────────────────────
function UploadRow({ file, onRemove }) {
  const loaded = Math.round((file.progress / 100) * file.sizeBytes);
  return (
    <li className="flex items-center gap-3 py-3 border-b border-slate-100 last:border-0">
      <FileTypeBadge name={file.name} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-[#0F172A]">{file.name}</p>
          <span className="shrink-0 text-xs font-bold text-[#16A34A]">{file.progress}%</span>
        </div>
        <p className="mb-1.5 text-xs text-slate-400">
          {formatBytes(loaded)} / {formatBytes(file.sizeBytes)}
        </p>
        {/* Progress bar */}
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#16A34A] transition-all duration-300"
            style={{ width: `${file.progress}%` }}
          />
        </div>
      </div>

      {/* Action icon */}
      <button
        onClick={() => onRemove(file.id)}
        type="button"
        className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus:outline-none"
        aria-label={file.done ? 'Remove file' : 'Cancel upload'}
      >
        {file.done ? (
          <svg className="h-5 w-5 text-[#16A34A]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )}
      </button>
    </li>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────
export default function MyFiles() {
  const [uploads, setUploads] = useState([
    { id: 'demo-1', name: 'Q2 Financial Report.pdf',  sizeBytes: 4.8  * 1024 * 1024, progress: 50,  done: false },
    { id: 'demo-2', name: 'Project Proposal.docx',    sizeBytes: 12   * 1024 * 1024, progress: 100, done: true  },
    { id: 'demo-3', name: 'Budget Plan.xlsx',          sizeBytes: 3.6  * 1024 * 1024, progress: 100, done: true  },
  ]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const timerRef = useRef({});

  const startProgress = useCallback((id) => {
    // Simulate incremental progress
    timerRef.current[id] = setInterval(() => {
      setUploads((prev) =>
        prev.map((f) => {
          if (f.id !== id) return f;
          const next = Math.min(f.progress + Math.floor(Math.random() * 12) + 5, 100);
          if (next >= 100) {
            clearInterval(timerRef.current[id]);
            return { ...f, progress: 100, done: true };
          }
          return { ...f, progress: next };
        })
      );
    }, 280);
  }, []);

  function addFiles(fileList) {
    const newEntries = Array.from(fileList).map((f) => makeFileEntry(f.name, f.size || randomSize()));
    setUploads((prev) => [...newEntries, ...prev]);
    newEntries.forEach((e) => startProgress(e.id));
  }

  function handleBrowse(e) {
    addFiles(e.target.files);
    e.target.value = '';
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    addFiles(e.dataTransfer.files);
  }

  function handleRemove(id) {
    clearInterval(timerRef.current[id]);
    setUploads((prev) => prev.filter((f) => f.id !== id));
  }

  const PREVIEW_COUNT = 3;
  const shown = uploads.slice(0, PREVIEW_COUNT);
  const hiddenCount = uploads.length - PREVIEW_COUNT;

  return (
    <main className="min-h-screen bg-[#F5F7FA] px-4 py-10 sm:px-8">
      <div className="mx-auto max-w-xl">

        {/* Card */}
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm border border-slate-100">

          {/* Card header */}
          <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#4F46E5] text-xs font-bold text-white">
              1
            </span>
            <h1 className="text-base font-bold text-[#0F172A]">Secure File Upload</h1>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition-colors ${
                isDragging
                  ? 'border-[#4F46E5] bg-indigo-50'
                  : 'border-slate-200 bg-white hover:border-[#4F46E5] hover:bg-indigo-50/30'
              }`}
            >
              {/* Cloud icon */}
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50">
                <svg className="h-8 w-8 text-[#4F46E5]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <p className="text-sm font-semibold text-[#0F172A]">Drag &amp; drop files here</p>
              <p className="text-xs text-slate-400">or</p>

              {/* Browse button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-lg bg-[#4F46E5] px-6 py-2.5 text-sm font-semibold text-white shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2 transition-colors"
              >
                Browse Files
              </button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleBrowse}
                accept=".jpg,.jpeg,.png,.pdf,.docx,.xlsx,.pptx,.zip"
              />

              <p className="mt-1 text-[11px] text-slate-400">Maximum file size: 2 GB</p>
              <p className="text-[11px] text-slate-400">
                Allowed types: JPG, PNG, PDF, DOCX, XLSX, PPTX, ZIP
              </p>
            </div>

            {/* Upload list */}
            {uploads.length > 0 && (
              <div>
                <ul className="divide-y divide-slate-100">
                  {shown.map((file) => (
                    <UploadRow key={file.id} file={file} onRemove={handleRemove} />
                  ))}
                </ul>

                {/* View all link */}
                {hiddenCount > 0 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#4F46E5] hover:underline focus:outline-none"
                    >
                      View all uploads ({uploads.length}) &rarr;
                    </button>
                  </div>
                )}

                {hiddenCount <= 0 && uploads.length > 0 && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      className="text-sm font-semibold text-[#4F46E5] hover:underline focus:outline-none"
                    >
                      View all uploads &rarr;
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
