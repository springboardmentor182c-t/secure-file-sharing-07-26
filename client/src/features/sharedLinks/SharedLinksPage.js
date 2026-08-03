import React, { useState, useCallback, useEffect } from "react";
import "./SharedLinks.css";

import Header from "./components/Header";
import StatCard from "./components/StatCard";
import ActivityChart from "./components/ActivityChart";
import SharedLinksTable from "./components/SharedLinksTable";
import CreateLinkModal from "./components/CreateLinkModal";
import EditLinkModal from "./components/EditLinkModal";
import DeleteConfirmationModal from "./components/DeleteConfirmationModal";
import ToastContainer from "../../components/common/Toast";

import useSharedLinks from "./hooks/useSharedLinks";
import useToast from "../../hooks/useToast";
import { LinkIcon, EyeIcon, DownloadIcon, ClockIcon } from "../../layout/icons";

export default function SharedLinksPage() {
  const {
    isLoading, error, pageLinks, totalCount, stats, chartData,
    searchQuery, updateSearch, sortBy, updateSort,
    statusFilter, updateStatusFilter, hasActiveFilters, clearFilters,
    page, totalPages, setPage,
    createLink, updateLink, toggleLinkEnabled, deleteLink,
  } = useSharedLinks();

  const { toasts, showToast, dismiss } = useToast();

  const [isCreateOpen, setCreateOpen] = useState(false);
  const [editingLink, setEditingLink] = useState(null);
  const [deletingLink, setDeletingLink] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (error) showToast(error, "error");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [error]);

  const handleCopy = useCallback(async (link) => {
    const url = link.shareUrl.startsWith("http") ? link.shareUrl : `https://${link.shareUrl}`;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
      } else {
        // Fallback for environments without the async Clipboard API.
        const el = document.createElement("textarea");
        el.value = url;
        el.style.position = "fixed";
        el.style.opacity = "0";
        document.body.appendChild(el);
        el.select();
        document.execCommand("copy");
        document.body.removeChild(el);
      }
      showToast("Link copied successfully", "success");
    } catch {
      showToast("Couldn't copy the link — try again", "error");
    }
  }, [showToast]);

  const handleCreate = useCallback(async (formValues) => {
    setIsSaving(true);
    try {
      await createLink(formValues);
      setCreateOpen(false);
      showToast(`Link created for ${formValues.file.name}`, "success");
    } catch (err) {
      showToast(err.message || "Couldn't create the link — try again", "error");
    } finally {
      setIsSaving(false);
    }
  }, [createLink, showToast]);

  const handleSaveEdit = useCallback(async (id, patch) => {
    setIsSaving(true);
    try {
      await updateLink(id, patch);
      setEditingLink(null);
      showToast("Link updated", "success");
    } catch (err) {
      showToast(err.message || "Couldn't update the link — try again", "error");
    } finally {
      setIsSaving(false);
    }
  }, [updateLink, showToast]);

  const handleToggleEnabled = useCallback(async (link) => {
    try {
      await toggleLinkEnabled(link.id);
      showToast(
        link.status === "disabled" ? `${link.fileName} link re-enabled` : `${link.fileName} link disabled`,
        "success"
      );
    } catch (err) {
      showToast(err.message || "Couldn't update the link — try again", "error");
    }
  }, [toggleLinkEnabled, showToast]);

  const handleConfirmDelete = useCallback(async (id) => {
    const link = deletingLink;
    setIsSaving(true);
    try {
      await deleteLink(id);
      setDeletingLink(null);
      showToast(`Deleted link for ${link?.fileName ?? "file"}`, "success");
    } catch (err) {
      showToast(err.message || "Couldn't delete the link — try again", "error");
    } finally {
      setIsSaving(false);
    }
  }, [deleteLink, deletingLink, showToast]);

  return (
    <div className="shared-links-page">
      <Header searchQuery={searchQuery} onSearchChange={updateSearch} onCreateClick={() => setCreateOpen(true)} />

      <section className="stat-grid" aria-label="Summary statistics">
        <StatCard label="Active links" value={stats.activeLinks} icon={LinkIcon} tint="accent" />
        <StatCard label="Total views" value={stats.totalViews} icon={EyeIcon} tint="info" />
        <StatCard label="Total downloads" value={stats.totalDownloads} icon={DownloadIcon} tint="success" />
        <StatCard label="Expiring soon" value={stats.expiringSoon} icon={ClockIcon} tint="warning" />
      </section>

      <section className="chart-card">
        <div className="chart-card__header">
          <div>
            <h2 className="chart-card__title">Sharing activity</h2>
            <p className="chart-card__subtitle">Links created vs. access events per month</p>
          </div>
          <div className="chart-card__legend">
            <span className="legend-item"><i className="legend-dot legend-dot--created" />Links created</span>
            <span className="legend-item"><i className="legend-dot legend-dot--access" />Access events</span>
          </div>
        </div>
        <ActivityChart data={chartData.length ? chartData : [{ label: "", created: 0, access: 0 }]} />
      </section>

      <SharedLinksTable
        isLoading={isLoading}
        links={pageLinks}
        totalCount={totalCount}
        page={page}
        totalPages={totalPages}
        onPageChange={setPage}
        sortBy={sortBy}
        onSortChange={updateSort}
        statusFilter={statusFilter}
        onStatusFilterChange={updateStatusFilter}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
        onCreate={() => setCreateOpen(true)}
        onCopy={handleCopy}
        onEdit={setEditingLink}
        onToggleEnabled={handleToggleEnabled}
        onDelete={setDeletingLink}
      />

      {isCreateOpen && (
        <CreateLinkModal onClose={() => setCreateOpen(false)} onCreate={handleCreate} isSaving={isSaving} />
      )}
      {editingLink && (
        <EditLinkModal link={editingLink} onClose={() => setEditingLink(null)} onSave={handleSaveEdit} isSaving={isSaving} />
      )}
      {deletingLink && (
        <DeleteConfirmationModal
          link={deletingLink}
          onClose={() => setDeletingLink(null)}
          onConfirm={handleConfirmDelete}
          isSaving={isSaving}
        />
      )}

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
