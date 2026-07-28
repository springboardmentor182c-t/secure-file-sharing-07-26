import TrashRow from "./TrashRow";

function TrashTable({
  files,
  loading,
  onRestore,
  onDelete,
}) {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <p className="text-gray-400 text-lg">
          Loading trash files...
        </p>
      </div>
    );
  }

  if (!files.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-slate-900 rounded-xl border border-slate-800">
        <div className="text-6xl mb-4">🗑️</div>

        <h2 className="text-2xl font-semibold text-white">
          Trash is Empty
        </h2>

        <p className="text-gray-400 mt-2">
          Deleted files will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-900">
      <table className="min-w-full">
        <thead className="bg-slate-800">
          <tr>
            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              File Name
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Type
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Size
            </th>

            <th className="px-6 py-4 text-left text-sm font-semibold text-gray-300">
              Updated At
            </th>

            <th className="px-6 py-4 text-center text-sm font-semibold text-gray-300">
              Actions
            </th>
          </tr>
        </thead>

        <tbody>
          {files.map((file) => (
            <TrashRow
              key={file.id}
              file={file}
              onRestore={onRestore}
              onDelete={onDelete}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default TrashTable;