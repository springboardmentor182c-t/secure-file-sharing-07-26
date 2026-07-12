export default function StatCard({ label, value, sublabel }) {
  return (
    <div className="bg-[#1a1a22] rounded-xl p-5 flex-1">
      <p className="text-gray-400 text-sm">{label}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
      {sublabel && <p className="text-gray-500 text-xs mt-1">{sublabel}</p>}
    </div>
  );
}