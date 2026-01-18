import { useState, useMemo, useEffect, useRef } from "react";
import Header from "./Header";
import ScheduleTimeline from "./Timeline";

export default function ScheduleView({ scheduleData }) {
  const [selectedPlayer, setSelectedPlayer] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("player") || "";
  });
  const [showPlaying, setShowPlaying] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get("view") === "playing";
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

  const handleToggleView = (isShowingPlaying) => {
    setShowPlaying(isShowingPlaying);
    const url = new URL(window.location);
    if (isShowingPlaying) {
      url.searchParams.set("view", "playing");
    } else {
      url.searchParams.delete("view");
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
  }, [scheduleData]);

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
  }, [selectedPlayer, scheduleData]);

  useEffect(() => {
    notificationTimeouts.current.forEach(clearTimeout);
    notificationTimeouts.current = [];

    if (!selectedPlayer) return;

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

      let isRelevant = false;
      let message = "";

      if (event.type === "game") {
        isRelevant = true;
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

      const [hours, minutes] = event.time.split(":").map(Number);
      const eventTime = new Date(today);
      eventTime.setHours(hours, minutes, 0, 0);

      const notifyTime = new Date(eventTime.getTime() - 2 * 60 * 1000);
      const msUntilNotify = notifyTime.getTime() - estTime.getTime();

      if (msUntilNotify > 0) {
        const timeout = setTimeout(() => {
          new Notification(`${scheduleData.teamName} Schedule`, {
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
  }, [selectedPlayer, scheduleData]);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        teamName={scheduleData.teamName}
        tournamentName={scheduleData.tournamentName}
        players={players}
        selectedPlayer={selectedPlayer}
        onPlayerChange={handlePlayerChange}
        showPlaying={showPlaying}
        onToggleView={handleToggleView}
        showBackLink={true}
      />
      <main className="max-w-lg mx-auto">
        <ScheduleTimeline events={filteredEvents} selectedPlayer={selectedPlayer} showPlaying={showPlaying} roster={scheduleData.roster} />
      </main>
    </div>
  );
}
