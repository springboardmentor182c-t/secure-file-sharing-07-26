import SharedWithMeError from './components/SharedWithMeError';
import SharedWithMeLoading from './components/SharedWithMeLoading';
import SharedFilesView from './components/SharedFilesView';
import { useSharedFiles } from './hooks/useSharedFiles';
import { downloadSharedFile } from './services/sharedWithMeService';
import './sharedWithMe.css';

export default function SharedWithMeFeature() {
  const { data, error, isLoading, refetch } = useSharedFiles();
  if (isLoading) return <SharedWithMeLoading />;
  if (error) return <SharedWithMeError onRetry={refetch} />;
  return <SharedFilesView data={data} onDownload={downloadSharedFile} />;
}
