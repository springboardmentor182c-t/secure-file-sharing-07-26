export function formatStorage(gb) {
  if (gb < 1) {
    const mb = gb * 1024;
    if (mb < 1) {
      return `${(mb * 1024).toFixed(0)} KB`;
    }
    return `${mb.toFixed(1)} MB`;
  }
  return `${gb.toFixed(1)} GB`;
}