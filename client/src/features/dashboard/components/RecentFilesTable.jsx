import { CARD_BASE_CLASS, STATUS_BADGE_STYLES } from '../constants/dashboardConstants';

export default function RecentFilesTable({ files }) {
  return (
    <section className={`${CARD_BASE_CLASS} overflow-hidden`} aria-labelledby="recent-files-heading">
      <div className="flex flex-col gap-2 border-b border-[#E2E8F0] p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id="recent-files-heading" className="text-base font-semibold text-[#0F172A]">
            Recent Files
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">Latest secure files and review status</p>
        </div>
        <span className="text-sm font-medium text-[#4F46E5]">{files.length} files</span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-[760px] w-full divide-y divide-[#E2E8F0] text-left">
          <thead className="bg-[#F8FAFC]">
            <tr>
              {['File name', 'Type', 'Owner', 'Last modified', 'Size', 'Status'].map((heading) => (
                <th key={heading} scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-[#64748B]">
                  {heading}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0] bg-white">
            {files.map((file) => (
              <tr key={file.id} className="transition hover:bg-[#F8FAFC]">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-[#4F46E5]">
                      {file.type}
                    </span>
                    <span className="font-medium text-[#0F172A]">{file.name}</span>
                  </div>
                </td>
                <td className="px-5 py-4 text-sm text-[#64748B]">{file.type}</td>
                <td className="px-5 py-4 text-sm text-[#0F172A]">{file.owner}</td>
                <td className="px-5 py-4 text-sm text-[#64748B]">{file.lastModified}</td>
                <td className="px-5 py-4 text-sm text-[#64748B]">{file.size}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                      STATUS_BADGE_STYLES[file.status] ?? STATUS_BADGE_STYLES.Private
                    }`}
                  >
                    {file.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
