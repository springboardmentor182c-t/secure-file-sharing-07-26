import React, { useCallback, useEffect, useRef, useState } from "react";
import "./MyFiles.css";

import Header from "./components/Header";
import FoldersPanel from "./components/FoldersPanel";
import CategoryTabs from "./components/CategoryTabs";
import StorageUsage from "./components/StorageUsage";
import FileTable from "./components/FileTable";
import RenameModal from "./components/RenameModal";
import MoveModal from "./components/MoveModal";
import CategoryModal from "./components/CategoryModal";
import ConfirmModal from "./components/ConfirmModal";
import UploadModal from "./components/UploadModal";
import ToastContainer from "../../components/common/Toast";

import CreateLinkModal from "../sharedLinks/components/CreateLinkModal";
import { createSharedLink } from "../sharedLinks/services/sharedLinksApi";

import useMyFiles from "./hooks/useMyFiles";
import useToast from "../../hooks/useToast";

export default function MyFilesPage({ initialView = "files" }) {
  const {
    view, changeView,
    isLoading, error, files, totalCount, page, totalPages, setPage,
    searchQuery, updateSearch,
    category, changeCategory,
    folderId, changeFolder,
    sortBy, changeSort,
    folders, storageStats,
    selectedIds, toggleSelected, toggleSelectAll, clearSelection,
    upload, rename, move, changeFileCategory, toggleStar, trash, restore, permanentlyDelete, download,
    createFolder, renameFolder, deleteFolder,
  } = useMyFiles(initialView);

  const { toasts, showToast, dismiss } = useToast();
  const fileInputRef = useRef(null);

  const [renamingFile, setRenamingFile] = useState(null);
  const [movingFile, setMovingFile] = useState(null);
  const [categorizingFile, setCategorizingFile] = useState(null);
  const [sharingFile, setSharingFile] = useState(null);
  const [confirmAction, setConfirmAction] = useState(null); // { title, message, confirmLabel, run }
  const [folderModal, setFolderModal] = useState(null); // { mode: 'new'|'rename', folder? }
  const [uploadModal, setUploadModal] = useState(false); // Show/hide upload modal
  const [pendingFiles, setPendingFiles] = useState(null); // Files waiting for folder selection
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (error) showToast(error, "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const runGuarded = useCallback(async (fn, successMessage) => {
    setIsSaving(true);
    try {
      await fn();
      if (successMessage) showToast(successMessage, "success");
    } catch (err) {
      showToast(err.message || "Something went wrong — try again", "error");
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const handleUpload = useCallback((fileList) => {
    setPendingFiles(fileList);
    setUploadModal(true);
  }, []);

  const handleUploadWithFolder = useCallback(async (selectedFolderId) => {
    if (!pendingFiles) return;
    
    setIsSaving(true);
    try {
      const { uploadFile: apiUploadFile } = await import("./services/filesApi");
      const results = [];
      
      for (const file of Array.from(pendingFiles)) {
        try {
          await apiUploadFile({ file, folderId: selectedFolderId, category: undefined });
          results.push({ file, ok: true });
        } catch (err) {
          results.push({ file, ok: false, error: err.message });
        }
      }
      
      // Refresh after upload by calling the existing refresh mechanism
      const failed = results.filter((r) => !r.ok);
      if (failed.length === 0) {
        const folderName = selectedFolderId 
          ? (folders.find(f => f.id === selectedFolderId)?.name || "folder")
          : "My Files";
        showToast(`Uploaded ${results.length} file${results.length > 1 ? "s" : ""} to ${folderName}`, "success");
      } else {
        showToast(`${failed.length} of ${results.length} file(s) failed: ${failed[0].error}`, "error");
      }
      
      // Trigger a refresh of the file list
      await new Promise(resolve => setTimeout(resolve, 200));
      changeFolder(selectedFolderId);
      
      setUploadModal(false);
      setPendingFiles(null);
    } catch (err) {
      showToast(err.message || "Upload failed", "error");
    } finally {
      setIsSaving(false);
    }
  }, [pendingFiles, showToast, folders, changeFolder]);

  const handleDownload = useCallback((file) => {
    runGuarded(() => download(file.id, file.original_filename));
  }, [download, runGuarded]);

  const handleShareCreate = useCallback(async (formValues) => {
    setIsSaving(true);
    try {
      await createSharedLink(formValues);
      setSharingFile(null);
      showToast(`Shared link created for ${formValues.fileName}`, "success");
    } catch (err) {
      showToast(err.message || "Couldn't create the link — try again", "error");
    } finally {
      setIsSaving(false);
    }
  }, [showToast]);

  const handleBulkTrash = useCallback(() => {
    setConfirmAction({
      title: "Move to Trash",
      message: `Move ${selectedIds.length} file(s) to Trash? You can restore them later.`,
      confirmLabel: "Move to Trash",
      run: async () => {
        for (const id of selectedIds) await trash(id);
        clearSelection();
      },
    });
  }, [selectedIds, trash, clearSelection]);

  const handleBulkPermanentDelete = useCallback(() => {
    setConfirmAction({
      title: "Delete permanently",
      message: `Permanently delete ${selectedIds.length} file(s)? This cannot be undone.`,
      confirmLabel: "Delete permanently",
      run: async () => {
        for (const id of selectedIds) await permanentlyDelete(id);
        clearSelection();
      },
    });
  }, [selectedIds, permanentlyDelete, clearSelection]);

  const hasActiveFilters = !!searchQuery;

  return (
    <div className="shared-links-page my-files-page">
      <Header
        searchQuery={searchQuery}
        onSearchChange={updateSearch}
        onNewFolder={() => setFolderModal({ mode: "new" })}
        onUploadClick={() => setUploadModal(true)}
        fileInputRef={fileInputRef}
      />

      <div className="my-files-layout">
        <div className="my-files-layout__side">
          <FoldersPanel
            folderId={folderId}
            folders={folders}
            onSelectFolder={changeFolder}
            onNewFolder={() => setFolderModal({ mode: "new" })}
            onRenameFolder={(folder) => setFolderModal({ mode: "rename", folder })}
            onDeleteFolder={(folder) => setConfirmAction({
              title: "Delete folder",
              message: `Delete "${folder.name}"? Files inside will move to All Files, not be deleted.`,
              confirmLabel: "Delete folder",
              run: () => deleteFolder(folder.id),
            })}
          />
          <StorageUsage stats={storageStats} />
        </div>

        <div className="my-files-layout__main">
          {view === "files" && <CategoryTabs active={category} onChange={changeCategory} />}

          <FileTable
            view={view}
            isLoading={isLoading}
            files={files}
            totalCount={totalCount}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            sortBy={sortBy}
            onSortChange={changeSort}
            hasActiveFilters={hasActiveFilters}
            onClearFilters={() => updateSearch("")}
            onUploadClick={() => fileInputRef.current?.click()}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelected}
            onToggleSelectAll={toggleSelectAll}
            onDownload={handleDownload}
            onShare={(file) => setSharingFile(file)}
            onStar={(file) => runGuarded(() => toggleStar(file.id))}
            onRename={(file) => setRenamingFile(file)}
            onMove={(file) => setMovingFile(file)}
            onCategory={(file) => setCategorizingFile(file)}
            onTrash={(file) => setConfirmAction({
              title: "Move to Trash",
              message: `Move "${file.original_filename}" to Trash?`,
              confirmLabel: "Move to Trash",
              run: () => trash(file.id),
            })}
            onRestore={(file) => runGuarded(() => restore(file.id), "File restored")}
            onPermanentDelete={(file) => setConfirmAction({
              title: "Delete permanently",
              message: `Permanently delete "${file.original_filename}"? This cannot be undone.`,
              confirmLabel: "Delete permanently",
              run: () => permanentlyDelete(file.id),
            })}
            onBulkTrash={handleBulkTrash}
            onBulkPermanentDelete={handleBulkPermanentDelete}
          />
        </div>
      </div>

      {renamingFile && (
        <RenameModal
          title={`Rename "${renamingFile.original_filename}"`}
          initialName={renamingFile.original_filename}
          isSaving={isSaving}
          onClose={() => setRenamingFile(null)}
          onSave={(name) => runGuarded(async () => {
            await rename(renamingFile.id, name);
            setRenamingFile(null);
          }, "File renamed")}
        />
      )}

      {movingFile && (
        <MoveModal
          file={movingFile}
          folders={folders}
          isSaving={isSaving}
          onClose={() => setMovingFile(null)}
          onSave={(targetFolderId) => runGuarded(async () => {
            await move(movingFile.id, targetFolderId);
            setMovingFile(null);
          }, "File moved")}
        />
      )}

      {categorizingFile && (
        <CategoryModal
          file={categorizingFile}
          isSaving={isSaving}
          onClose={() => setCategorizingFile(null)}
          onSave={(newCategory) => runGuarded(async () => {
            await changeFileCategory(categorizingFile.id, newCategory);
            setCategorizingFile(null);
          }, "Category updated")}
        />
      )}

      {folderModal && (
        <RenameModal
          title={folderModal.mode === "new" ? "New folder" : `Rename "${folderModal.folder.name}"`}
          initialName={folderModal.mode === "new" ? "" : folderModal.folder.name}
          isSaving={isSaving}
          onClose={() => setFolderModal(null)}
          onSave={(name) => runGuarded(async () => {
            if (folderModal.mode === "new") {
              await createFolder(name);
            } else {
              await renameFolder(folderModal.folder.id, name);
            }
            setFolderModal(null);
          }, folderModal.mode === "new" ? "Folder created" : "Folder renamed")}
        />
      )}

      {sharingFile && (
        <CreateLinkModal
          preselectedFile={{ id: sharingFile.id, name: sharingFile.original_filename }}
          isSaving={isSaving}
          onClose={() => setSharingFile(null)}
          onCreate={handleShareCreate}
        />
      )}

      {confirmAction && (
        <ConfirmModal
          title={confirmAction.title}
          message={confirmAction.message}
          confirmLabel={confirmAction.confirmLabel}
          isSaving={isSaving}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => runGuarded(async () => {
            await confirmAction.run();
            setConfirmAction(null);
          })}
        />
      )}

      {uploadModal && (
        <UploadModal
          folders={folders}
          currentFolderId={folderId}
          onClose={() => {
            setUploadModal(false);
            setPendingFiles(null);
          }}
          onUpload={handleUploadWithFolder}
          isSaving={isSaving}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
