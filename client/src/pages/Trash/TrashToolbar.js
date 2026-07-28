import { Trash2 } from "lucide-react";

function TrashToolbar({
  totalFiles,
  onEmptyTrash,
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">

      {/* Title Section */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          Trash
        </h1>

        <p className="text-gray-400 mt-1">
          {totalFiles} deleted file
          {totalFiles !== 1 && "s"}
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