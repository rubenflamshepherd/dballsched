# Current Time Block Highlight

## Overview

Emphasize the current time block in the schedule with a colored glow effect.

## Design

### Visual Treatment

The current time block receives a background glow that matches its card type:
- **Game cards** → Blue glow
- **Ref cards** → Orange glow
- **Break cards** → Gray glow

Implementation uses Tailwind's colored shadow utilities (e.g., `shadow-lg shadow-blue-400/50`).

### Determining "Current"

A block is current when:
- Current time is at or after this block's start time
- Current time is before the next block's start time

Edge cases:
- Before first block → no highlight
- After last block → no highlight

### Implementation

1. `Timeline.jsx` already calculates `isPast` for opacity fading
2. Add `isCurrent` calculation using same time comparison logic
3. Pass `isCurrent` prop to card components
4. Cards apply conditional glow class when `isCurrent` is true

### Files to Modify

- `src/components/Timeline.jsx` - Add `isCurrent` logic
- `src/components/GameCard.jsx` - Add conditional glow styling
- `src/components/RefCard.jsx` - Add conditional glow styling
- `src/components/BreakCard.jsx` - Add conditional glow styling
