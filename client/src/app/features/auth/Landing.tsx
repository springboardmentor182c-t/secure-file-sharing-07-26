import { useNavigate } from "react-router";
import { Shield, Zap, ArrowRight, Lock, Activity, ShieldCheck } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen bg-[#212531] text-[#C5C3C4] flex flex-col"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <nav className="flex items-center justify-between px-8 py-4 border-b border-[#B7A2C9]/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#4B3A70] flex items-center justify-center">
            <Shield size={15} className="text-white" />
          </div>
          <span className="text-white font-semibold text-base tracking-tight">TrustShare</span>
        </div>
        <div className="hidden md:flex items-center gap-7 text-sm">
          {["Features", "Security", "Pricing", "Enterprise"].map((l) => (
            <a key={l} href="#" className="text-[#C5C3C4] hover:text-white transition-colors">
              {l}
            </a>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/signin")}
            className="text-sm px-4 py-1.5 text-[#C5C3C4] hover:text-white transition-colors"
          >
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="text-sm px-4 py-1.5 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg transition-colors font-medium"
          >
            Get Started
          </button>
        </div>
      </nav>
      <div className="flex-1 flex flex-col items-center justify-center px-8 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#4B3A70]/20 border border-[#4B3A70]/40 text-[#B7A2C9] text-xs mb-8">
          <Zap size={10} /> Enterprise-grade security, zero compromises
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white leading-[1.15] max-w-3xl mb-5 tracking-tight">
          Secure file sharing
          <br />
          built for the enterprise
        </h1>
        <p className="text-[#C5C3C4] text-base max-w-lg mb-10 leading-relaxed">
          Share files with confidence. AES-256 encryption, JWT authentication, granular access
          controls, and full audit trails — everything your team needs.
        </p>
        <div className="flex items-center gap-4 mb-16">
          <button
            onClick={() => navigate("/signup")}
            className="px-5 py-2.5 bg-[#4B3A70] hover:bg-[#5C4A84] text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
          >
            Get started free <ArrowRight size={14} />
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl w-full">
          {[
            {
              icon: Lock,
              label: "AES-256 Encryption",
              desc: "Every file encrypted on the server before storage. Keys never exposed.",
            },
            {
              icon: Activity,
              label: "Full Audit Trails",
              desc: "Every action logged with user identity, IP address, and timestamp.",
            },
            {
              icon: ShieldCheck,
              label: "JWT + OAuth2 Auth",
              desc: "Secure token-based authentication with multi-factor support.",
            },
          ].map(({ icon: Icon, label, desc }) => (
            <div
              key={label}
              className="p-5 rounded-xl bg-[#322F42]/70 border border-[#B7A2C9]/10 text-left hover:border-[#B7A2C9]/20 transition-colors"
            >
              <div className="w-8 h-8 rounded-lg bg-[#4B3A70]/40 flex items-center justify-center mb-3">
                <Icon size={14} className="text-[#B7A2C9]" />
              </div>
              <div className="text-white font-medium text-sm mb-1">{label}</div>
              <div className="text-[#C5C3C4]/70 text-xs leading-relaxed">{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <footer className="px-8 py-4 border-t border-[#B7A2C9]/10 flex items-center justify-between text-xs text-[#C5C3C4]/40">
        <span>© 2024 TrustShare Inc. All rights reserved.</span>
        <div className="flex gap-5">
          {["Privacy", "Terms", "Security", "Contact"].map((l) => (
            <a key={l} href="#" className="hover:text-[#C5C3C4]/70 transition-colors">
              {l}
            </a>
          ))}
        </div>
      </footer>
    </div>
  );
}
