export default function GameCard({ event, selectedPlayer }) {
  const getPlayingStatus = () => {
    if (!selectedPlayer) return null;

    const sittingFirst = event.firstHalfSitting?.includes(selectedPlayer);
    const sittingSecond = event.secondHalfSitting?.includes(selectedPlayer);

    if (sittingFirst && sittingSecond) {
      return { icon: "○", text: "Sitting whole game" };
    } else if (sittingFirst) {
      return { icon: "◑", text: "Playing 2nd half" };
    } else if (sittingSecond) {
      return { icon: "◐", text: "Playing 1st half" };
    } else {
      return { icon: "◉", text: "Playing whole game" };
    }
  };

  const playingStatus = getPlayingStatus();

  return (
    <div className="bg-blue-100 border-l-4 border-blue-500 rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-start">
        <p className="text-blue-900 font-semibold">vs {event.opponent}</p>
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">Game</span>
      </div>
      <p className="text-blue-700 text-sm">Court {event.court}</p>
      {selectedPlayer ? (
        <p className="mt-2 text-sm text-blue-800 font-medium flex items-center gap-2">
          <span className="text-lg">{playingStatus.icon}</span>
          {playingStatus.text}
        </p>
      ) : (
        <div className="mt-2 text-sm text-blue-800">
          <p><span className="font-medium">1st sitting:</span> {event.firstHalfSitting.join(", ")}</p>
          <p><span className="font-medium">2nd sitting:</span> {event.secondHalfSitting.join(", ")}</p>
        </div>
      )}
    </div>
  );
}
