export default function ProgressBar({ percent }) {
  return (
    <div className="w-full bg-gray-200 rounded h-4 overflow-hidden">
      <div style={{ width: `${percent}%` }} className="h-4 bg-blue-600 transition-all"></div>
    </div>
  );
}
