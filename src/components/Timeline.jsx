import { useEffect, useRef, useMemo } from "react";
import Timeline from "@mui/lab/Timeline";
import TimelineItem from "@mui/lab/TimelineItem";
import TimelineSeparator from "@mui/lab/TimelineSeparator";
import TimelineConnector from "@mui/lab/TimelineConnector";
import TimelineContent from "@mui/lab/TimelineContent";
import TimelineDot from "@mui/lab/TimelineDot";
import TimelineOppositeContent from "@mui/lab/TimelineOppositeContent";
import GameCard from "./GameCard";
import RefCard from "./RefCard";
import BreakCard from "./BreakCard";

export default function ScheduleTimeline({ events, selectedPlayer, showPlaying, roster }) {
  const itemRefs = useRef({});

  const sortedEvents = [...events].sort((a, b) => {
    return a.time.localeCompare(b.time);
  });

  const currentMinutes = useMemo(() => {
    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    return estTime.getHours() * 60 + estTime.getMinutes();
  }, []);

  const isPast = (eventTime) => {
    const [hours, minutes] = eventTime.split(":").map(Number);
    const eventMinutes = hours * 60 + minutes;
    return eventMinutes < currentMinutes;
  };

  const currentIndex = useMemo(() => {
    // Find the first event that hasn't started yet
    const nextEventIndex = sortedEvents.findIndex(event => {
      const [hours, minutes] = event.time.split(":").map(Number);
      const eventMinutes = hours * 60 + minutes;
      return eventMinutes > currentMinutes;
    });

    if (nextEventIndex === -1) {
      // All events have started - the last one is current
      return sortedEvents.length - 1;
    } else if (nextEventIndex === 0) {
      // No events have started yet - first one is next up
      return 0;
    } else {
      // The event before the next one is the currently active one
      return nextEventIndex - 1;
    }
  }, [sortedEvents, currentMinutes]);

  useEffect(() => {
    if (sortedEvents.length === 0 || currentIndex < 0) return;

    const targetRef = itemRefs.current[currentIndex];
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [sortedEvents, currentIndex]);

  return (
    <Timeline position="right">
      {sortedEvents.map((event, index) => (
        <TimelineItem
          key={index}
          ref={(el) => (itemRefs.current[index] = el)}
          sx={{ opacity: isPast(event.time) && index !== currentIndex ? 0.5 : 1 }}
        >
          <TimelineOppositeContent sx={{ flex: 'none', width: '45px', pl: 0, pr: 0.5, textAlign: 'left' }} className="text-sm font-bold">
            {event.time}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={event.type === "game" ? "primary" : event.type === "ref" ? "warning" : "grey"} />
            {index < sortedEvents.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            {event.type === "game" && <GameCard event={event} selectedPlayer={selectedPlayer} showPlaying={showPlaying} roster={roster} isCurrent={index === currentIndex} />}
            {event.type === "ref" && <RefCard event={event} isCurrent={index === currentIndex} />}
            {event.type === "break" && <BreakCard isCurrent={index === currentIndex} />}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
