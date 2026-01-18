export default function BreakCard({ isCurrent }) {
  return (
    <div className={`bg-gray-100 border-l-4 border-gray-400 rounded-lg p-3 ${isCurrent ? 'shadow-lg ring-2 ring-gray-400' : 'shadow-sm'}`}>
      <p className="text-gray-600 font-medium">Break</p>
    </div>
  );
}
