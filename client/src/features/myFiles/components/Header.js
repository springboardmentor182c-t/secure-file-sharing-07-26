import React from "react";
import { PlusIcon, UploadIcon } from "../../../layout/icons";

export default function Header({ onNewFolder, onUploadClick, fileInputRef }) {
  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <header className="page-header flex items-center justify-end mb-4">
      <div className="page-header__actions flex items-center gap-3">
        <button type="button" className="btn btn--ghost flex items-center gap-2 px-3 py-2 rounded-xl bg-[#272938] border border-[#34364A] text-gray-300 hover:text-white text-xs font-semibold" onClick={onNewFolder}>
          <PlusIcon width={15} height={15} /> New folder
        </button>
        <button type="button" className="btn btn--primary flex items-center gap-2 px-4 py-2 rounded-xl bg-[#7C5CFC] hover:bg-[#6847EC] text-white text-xs font-semibold" onClick={handleUploadClick}>
          <UploadIcon width={15} height={15} /> Upload
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files?.length) onUploadClick(e.target.files);
            e.target.value = "";
          }}
        />
      </div>
    </header>
  );
}
