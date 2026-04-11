# Lyars — Frontend

Real-time multiplayer Russian Roulette client built with **React 19**, **TypeScript**, **Vite**, and **Socket.IO**. Players create or join a room, spin their revolvers, and take turns pulling the trigger.

## Tech Stack

| Layer     | Technology         |
| --------- | ------------------ |
| UI        | React 19           |
| Language  | TypeScript         |
| Bundler   | Vite               |
| Real-time | Socket.IO Client 4 |
| Styles    | CSS Modules        |

## Project Structure

```
src/
├── main.tsx               # App entry point
├── App.tsx                # Screen router
├── contexts/
│   ├── SocketContext.tsx  # Socket.IO singleton & provider
│   └── GameContext.tsx    # Global game state & reducer
├── screens/
│   ├── HomeScreen          # Create or join a room
│   ├── LobbyScreen         # Waiting room, player list
│   ├── GunScreen           # Active gameplay (spin & shoot)
│   ├── EliminatedScreen    # Shown when you get shot
│   └── GameOverScreen      # Winner announcement
├── components/
│   └── CylinderAnimation   # Revolver cylinder visual
├── hooks/                  # Shared custom hooks
└── assets/                 # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+
- The [lyars-back](../lyars-back) server running (locally or deployed)

### Install

```bash
npm install
```

### Environment Variables

Copy `.env.example` and set the backend URL:

```bash
cp .env.example .env
```

| Variable          | Description                                                     |
| ----------------- | --------------------------------------------------------------- |
| `VITE_SOCKET_URL` | Full URL of the Socket.IO server (e.g. `http://localhost:3001`) |

> In production, set this in your hosting provider's environment variables (e.g. Netlify → Site settings → Environment variables).

If `VITE_SOCKET_URL` is not set, the app falls back to `http://localhost:3001`.

### Run in Development

```bash
npm run dev
```

### Build for Production

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

---

## Game Flow

```
HomeScreen
  ├─ Create Room → LobbyScreen (as host)
  └─ Join Room   → LobbyScreen (as player)

LobbyScreen
  └─ Host starts game → GunScreen (all players)

GunScreen
  ├─ Host spins cylinders
  ├─ Each player pulls trigger
  ├─ Miss (click) → continue round
  ├─ Hit (bang)   → EliminatedScreen (shooter)
  │                 other players see elimination
  └─ Last survivor → GameOverScreen (all players)

GameOverScreen / EliminatedScreen
  └─ Host returns to lobby → LobbyScreen
```

---

## Socket.IO Events

The client emits and listens for the following events. See the [backend README](../lyars-back/README.md) for the full payload reference.

### Emitted by the client

| Event             | Who              | Description                            |
| ----------------- | ---------------- | -------------------------------------- |
| `create-room`     | Any player       | Creates a new room                     |
| `join-room`       | Any player       | Joins an existing room by code         |
| `leave-room`      | Any player       | Leaves the current room                |
| `spin-cylinder`   | Host only        | Loads a random chamber for each player |
| `pull-trigger`    | Any alive player | Fires their revolver                   |
| `return-to-lobby` | Host only        | Resets the game and returns to lobby   |

### Received by the client

| Event               | Description                                       |
| ------------------- | ------------------------------------------------- |
| `player-joined`     | A new player entered the room                     |
| `player-left`       | A player disconnected or left                     |
| `cylinder-spun`     | Cylinders have been spun                          |
| `click`             | A player fired and got an empty chamber           |
| `bang`              | You fired and the chamber was loaded (you're out) |
| `player-eliminated` | Another player was eliminated                     |
| `game-over`         | The game ended, winner announced                  |
| `return-to-lobby`   | Room reset, back to lobby                         |

---

## Deployment

The project deploys out-of-the-box on [Netlify](https://netlify.com).

1. Push to your repository.
2. Connect the repo to Netlify.
3. Set **Build Command**: `npm run build`
4. Set **Publish Directory**: `dist`
5. Add the `VITE_SOCKET_URL` environment variable pointing to your deployed backend.

---

## License

MIT
