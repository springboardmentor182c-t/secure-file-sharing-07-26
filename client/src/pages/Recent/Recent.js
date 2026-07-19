import { useEffect, useState } from "react";

function Recent() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("http://localhost:8000/api/recent/")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch recent files");
        return res.json();
      })
      .then((data) => setFiles(data))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <p className="text-gray-400 text-center mt-10">Loading...</p>;
  }

  if (error) {
    return (
      <p className="text-red-400 text-center mt-10">
        Failed to load recent files.
      </p>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-white text-3xl font-bold mb-6">Recent</h1>

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center mt-20 text-center">
          <div className="bg-slate-700/50 p-4 rounded-xl mb-4 w-14 h-14 flex items-center justify-center text-2xl">
            🕐
          </div>
          <p className="text-white font-semibold text-lg">Recent files</p>
          <p className="text-gray-400 text-sm mt-1">
            Files you've viewed or edited recently will appear here.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-white">
            <thead>
              <tr className="text-gray-400 text-sm border-b border-slate-700">
                <th className="py-2">Name</th>
                <th className="py-2">Owner</th>
                <th className="py-2">Category</th>
                <th className="py-2">Size (MB)</th>
                <th className="py-2">Action</th>
                <th className="py-2">Accessed</th>
              </tr>
            </thead>
            <tbody>
              {files.map((f) => (
                <tr key={f.file_id} className="border-b border-slate-800 text-sm">
                  <td className="py-2">{f.file_name}</td>
                  <td className="py-2">{f.owner_name}</td>
                  <td className="py-2">{f.category}</td>
                  <td className="py-2">{f.size_mb}</td>
                  <td className="py-2 capitalize">{f.action}</td>
                  <td className="py-2">
                    {new Date(f.accessed_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Recent;