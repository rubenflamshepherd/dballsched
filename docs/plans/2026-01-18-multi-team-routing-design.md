# Multi-Team Routing Design

## Overview

Add support for multiple teams with path-based routing. Users can navigate between team schedules via clean URLs.

## Routes

- `/` - Team selector landing page with links to all teams
- `/bavap` - Existing BAVAP schedule
- `/c-class-heroes` - New C-Class Heroes schedule

## Data Structure

### Schedule Files

- `src/data/bavap.json` (renamed from `schedule.json`)
- `src/data/c-class-heroes.json` (new)

### C-Class Heroes Roster (11 players)

Micaela, Ky, Raf, Leah, Jack, Josh, Cynthia, Scott, David, Hanna, Jenn

### C-Class Heroes Schedule

**Games:**

| Time  | Court | Opponent      | Sitting 1st Half      | Sitting 2nd Half      |
|-------|-------|---------------|----------------------|----------------------|
| 14:00 | 6     | Cyber Ducks   | Micaela, Ky, Raf     | Leah, Jack, Josh     |
| 15:10 | 7     | Mixed Berries | Cynthia, Scott, David| Hanna, Jack, Josh    |
| 16:20 | 3     | Chickens      | Jenn, Ky, Raf        | Micaela, Scott, David|
| 16:55 | 5     | Toronto Blitz | Leah, Ky, Raf        | Cynthia, Scott, David|
| 17:30 | 5     | FAH           | Hanna, Jack, Josh    | Jenn, Scott, David   |

**Reffing:**

| Time  | Court | Game                              | Refs                  |
|-------|-------|-----------------------------------|----------------------|
| 13:25 | 6     | Bankai 2.0 vs Reck my ASScend     | Raf, Jack, Josh      |
| 15:45 | 3     | Mildly Irritated vs Who Needs Jonny| Cynthia, Leah, Mica  |
| 18:05 | 2     | WHAM! vs Outsiders                | Ky, Hanna, Jenn      |

## Component Architecture

### New Components

- `TeamSelector.jsx` - Landing page at `/` with cards/links to each team
- `ScheduleView.jsx` - Extracted from current App.jsx, handles player filtering, view toggle, notifications

### Modified Components

- `main.jsx` - Add BrowserRouter wrapper
- `App.jsx` - Router configuration only
- `Header.jsx` - Add team name display and "Back to teams" link
- `RefCard.jsx` - Handle optional `game` field

### Unchanged Components

- `Timeline.jsx`
- `GameCard.jsx`
- `BreakCard.jsx`

## Implementation Steps

1. Install react-router-dom
2. Rename `schedule.json` to `bavap.json`
3. Create `c-class-heroes.json` with new schedule data
4. Add BrowserRouter to `main.jsx`
5. Create `ScheduleView.jsx` by extracting logic from `App.jsx`
6. Refactor `App.jsx` to be router configuration
7. Create `TeamSelector.jsx` landing page
8. Update `Header.jsx` with team name and back link
9. Update `RefCard.jsx` to show game info for ref events
