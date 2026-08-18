# Retro Multiplayer Tron — Roadmap & Backlog

This document outlines upcoming architectural improvements, networking enhancements, and gameplay features for the Retro Multiplayer Tron project.

---

## Milestone 1: Network Resilience & Latency

Focus on optimizing real-time packet delivery, handling unstable or high-latency connections, and managing disconnections gracefully.

- [ ] **Connection Quality Indicator (CQI)**
  - *Problem:* Players on high-latency networks (e.g. mobile 4G or cross-border Wi-Fi with 80–200ms ping) experience delayed cycle turns without clear feedback.
  - *Proposed Solution:* Display a live signal badge in the header/settings:
    - 🟢 **Optimal:** $< 50\text{ms}$
    - 🟡 **Moderate:** $50 - 120\text{ms}$
    - 🔴 **High Latency:** $> 120\text{ms}$ (displays warning toast: *"High latency detected (~X ms). Turns may feel delayed."*).
- [ ] **Smooth Reconnection Handling**
  - *Problem:* Page reload or brief mobile carrier drops disconnect the player and can leave the session in an inconsistent state.
  - *Proposed Solution:* Preserve session token / player ID in `sessionStorage`. When the client reconnects via `/ws`, automatically send a `RECONNECT` handshake to re-associate the WebSocket with the existing player seat and restore current scores.
- [ ] **Disconnected Player Lifecycle & Trail Ghosting**
  - *Problem:* A disconnected player currently remains as a stationary, killable obstacle line on the grid.
  - *Proposed Solution:* When a socket disconnects mid-match:
    - Stop movement updates for that player.
    - Trigger an immediate elimination explosion and clear their trail from `Arena.fields` so remaining players do not crash into an inactive ghost trail.
    - Keep their entry on the scoreboard marked with a `[Disconnected]` badge so they can rejoin on subsequent rounds.
- [ ] **Binary Delta Streaming (Optional Optimization)**
  - *Problem:* JSON array strings `[[x, y, color], ...]` have JSON serialization and parsing overhead during fast multi-explosion frames.
  - *Proposed Solution:* Pack delta updates into compact `Uint8Array` binary buffers (3 bytes per cell: `[X, Y, Value]`) over the WebSocket for lightweight mobile network throughput.

---

## Milestone 2: Game Room & Server Lifecycle

Focus on room privacy, concurrent server capacity, and process recovery.

- [ ] **Hidden / Unlisted Private Games**
  - *Problem:* All games are currently broadcast publicly to the lobby list.
  - *Proposed Solution:*
    - Add a "Private / Unlisted" toggle in the game creation form (`isPublic: false`).
    - Exclude unlisted games from `MSG_TYPE.LOBBY_LIST`.
    - Allow players to join directly via URL hash (`https://domain.com/#gameId`) or a "Join by Game ID" input field.
- [ ] **Server Concurrency & Capacity Limits**
  - *Problem:* Unlimited concurrent games could overload a single Node.js event loop during high traffic.
  - *Proposed Solution:*
    - Benchmark the target server CPU usage under concurrent match simulations (e.g. 50–100 active rooms).
    - Introduce a configurable `MAX_ACTIVE_GAMES` cap in server config, returning a friendly "Server at capacity" message when limits are reached.
- [ ] **Match State Persistence & Graceful Restart Recovery**
  - *Problem:* Restarting the Node server daemon terminates all active games and wipes accumulated scores.
  - *Proposed Solution:* Periodically persist lightweight room metadata and score tallies to disk (or SQLite/Redis) so in-flight scores can be restored after service restarts.

---

## Milestone 3: Polish & Game Modes

Focus on scoring UX, visual artifact cleanups, retro audio, and single-player options.

- [ ] **Scoreboard Sorted by Score**
  - *Problem:* Scoreboard currently displays players in registration order (Player 0, 1, 2...).
  - *Proposed Solution:* Sort the scoreboard rows descending by total points (`total`), with visual position rank badges (1st, 2nd, 3rd, etc.).
- [ ] **Explosion Ghosting Bug Verification**
  - *Problem:* In earlier versions, residual explosion particles from a previous round would occasionally persist or flash on the canvas at the start of a new round.
  - *Proposed Solution:* Verify that `Arena.reset()` cleanly clears `this.explosions = []` and that the hybrid delta renderer's local `Int8Array` buffer resets all cells to `CELL_TYPE.EMPTY` / `CELL_TYPE.BORDER` upon match start.
- [ ] **Procedural Retro Web Audio SFX (Zero Assets)**
  - *Proposed Solution:* Implement synthesized chiptune audio via the browser's native Web Audio API (zero audio file downloads):
    - Light-cycle engine hum
    - Direction turn click (blip)
    - Collision & particle explosion crunch noise
    - Victory / game over fanfare
    - Mute audio toggle in Settings.
- [ ] **Single-Player Practice Bot (AI)**
  - *Proposed Solution:* A lightweight survival heuristic bot (wall avoidance + flood-fill open space navigation) for offline or solo practice when no lobby opponents are available.

---

## Milestone 4: Mobile & Touch Experience

Focus on mobile ergonomics, touch input latency, and display scaling.

- [ ] **Mobile Landscape 16:10 Layout**
  - *Dedicated Plan:* [`docs/plans/2026-08-17-mobile-landscape-layout.md`](file:///home/hidden/projects/tron/docs/plans/2026-08-17-mobile-landscape-layout.md)
  - Height-driven 16:10 aspect ratio scaling for smartphones and tablets.
  - Ergonomic split thumb controls flanking the arena canvas (Retro handheld style).
- [ ] **Instant Touch Reactivity (`pointerdown` & Input Queue)**
  - *Problem:* Standard `click` handlers on mobile have a 100–300ms tap delay, and rapid successive taps get dropped or misinterpreted as zoom gestures.
  - *Proposed Solution:*
    - Switch button touch handlers to `pointerdown` / `touchstart` with `touch-action: manipulation`.
    - Implement a client-side direction buffer queue so rapid turns (e.g. Left $\rightarrow$ Right within $<30\text{ms}$) are not lost before the server's next physics tick.
- [ ] **High-DPI / Zoom & Resolution Audit**
  - Verify that canvas sharpness, CSS variables, and touch boundaries adapt cleanly across 1x, 2x, and 3x device pixel ratios (Retina displays, foldable phones, and zoomed browser windows).
