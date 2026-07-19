import { sharedWithMeAPI } from '../../../utils/api';

export async function fetchSharedFiles() {
  const response = await sharedWithMeAPI.list();
  return response.data;
}

export async function downloadSharedFile(file) {
  const response = await sharedWithMeAPI.download(file.file_id);
  const url = URL.createObjectURL(response.data);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
