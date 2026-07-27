import "./RecentFiles.css";
import {
  FaFilePdf,
  FaFileWord,
  FaFileArchive,
  FaFilePowerpoint,
} from "react-icons/fa";
import { SiFigma } from "react-icons/si";
import { FiArrowRight } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

function getIcon(name) {
  if (name.endsWith(".pdf"))
    return <FaFilePdf color="#ff4d4f" size={22} />;

  if (name.endsWith(".docx"))
    return <FaFileWord color="#3b82f6" size={22} />;

  if (name.endsWith(".pptx"))
    return <FaFilePowerpoint color="#f97316" size={22} />;

  if (name.endsWith(".zip"))
    return <FaFileArchive color="#f59e0b" size={22} />;

  if (name.endsWith(".fig"))
    return <SiFigma color="#8b5cf6" size={22} />;

  return null;
}

export default function RecentFiles({ files }) {
  const navigate = useNavigate();

  return (
    <div className="recent-files">
      <div className="recent-header">
        <h3>Recent Files</h3>

        <button
          className="view-all"
          onClick={() => navigate("/files")}
        >
          View All <FiArrowRight />
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>File</th>
            <th>Size</th>
            <th>Uploaded</th>
          </tr>
        </thead>

        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <td className="file-name">
                {getIcon(file.name)}
                <span>{file.name}</span>
              </td>

              <td>{file.size}</td>

              <td>{file.uploaded_at}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}