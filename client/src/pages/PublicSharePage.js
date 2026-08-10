import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Download, ShieldCheck, FileText, CheckCircle, Eye, Lock, X, Maximize2, Edit3, Key, Save } from "lucide-react";

export default function PublicSharePage() {
  const { id } = useParams();
  const [linkInfo, setLinkInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [downloaded, setDownloaded] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Password Protection state
  const [passwordInput, setPasswordInput] = useState("");
  const [passwordError, setPasswordError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [unlocked, setUnlocked] = useState(false);

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedNotes, setEditedNotes] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetch(`http://127.0.0.1:8000/share/${id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            setLinkInfo(data.data);
            setEditedTitle(data.data.file_name || "");
            if (!data.data.has_password && !data.data.is_password_protected) {
              setUnlocked(true);
            }
          } else {
            setError(data.message || "Shared link not found or expired.");
          }
        })
        .catch(() => {
          setError("Could not load shared link details.");
        })
        .finally(() => setLoading(false));

      fetch(`http://127.0.0.1:8000/share/${id}/view`, { method: "POST" }).catch(() => {});
    }
  }, [id]);

  const handleVerifyPassword = async (e) => {
    e.preventDefault();
    if (!passwordInput.trim()) {
      setPasswordError("Please enter passcode to unlock file.");
      return;
    }
    setIsVerifying(true);
    setPasswordError(null);

    try {
      const res = await fetch(`http://127.0.0.1:8000/share/${id}/verify-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordInput.trim() }),
      });
      const data = await res.json();
      if (data.success && data.data?.verified) {
        setUnlocked(true);
      } else {
        setPasswordError(data.message || "Incorrect password. Access denied.");
      }
    } catch {
      setPasswordError("Failed to verify password.");
    } finally {
      setIsVerifying(false);
    }
  };

  const handleDownload = async () => {
    if (!linkInfo || !linkInfo.allow_download || String(linkInfo.permission).toLowerCase() === "view") {
      alert("Download is disabled for this link. Click 'View File Inline' to preview.");
      return;
    }

    try {
      const res = await fetch(`http://127.0.0.1:8000/share/${id}/download-file`);
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        alert(errJson.message || "Download failed.");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = editedTitle || linkInfo.file_name || "download";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setDownloaded(true);

      fetch(`http://127.0.0.1:8000/share/${id}/download`, { method: "POST" }).catch(() => {});
    } catch (err) {
      alert("Download failed.");
    }
  };

  const handleSaveEdits = () => {
    setSaveSuccess(true);
    setIsEditing(false);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#13141C] text-white flex items-center justify-center p-4">
        <p className="text-gray-400">Loading shared file details...</p>
      </div>
    );
  }

  if (error || !linkInfo) {
    return (
      <div className="min-h-screen bg-[#13141C] text-white flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1E1F2B] border border-[#2D2F3F] rounded-2xl p-8 text-center space-y-4">
          <Lock className="w-12 h-12 text-red-400 mx-auto" />
          <h1 className="text-xl font-bold text-white">Link Unavailable</h1>
          <p className="text-sm text-gray-400">{error || "This shared link is inactive or has expired."}</p>
        </div>
      </div>
    );
  }

  // Password Lock Screen Modal
  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#13141C] text-white flex flex-col items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#1E1F2B] border border-[#2D2F3F] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
          <div className="w-16 h-16 bg-[#7C5CFC]/20 rounded-2xl flex items-center justify-center mx-auto text-[#7C5CFC]">
            <Key className="w-8 h-8" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-3">
              <Lock className="w-3.5 h-3.5" /> Password Protected Link
            </span>
            <h1 className="text-xl font-bold text-white">Passcode Required</h1>
            <p className="text-xs text-gray-400 mt-1">The sender protected this file link with a password. Enter passcode to access.</p>
          </div>

          <form onSubmit={handleVerifyPassword} className="space-y-4 text-left">
            <div>
              <label className="text-xs font-medium text-gray-300 mb-1 block">Passcode</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password..."
                className="w-full px-4 py-2.5 bg-[#171822] border border-[#2D2F3F] rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#7C5CFC]"
              />
              {passwordError && <p className="text-xs text-red-400 mt-1.5">{passwordError}</p>}
            </div>
            <button
              type="submit"
              disabled={isVerifying}
              className="w-full py-3 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4BEE] text-white font-semibold text-xs transition cursor-pointer disabled:opacity-50"
            >
              {isVerifying ? "Verifying Passcode..." : "Unlock File Access"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  const isViewOnly = !linkInfo.allow_download || String(linkInfo.permission).toLowerCase() === "view";
  const canEdit = String(linkInfo.permission).toLowerCase() === "edit";
  const fileExt = (linkInfo.file_type || linkInfo.file_name?.split('.').pop() || "").toLowerCase();
  const isImage = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(fileExt);
  const isVideo = ["mp4", "webm"].includes(fileExt);
  const isAudio = ["mp3", "wav", "ogg"].includes(fileExt);

  const rawViewUrl = `http://127.0.0.1:8000/share/${id}/view-file`;
  const iframeViewUrl = isViewOnly ? `${rawViewUrl}#toolbar=0&navpanes=0&scrollbar=1` : rawViewUrl;

  return (
    <div className="min-h-screen bg-[#13141C] text-white flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-[#1E1F2B] border border-[#2D2F3F] rounded-2xl p-8 shadow-2xl space-y-6 text-center">
        <div className="w-16 h-16 bg-[#7C5CFC]/20 rounded-2xl flex items-center justify-center mx-auto text-[#7C5CFC]">
          <FileText className="w-8 h-8" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> Encrypted Shared File
          </span>
          <h1 className="text-2xl font-bold text-white">{editedTitle}</h1>
          <p className="text-sm text-gray-400 mt-1">Shared securely via TrustShare • {linkInfo.size}</p>
        </div>

        <div className="bg-[#171822] p-4 rounded-xl text-xs text-gray-400 space-y-2 border border-[#2D2F3F]/50">
          <div className="flex justify-between">
            <span>Link Status:</span>
            <span className="text-emerald-400 font-semibold">{linkInfo.status}</span>
          </div>
          <div className="flex justify-between">
            <span>Permission:</span>
            <span className={isViewOnly ? "text-amber-400 font-semibold" : canEdit ? "text-purple-400 font-semibold" : "text-sky-400 font-semibold"}>
              {canEdit ? "Edit Access" : isViewOnly ? "View Only" : "Download Access"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Link ID:</span>
            <span className="font-mono text-gray-300">{id?.slice(0, 18)}...</span>
          </div>
        </div>

        {/* Edit Panel for Edit Permission */}
        {canEdit && (
          <div className="bg-[#171822] border border-[#7C5CFC]/40 p-4 rounded-xl text-left space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                <Edit3 className="w-4 h-4" /> Collaborative Edit Permission Active
              </span>
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs text-[#7C5CFC] hover:underline font-semibold cursor-pointer"
                >
                  Edit File Details
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Display Title</label>
                  <input
                    type="text"
                    value={editedTitle}
                    onChange={(e) => setEditedTitle(e.target.value)}
                    className="w-full px-3 py-1.5 bg-[#1E1F2B] border border-[#34364A] rounded-lg text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-gray-400 block mb-1">Shared Notes / Comments</label>
                  <textarea
                    rows={2}
                    value={editedNotes}
                    onChange={(e) => setEditedNotes(e.target.value)}
                    placeholder="Add collaborative notes..."
                    className="w-full px-3 py-1.5 bg-[#1E1F2B] border border-[#34364A] rounded-lg text-xs text-white"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-3 py-1 bg-gray-700 text-xs text-white rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEdits}
                    className="px-3 py-1 bg-[#7C5CFC] hover:bg-[#6B4BEE] text-xs font-semibold text-white rounded-lg flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Edits
                  </button>
                </div>
              </div>
            ) : (
              editedNotes && <p className="text-xs text-gray-300 bg-[#1E1F2B] p-2.5 rounded-lg border border-[#34364A]">{editedNotes}</p>
            )}

            {saveSuccess && (
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-xs flex items-center gap-1.5">
                <CheckCircle className="w-3.5 h-3.5" /> Edits saved successfully!
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={() => setShowPreview(true)}
            className="w-full py-3.5 px-6 rounded-xl bg-[#7C5CFC] hover:bg-[#6B4BEE] text-white font-semibold shadow-lg shadow-[#7C5CFC]/30 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Eye className="w-5 h-5" /> View File Inline
          </button>

          {!isViewOnly && (
            <button
              onClick={handleDownload}
              className="w-full py-3 px-6 rounded-xl bg-[#272938] hover:bg-[#34364A] border border-[#34364A] text-gray-200 hover:text-white font-medium transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Download File
            </button>
          )}

          {isViewOnly && (
            <p className="text-xs text-amber-400/80 font-medium">
              🔒 Download is disabled by sender for this link.
            </p>
          )}

          {downloaded && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" /> File Downloaded Successfully!
            </div>
          )}
        </div>

        <div className="pt-2 text-xs text-gray-500">
          Protected by <Link to="/" className="text-[#7C5CFC] hover:underline">TrustShare Platform</Link>
        </div>
      </div>

      {/* Embedded File Viewer Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-[#1E1F2B] border border-[#34364A] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Viewer Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[#34364A] bg-[#171822]">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-[#7C5CFC]" />
                <div>
                  <h3 className="text-sm font-bold text-white">{editedTitle}</h3>
                  <p className="text-xs text-gray-400">Secure Inline Viewer {isViewOnly && "(View Only)"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {!isViewOnly && (
                  <a
                    href={rawViewUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-[#272938] px-3 py-1.5 rounded-lg border border-[#34364A]"
                  >
                    <Maximize2 className="w-3.5 h-3.5" /> Fullscreen
                  </a>
                )}
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-white/10 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Viewer Content Body */}
            <div
              className="flex-1 bg-[#13141C] p-4 overflow-auto flex items-center justify-center min-h-[60vh] select-none"
              onContextMenu={(e) => isViewOnly && e.preventDefault()}
            >
              {isImage ? (
                <img
                  src={rawViewUrl}
                  alt={editedTitle}
                  className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-lg pointer-events-none"
                />
              ) : isVideo ? (
                <video controls controlsList={isViewOnly ? "nodownload" : undefined} className="max-w-full max-h-[75vh] rounded-lg shadow-lg">
                  <source src={rawViewUrl} type={`video/${fileExt}`} />
                  Your browser does not support video playback.
                </video>
              ) : isAudio ? (
                <audio controls controlsList={isViewOnly ? "nodownload" : undefined} className="w-full max-w-md">
                  <source src={rawViewUrl} type={`audio/${fileExt}`} />
                  Your browser does not support audio playback.
                </audio>
              ) : (
                <iframe
                  src={iframeViewUrl}
                  title={editedTitle}
                  className="w-full h-[75vh] rounded-lg border border-[#34364A] bg-white"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
