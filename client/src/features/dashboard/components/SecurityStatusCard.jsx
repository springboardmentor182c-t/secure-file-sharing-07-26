import { CARD_BASE_CLASS } from '../constants/dashboardConstants';

function CheckIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path d="M5 12.5 9.5 17 19 7" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
    </svg>
  );
}

export default function SecurityStatusCard({ security }) {
  return (
    <section className={`${CARD_BASE_CLASS} p-5`} aria-labelledby="security-status-heading">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="security-status-heading" className="text-base font-semibold text-[#0F172A]">
            Encryption & Security
          </h2>
          <p className="mt-1 text-sm text-[#64748B]">Protect your confidential files with advanced encryption and secure authentication.</p>
          <p className="mt-3 text-sm text-[#64748B]">
  Encryption Level: <span className="font-semibold text-[#0F172A]">AES-256 Bit</span>
</p>
        </div>
        <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-[#16A34A]">
          Encrypted
        </span>
        
      </div>

      <div className="mt-5 space-y-3">
        {security.map((item) => (
          <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg bg-[#F8FAFC] px-3 py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-green-50 text-[#16A34A]">
                <CheckIcon />
              </span>
              <span className="text-sm font-medium text-[#0F172A]">{item.label}</span>
            </div>
            <span className="text-right text-sm font-semibold text-[#16A34A]">{item.value}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
