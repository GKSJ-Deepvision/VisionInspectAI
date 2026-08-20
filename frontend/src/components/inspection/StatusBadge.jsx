export default function StatusBadge({ status }) {
  const isNormal = status === "Normal";

  return (
    <span
      className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-semibold ${
        isNormal
          ? "bg-green-600 text-white"
          : "bg-red-600 text-white"
      }`}
    >
      {isNormal ? "🟢 NORMAL" : "🔴 DEFECTIVE"}
    </span>
  );
}