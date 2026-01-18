export default function RefCard({ event }) {
  return (
    <div className="bg-orange-100 border-l-4 border-orange-500 rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-orange-700 font-semibold">Court {event.court}</p>
        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded">Reffing</span>
      </div>
      <div className="mt-2 text-sm text-orange-800">
        {event.game && <p className="font-medium mb-1">{event.game}</p>}
        <p><span className="font-medium">Refs:</span> {event.refs.join(", ")}</p>
      </div>
    </div>
  );
}
