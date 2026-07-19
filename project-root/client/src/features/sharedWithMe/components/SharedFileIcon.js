import { File, FileArchive, FileImage, FileSpreadsheet, FileText, Presentation } from 'lucide-react';

export default function SharedFileIcon({ mimetype = '', name = '' }) {
  const type = mimetype.toLowerCase();
  const extension = name.split('.').pop()?.toLowerCase();
  let Icon = File;
  let tone = 'blue';
  if (type.includes('pdf') || ['doc', 'docx', 'txt'].includes(extension)) { Icon = FileText; tone = 'rose'; }
  if (type.includes('image')) { Icon = FileImage; tone = 'purple'; }
  if (type.includes('sheet') || ['csv', 'xls', 'xlsx'].includes(extension)) { Icon = FileSpreadsheet; tone = 'emerald'; }
  if (type.includes('presentation') || ['ppt', 'pptx'].includes(extension)) { Icon = Presentation; tone = 'amber'; }
  if (type.includes('zip') || ['zip', 'rar', '7z'].includes(extension)) { Icon = FileArchive; tone = 'cyan'; }
  return <span className={`shared-file-icon shared-file-icon-${tone}`}><Icon size={21} /></span>;
}
