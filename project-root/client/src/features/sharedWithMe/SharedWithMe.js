import { useCallback, useState } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import SharedWithMeError from './components/SharedWithMeError';
import SharedWithMeLoading from './components/SharedWithMeLoading';
import SharedFilesView from './components/SharedFilesView';
import { useSharedFiles } from './hooks/useSharedFiles';
import { downloadSharedFile, viewSharedFile } from './services/sharedWithMeService';
import './sharedWithMe.css';

export default function SharedWithMeFeature() {
  const { data, error, isLoading, refetch } = useSharedFiles();
  const [statusMessage, setStatusMessage] = useState(null);

  const showNotification = useCallback((msg, isError = false) => {
    setStatusMessage({ text: msg, isError });
    setTimeout(() => setStatusMessage(null), 4000);
  }, []);

  const handleDownload = useCallback(async (file) => {
    const fileName = file?.name || 'file';
    showNotification(`🔒 Preparing "${fileName}"…`);
    try {
      await downloadSharedFile(file);
      showNotification(`✅ "${fileName}" downloaded`);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.message ||
        'File download failed. Please try again.';
      showNotification(errorMsg, true);
      throw err;
    }
  }, [showNotification]);

  const handleView = useCallback(async (file) => {
    const fileName = file?.name || 'file';
    showNotification(`🔒 Opening "${fileName}"…`);
    try {
      await viewSharedFile(file);
      showNotification(`✅ "${fileName}" opened in new tab`);
    } catch (err) {
      const errorMsg =
        err?.response?.data?.detail ||
        err?.message ||
        'Failed to open file. Please try again.';
      showNotification(errorMsg, true);
      throw err;
    }
  }, [showNotification]);

  if (isLoading) return <SharedWithMeLoading />;
  if (error) return <SharedWithMeError onRetry={refetch} />;

  return (
    <>
      {/* Toast Notification */}
      {statusMessage && (
        <div className={`shared-toast ${statusMessage.isError ? 'is-error' : 'is-success'}`}>
          {statusMessage.isError ? (
            <XCircle size={16} strokeWidth={2.4} />
          ) : (
            <CheckCircle2 size={16} strokeWidth={2.4} />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      <SharedFilesView
        data={data}
        onDownload={handleDownload}
        onView={handleView}
      />
    </>
  );
}