import { Trash2 } from "lucide-react";

function TrashToolbar({
  totalFiles,
  onEmptyTrash,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

      <div>
        <p className="text-xs text-gray-400">
          {totalFiles} deleted file{totalFiles !== 1 && "s"} in system trash
        </p>
      </div>


      {/* Action Button */}
      <button
        onClick={onEmptyTrash}
        disabled={totalFiles === 0}
        className={`
          flex items-center justify-center gap-2
          px-5 py-3 rounded-lg
          font-semibold transition
          ${
            totalFiles === 0
              ? "bg-gray-600 cursor-not-allowed text-gray-300"
              : "bg-red-600 hover:bg-red-700 text-white"
          }
        `}
      >
        <Trash2 size={18} />

        Empty Trash
      </button>

    </div>
  );
}

export default TrashToolbar;