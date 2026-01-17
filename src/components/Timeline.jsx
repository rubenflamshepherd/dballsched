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

export default function ScheduleTimeline({ events, selectedPlayer, showPlaying }) {
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

  useEffect(() => {
    if (sortedEvents.length === 0) return;

    const now = new Date();
    const estTime = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const targetTime = new Date(estTime.getTime() - 60 * 60 * 1000); // 1 hour before
    const targetMinutes = targetTime.getHours() * 60 + targetTime.getMinutes();

    // Get first event time
    const [firstHours, firstMins] = sortedEvents[0].time.split(":").map(Number);
    const firstEventMinutes = firstHours * 60 + firstMins;

    // Don't scroll if target time is before the first event
    if (targetMinutes < firstEventMinutes) return;

    let closestIndex = 0;
    let closestDiff = Infinity;

    sortedEvents.forEach((event, index) => {
      const [hours, minutes] = event.time.split(":").map(Number);
      const eventMinutes = hours * 60 + minutes;
      const diff = Math.abs(eventMinutes - targetMinutes);

      if (diff < closestDiff) {
        closestDiff = diff;
        closestIndex = index;
      }
    });

    const targetRef = itemRefs.current[closestIndex];
    if (targetRef) {
      targetRef.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [sortedEvents]);

  return (
    <Timeline position="right">
      {sortedEvents.map((event, index) => (
        <TimelineItem
          key={index}
          ref={(el) => (itemRefs.current[index] = el)}
          sx={{ opacity: isPast(event.time) ? 0.5 : 1 }}
        >
          <TimelineOppositeContent sx={{ flex: 'none', width: '45px', pl: 0, pr: 0.5, textAlign: 'left' }} className="text-sm font-bold">
            {event.time}
          </TimelineOppositeContent>
          <TimelineSeparator>
            <TimelineDot color={event.type === "game" ? "primary" : event.type === "ref" ? "warning" : "grey"} />
            {index < sortedEvents.length - 1 && <TimelineConnector />}
          </TimelineSeparator>
          <TimelineContent>
            {event.type === "game" && <GameCard event={event} selectedPlayer={selectedPlayer} showPlaying={showPlaying} />}
            {event.type === "ref" && <RefCard event={event} />}
            {event.type === "break" && <BreakCard />}
          </TimelineContent>
        </TimelineItem>
      ))}
    </Timeline>
  );
}
