# Retro Multiplayer Tron Game

A multiplayer retro Tron light-cycle game built with Node.js, Express, HTML5 Canvas, and WebSockets.

---

## Historical & Algorithmic References

* Some infos taken from: [mist64/ultimatetron2](https://github.com/mist64/ultimatetron2)
* Score calculation from: [mist64/ultimatetron2/basic.bas](https://github.com/mist64/ultimatetron2/blob/master/basic.bas)
* Fixed timestep game loop reference: [Glenn Fiedler - Fix Your Timestep!](https://gafferongames.com/post/fix_your_timestep/)
* MDN Game Loop Architecture: [MDN - Anatomy of a Video Game](https://developer.mozilla.org/en-US/docs/Games/Anatomy#building_a_main_loop_in_javascript)
* MDN Resolution & Zoom Listener: [MDN - Window devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio#monitoring_screen_resolution_or_zoom_level_changes)

---

## Architecture Overview

```
tron/
├── shared/                     # Isomorphic modules (Node.js & Browser)
│   ├── constants.js            # Grid dimensions, speeds, colors, starting positions
│   ├── protocol.js             # Typed WebSocket action & event constants
│   ├── Player.js               # Pure Player model (direction stack, position, killzone)
│   └── utils.js                # Shared utilities (shuffle, random, ordinal formatting)
├── server/                     # Backend domain logic & match simulation
│   ├── Arena.js                # 2D collision grid, simultaneous crash resolution, explosions
│   ├── Explosion.js            # Particle explosion physics simulation
│   ├── GameSession.js          # Target-Timestamp game loop scheduler & score calculation
│   ├── GameServer.js           # In-memory registry of active game sessions
│   └── wsHandler.js            # Unified WebSocket server (/ws) with input sanitization
├── public/                     # Frontend client assets
│   ├── javascripts/
│   │   ├── main.js             # Main application orchestrator & input binding
│   │   ├── network.js          # Unified WebSocket client singleton & ping heartbeat
│   │   ├── state.js            # Central reactive client state store (pub/sub)
│   │   ├── Renderer.js         # Hybrid delta canvas renderer with DPR scaling
│   │   ├── settings.js         # User preferences & localStorage persistence
│   │   ├── theme.js            # Live computed CSS variable color reader & observer
│   │   └── ui/                 # Modular view controllers
│   │       ├── dropdown.js     # Dropdown menu controller
│   │       ├── settingsView.js # Theme, speed, and visibility toggles
│   │       ├── lobbyView.js    # Game list & creation form
│   │       ├── configView.js   # Player registration & key binding setup
│   │       └── gameView.js     # Scoreboard, arena display, & player position badges
│   └── stylesheets/            # Vanilla CSS design system
└── docs/plans/                 # Architecture roadmap & mobile layout plans
```

---

## Key Features

1. **Target-Timestamp Server Game Loop**: Tracks absolute target time (`nextTickTime`) to absorb both OS timer jitter and physics computation time without busy-polling.
2. **Unified WebSocket Protocol**: Single persistent connection handling lobby, room-scoped gameplay messaging, and in-band latency ping heartbeats.
3. **Input Sanitization**: Server-side clamping of grid size, frame intervals, player names, and movement directions.
4. **Hybrid Delta Canvas Renderer**: Local `Int8Array` grid buffer with delta cell painting ($O(k)$ per frame) and full redraws on theme or DPR changes.
5. **Simultaneous 2-in-1 Spot Collision**: Equal mutual kill credit and position rollback when two players enter the same cell in the same tick.

---

## Development

```bash
# Install dependencies
npm install

# Start server (default: port 3000)
npm start

# Run linter
npx eslint .
```

---

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the prioritized backlog across Network Resilience, Server Lifecycle, Gameplay Polish, and Mobile Layout.
