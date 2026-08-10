import { useRef, useState } from 'react';

export default function FolderCard({ id, title, subtitle, onDelete, onOpen, onFileDrop, pointerDraggedFile }) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const suppressClickRef = useRef(false);

  const handleDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDropTarget(true);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDropTarget(false);
    try {
      const file = JSON.parse(event.dataTransfer.getData('application/x-trustshare-file'));
      if (file?.id) onFileDrop?.({ id, name: title }, file);
    } catch {
      // Ignore unrelated drag payloads.
    }
  };

  const handlePointerUp = (event) => {
    if (!pointerDraggedFile) return;
    event.preventDefault();
    event.stopPropagation();
    suppressClickRef.current = true;
    window.setTimeout(() => {
      suppressClickRef.current = false;
    }, 0);
    setIsDropTarget(false);
    onFileDrop?.({ id, name: title }, pointerDraggedFile);
  };

  const handleOpen = () => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false;
      return;
    }
    onOpen?.({ id, name: title });
  };

  return (
    <article
      className={`my-files-card my-files-folder group relative cursor-pointer p-5 transition hover:-translate-y-0.5 ${isDropTarget ? 'my-files-folder--drop-target' : ''}`}
      onClick={handleOpen}
      onKeyDown={(event) => event.key === 'Enter' && onOpen?.({ id, name: title })}
      onDragEnter={handleDragOver}
      onDragOver={handleDragOver}
      onDragLeave={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsDropTarget(false);
      }}
      onDrop={handleDrop}
      onPointerEnter={() => pointerDraggedFile && setIsDropTarget(true)}
      onPointerLeave={() => pointerDraggedFile && setIsDropTarget(false)}
      onPointerUp={handlePointerUp}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="rounded-2xl bg-white/80 p-3 text-[#3730A3] shadow-sm shadow-slate-100">📁</div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[#475569] shadow-sm shadow-slate-100">
            Folder
          </span>
          {onDelete && id && (
            <button
              type="button"
              onClick={(event) => { event.stopPropagation(); onDelete(id); }}
              className="rounded-full p-1 text-slate-400 opacity-0 transition group-hover:opacity-100 hover:bg-rose-50 hover:text-rose-600"
              title="Delete Folder"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
      <h3 className="my-files-title mt-5 text-lg font-semibold text-[#0F172A]">{title}</h3>
      <p className="my-files-muted mt-2 text-sm text-[#475569]">{subtitle}</p>
    </article>
  );
}
