import { useState, useMemo, useEffect, useRef } from "react";
import Header from "./components/Header";
import ScheduleTimeline from "./components/Timeline";
import scheduleData from "./data/schedule.json";

function App() {
  const [selectedPlayer, setSelectedPlayer] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("player") || "";
  });
  const notificationTimeouts = useRef([]);

  const handlePlayerChange = (player) => {
    setSelectedPlayer(player);
    const url = new URL(window.location);
    if (player) {
      url.searchParams.set("player", player);
    } else {
      url.searchParams.delete("player");
    }
    window.history.pushState({}, "", url);
  };

  const players = useMemo(() => {
    const playerSet = new Set();
    scheduleData.events.forEach((event) => {
      if (event.firstHalfSitting) event.firstHalfSitting.forEach((p) => playerSet.add(p));
      if (event.secondHalfSitting) event.secondHalfSitting.forEach((p) => playerSet.add(p));
      if (event.refs) event.refs.forEach((p) => playerSet.add(p));
    });
    return Array.from(playerSet).sort();
  }, []);

  const filteredEvents = useMemo(() => {
    if (!selectedPlayer) return scheduleData.events;
    return scheduleData.events.filter((event) => {
      if (event.type === "break") return true;
      if (event.type === "game") return true;
      if (event.type === "ref") {
        return event.refs?.includes(selectedPlayer);
      }
      return false;
    });
  }, [selectedPlayer]);

  useEffect(() => {
    // Clear existing timeouts
    notificationTimeouts.current.forEach(clearTimeout);
    notificationTimeouts.current = [];

    if (!selectedPlayer) return;

    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    if ("Notification" in window && Notification.permission !== "granted") {
      return;
    }

    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const today = estTime.toDateString();

    scheduleData.events.forEach((event) => {
      if (event.type === "break") return;

      // Check if this event is relevant to the selected player
      let isRelevant = false;
      let message = "";

      if (event.type === "game") {
        isRelevant = true; // All games are relevant
        const sittingFirst = event.firstHalfSitting?.includes(selectedPlayer);
        const sittingSecond = event.secondHalfSitting?.includes(selectedPlayer);

        if (sittingFirst && !sittingSecond) {
          message = `Game vs ${event.opponent} in 2 min - Court ${event.court} (playing 2nd half)`;
        } else if (sittingSecond && !sittingFirst) {
          message = `Game vs ${event.opponent} in 2 min - Court ${event.court} (playing 1st half)`;
        } else if (!sittingFirst && !sittingSecond) {
          message = `Game vs ${event.opponent} in 2 min - Court ${event.court} (playing whole game)`;
        } else {
          message = `Game vs ${event.opponent} in 2 min - Court ${event.court} (sitting)`;
        }
      } else if (event.type === "ref" && event.refs?.includes(selectedPlayer)) {
        isRelevant = true;
        message = `Reffing duty in 2 min - Court ${event.court}`;
      }

      if (!isRelevant) return;

      // Calculate time until event (minus 2 minutes)
      const [hours, minutes] = event.time.split(":").map(Number);
      const eventTime = new Date(today);
      eventTime.setHours(hours, minutes, 0, 0);

      const notifyTime = new Date(eventTime.getTime() - 2 * 60 * 1000); // 2 minutes before
      const msUntilNotify = notifyTime.getTime() - estTime.getTime();

      if (msUntilNotify > 0) {
        const timeout = setTimeout(() => {
          new Notification("BAVAP Schedule", {
            body: message,
            icon: "/vite.svg",
          });
        }, msUntilNotify);
        notificationTimeouts.current.push(timeout);
      }
    });

    return () => {
      notificationTimeouts.current.forEach(clearTimeout);
      notificationTimeouts.current = [];
    };
  }, [selectedPlayer]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        teamName={scheduleData.teamName}
        tournamentName={scheduleData.tournamentName}
        players={players}
        selectedPlayer={selectedPlayer}
        onPlayerChange={handlePlayerChange}
      />
      <main className="max-w-lg mx-auto">
        <ScheduleTimeline events={filteredEvents} selectedPlayer={selectedPlayer} />
      </main>
    </div>
  );
}

export default App;
