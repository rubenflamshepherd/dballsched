# Multi-Team Routing Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add React Router for path-based team navigation with a new C-Class Heroes schedule.

**Architecture:** Install react-router-dom, split App.jsx into router config and ScheduleView component, add TeamSelector landing page, create new schedule JSON for C-Class Heroes.

**Tech Stack:** React Router v6, existing React/MUI/Tailwind stack

---

### Task 1: Install react-router-dom

**Files:**
- Modify: `package.json`

**Step 1: Install the package**

Run: `npm install react-router-dom`

**Step 2: Verify installation**

Run: `npm ls react-router-dom`
Expected: `react-router-dom@6.x.x` listed

**Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add react-router-dom dependency"
```

---

### Task 2: Create C-Class Heroes schedule data

**Files:**
- Rename: `src/data/schedule.json` → `src/data/bavap.json`
- Create: `src/data/c-class-heroes.json`

**Step 1: Rename existing schedule file**

Run: `mv src/data/schedule.json src/data/bavap.json`

**Step 2: Create C-Class Heroes schedule**

Create `src/data/c-class-heroes.json`:

```json
{
  "teamName": "C-Class Heroes",
  "tournamentName": "2026 Dodgeball Toronto Kickoff",
  "events": [
    {
      "type": "ref",
      "time": "13:25",
      "court": "6",
      "game": "Bankai 2.0 vs Reck my ASScend",
      "refs": ["Raf", "Jack", "Josh"]
    },
    {
      "type": "game",
      "time": "14:00",
      "opponent": "Cyber Ducks",
      "court": "6",
      "firstHalfSitting": ["Micaela", "Ky", "Raf"],
      "secondHalfSitting": ["Leah", "Jack", "Josh"]
    },
    {
      "type": "game",
      "time": "15:10",
      "opponent": "Mixed Berries",
      "court": "7",
      "firstHalfSitting": ["Cynthia", "Scott", "David"],
      "secondHalfSitting": ["Hanna", "Jack", "Josh"]
    },
    {
      "type": "ref",
      "time": "15:45",
      "court": "3",
      "game": "Mildly Irritated vs Who Needs Jonny",
      "refs": ["Cynthia", "Leah", "Mica"]
    },
    {
      "type": "game",
      "time": "16:20",
      "opponent": "Chickens",
      "court": "3",
      "firstHalfSitting": ["Jenn", "Ky", "Raf"],
      "secondHalfSitting": ["Micaela", "Scott", "David"]
    },
    {
      "type": "game",
      "time": "16:55",
      "opponent": "Toronto Blitz",
      "court": "5",
      "firstHalfSitting": ["Leah", "Ky", "Raf"],
      "secondHalfSitting": ["Cynthia", "Scott", "David"]
    },
    {
      "type": "game",
      "time": "17:30",
      "opponent": "FAH",
      "court": "5",
      "firstHalfSitting": ["Hanna", "Jack", "Josh"],
      "secondHalfSitting": ["Jenn", "Scott", "David"]
    },
    {
      "type": "ref",
      "time": "18:05",
      "court": "2",
      "game": "WHAM! vs Outsiders",
      "refs": ["Ky", "Hanna", "Jenn"]
    }
  ]
}
```

**Step 3: Commit**

```bash
git add src/data/
git commit -m "feat: add C-Class Heroes schedule and rename BAVAP data file"
```

---

### Task 3: Create ScheduleView component

**Files:**
- Create: `src/components/ScheduleView.jsx`

**Step 1: Create ScheduleView component**

Extract the main logic from App.jsx into a reusable component that takes schedule data as a prop.

Create `src/components/ScheduleView.jsx`:

```jsx
import { useState, useMemo, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
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
        <ScheduleTimeline events={filteredEvents} selectedPlayer={selectedPlayer} showPlaying={showPlaying} />
      </main>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/ScheduleView.jsx
git commit -m "feat: create ScheduleView component extracted from App"
```

---

### Task 4: Create TeamSelector component

**Files:**
- Create: `src/components/TeamSelector.jsx`

**Step 1: Create TeamSelector component**

Create `src/components/TeamSelector.jsx`:

```jsx
import { Link } from "react-router-dom";

const teams = [
  { slug: "bavap", name: "BAVAP" },
  { slug: "c-class-heroes", name: "C-Class Heroes" },
];

export default function TeamSelector() {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">2026 Dodgeball Toronto Kickoff</h1>
      <p className="text-gray-600 mb-8">Select your team</p>
      <div className="flex flex-col gap-4 w-full max-w-sm">
        {teams.map((team) => (
          <Link
            key={team.slug}
            to={`/${team.slug}`}
            className="bg-white rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-500"
          >
            <span className="text-xl font-semibold text-gray-800">{team.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/TeamSelector.jsx
git commit -m "feat: create TeamSelector landing page component"
```

---

### Task 5: Update Header component with back link

**Files:**
- Modify: `src/components/Header.jsx`

**Step 1: Add back link to Header**

Update `src/components/Header.jsx` to accept a `showBackLink` prop and display a link back to team selector.

Add import at top:
```jsx
import { Link } from "react-router-dom";
```

Update function signature:
```jsx
export default function Header({ teamName, tournamentName, players, selectedPlayer, onPlayerChange, showPlaying, onToggleView, showBackLink = false }) {
```

Add back link in the header, replace line 28 (`<h1 className="text-2xl font-bold">{teamName}</h1>`):
```jsx
<div className="flex items-center gap-2">
  {showBackLink && (
    <Link to="/" className="text-gray-400 hover:text-white transition-colors">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </Link>
  )}
  <h1 className="text-2xl font-bold">{teamName}</h1>
</div>
```

**Step 2: Commit**

```bash
git add src/components/Header.jsx
git commit -m "feat: add back link to Header component"
```

---

### Task 6: Update RefCard to show game info

**Files:**
- Modify: `src/components/RefCard.jsx`

**Step 1: Add game info display**

Update `src/components/RefCard.jsx` to display the optional `game` field:

```jsx
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
```

**Step 2: Commit**

```bash
git add src/components/RefCard.jsx
git commit -m "feat: display game info in RefCard"
```

---

### Task 7: Update main.jsx with BrowserRouter

**Files:**
- Modify: `src/main.jsx`

**Step 1: Wrap App in BrowserRouter**

Update `src/main.jsx`:

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

**Step 2: Commit**

```bash
git add src/main.jsx
git commit -m "feat: add BrowserRouter to main.jsx"
```

---

### Task 8: Update App.jsx with route configuration

**Files:**
- Modify: `src/App.jsx`

**Step 1: Replace App.jsx with router configuration**

Update `src/App.jsx`:

```jsx
import { Routes, Route } from "react-router-dom";
import TeamSelector from "./components/TeamSelector";
import ScheduleView from "./components/ScheduleView";
import bavapData from "./data/bavap.json";
import cClassHeroesData from "./data/c-class-heroes.json";

function App() {
  return (
    <Routes>
      <Route path="/" element={<TeamSelector />} />
      <Route path="/bavap" element={<ScheduleView scheduleData={bavapData} />} />
      <Route path="/c-class-heroes" element={<ScheduleView scheduleData={cClassHeroesData} />} />
    </Routes>
  );
}

export default App;
```

**Step 2: Commit**

```bash
git add src/App.jsx
git commit -m "feat: configure routes for team selection and schedules"
```

---

### Task 9: Test the application

**Step 1: Start the dev server**

Run: `npm run dev`

**Step 2: Manual testing checklist**

- [ ] Visit `/` - should show team selector with BAVAP and C-Class Heroes
- [ ] Click BAVAP - should navigate to `/bavap` with BAVAP schedule
- [ ] Click back arrow - should return to `/`
- [ ] Click C-Class Heroes - should navigate to `/c-class-heroes` with C-Class Heroes schedule
- [ ] Test player dropdown on both team pages
- [ ] Test sitting/playing toggle on both team pages
- [ ] Verify ref cards show game info for C-Class Heroes

**Step 3: Build verification**

Run: `npm run build`
Expected: Build succeeds without errors

**Step 4: Final commit (if any fixes needed)**

---

### Task 10: Create final summary commit

**Step 1: Review all changes**

Run: `git status` and `git log --oneline -10`

**Step 2: Push branch (if ready for PR)**

Run: `git push -u origin feature/multi-team-routing`
