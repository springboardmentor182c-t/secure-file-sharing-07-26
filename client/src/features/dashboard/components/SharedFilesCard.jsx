import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

export default function SharedFilesCard({ sharedFiles }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="shared-files-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="shared-files-heading" className="text-base font-semibold text-[#0F172A]">
            Sharing Activity
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">Secure links and permission-controlled files</p>
        </div>
        <div className="rounded-lg bg-indigo-50 px-4 py-3 text-right">
          <p className="text-2xl font-semibold text-[#4F46E5]">{sharedFiles.total}</p>
          <p className="text-xs font-medium uppercase tracking-wide text-[#64748B]">shared files</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg bg-[#F8FAFC] p-4">
          <p className="text-2xl font-semibold text-[#0F172A]">{sharedFiles.activeLinks}</p>
          <p className="mt-1 text-sm text-[#64748B]">Active shares</p>
        </div>
        <div className="rounded-lg bg-[#F8FAFC] p-4">
          <p className="text-2xl font-semibold text-[#F59E0B]">{sharedFiles.expiringSoon}</p>
          <p className="mt-1 text-sm text-[#64748B]">Expiring soon</p>
        </div>
        <div className="rounded-lg bg-[#F8FAFC] p-4">
          <p className="text-2xl font-semibold text-[#16A34A]">{sharedFiles.restrictedAccess}</p>
          <p className="mt-1 text-sm text-[#64748B]">Restricted access</p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {sharedFiles.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-4 rounded-lg border border-[#E2E8F0] px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-[#0F172A]">{item.label}</p>
              <p className="mt-1 text-xs text-[#64748B]">{item.helper}</p>
            </div>
            <p className="text-lg font-semibold text-[#0F172A]">{item.value}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
