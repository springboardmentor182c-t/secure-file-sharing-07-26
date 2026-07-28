import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";

import TrashToolbar from "./TrashToolbar";
import TrashTable from "./TrashTable";

import ConfirmModal from "../../components/trash/ConfirmModal";

import {
  getTrashFiles,
  restoreTrashFile,
  deleteTrashFile,
  emptyTrash,
} from "../../services/trashService";

function Trash() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State

  const [modal, setModal] = useState({
    open: false,
    type: null,
    fileId: null,
  });

  const fetchTrash = async () => {
    try {
      setLoading(true);

      const data = await getTrashFiles();

      setFiles(data);
    } catch (error) {
      console.error(error);

      toast.error("Failed to load trash files");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrash();
  }, []);

  // Open Modal

  const openModal = (type, fileId = null) => {
    setModal({
      open: true,
      type,
      fileId,
    });
  };

  // Close Modal

  const closeModal = () => {
    setModal({
      open: false,
      type: null,
      fileId: null,
    });
  };

  // Confirm Actions

  const handleConfirm = async () => {
    try {
      if (modal.type === "restore") {
        await restoreTrashFile(modal.fileId);

        toast.success("File restored successfully");
      }

      if (modal.type === "delete") {
        await deleteTrashFile(modal.fileId);

        toast.success("File permanently deleted");
      }

      if (modal.type === "empty") {
        await emptyTrash();

        toast.success("Trash emptied successfully");
      }

      closeModal();

      fetchTrash();
    } catch (error) {
      console.error(error);

      toast.error("Action failed");
    }
  };

  return (
    <div className="p-6">
      <TrashToolbar
        totalFiles={files.length}
        onEmptyTrash={() => openModal("empty")}
      />

      <TrashTable
        files={files}
        loading={loading}
        onRestore={(id) => openModal("restore", id)}
        onDelete={(id) => openModal("delete", id)}
      />

      <ConfirmModal
        isOpen={modal.open}
        title={
          modal.type === "restore"
            ? "Restore File"
            : modal.type === "delete"
              ? "Delete File"
              : "Empty Trash"
        }
        message={
          modal.type === "restore"
            ? "Are you sure you want to restore this file?"
            : modal.type === "delete"
              ? "This file will be permanently deleted. This action cannot be undone."
              : "All files inside trash will be permanently deleted."
        }
        confirmText={
          modal.type === "restore"
            ? "Restore"
            : modal.type === "delete"
              ? "Delete"
              : "Empty Trash"
        }
        confirmButtonClass={
          modal.type === "restore"
            ? "bg-emerald-600 hover:bg-emerald-700"
            : "bg-red-600 hover:bg-red-700"
        }
        onConfirm={handleConfirm}
        onCancel={closeModal}
      />
    </div>
  );
}

export default Trash;
