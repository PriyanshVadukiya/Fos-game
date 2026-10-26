# System Call Telephone Game

An interactive web app that teaches how real-world applications (VS Code, Chrome, shell pipes, etc.) translate high-level user actions into sequences of kernel system calls.

## Quick Start

### 1. Backend

```bash
cd backend
npm install
npm run dev        # starts on http://localhost:4000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev        # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Project Structure

```
/
├── backend/
│   ├── src/
│   │   ├── server.ts              # Express + Socket.io entry point
│   │   ├── types.ts               # Shared TypeScript interfaces
│   │   ├── data/
│   │   │   └── levels.ts          # All game levels & correct sequences
│   │   ├── routes/
│   │   │   └── levels.ts          # REST API routes
│   │   └── socket/
│   │       └── simulation.ts      # WebSocket simulation event handlers
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/
    ├── src/
    │   ├── main.tsx               # React entry point
    │   ├── App.tsx                # Root component, screen routing
    │   ├── types.ts               # Frontend TypeScript interfaces
    │   ├── index.css              # Tailwind + global styles
    │   ├── lib/
    │   │   ├── api.ts             # REST API client
    │   │   ├── socket.ts          # Socket.io singleton
    │   │   └── syscallMeta.ts     # Syscall colors, icons, taglines
    │   ├── hooks/
    │   │   └── useSimulation.ts   # WebSocket simulation state hook
    │   └── components/
    │       ├── Header.tsx
    │       ├── Dashboard.tsx      # Level selector
    │       ├── GameBoard.tsx      # Main game orchestrator
    │       ├── SyscallChip.tsx    # Styled syscall badge
    │       ├── SyscallSequencer.tsx # Drag-and-drop ordering UI
    │       ├── SimulationVisualizer.tsx # Animated pipeline canvas
    │       ├── KernelStatePanel.tsx     # Live kernel state display
    │       └── ResultModal.tsx    # Success / failure modal
    ├── index.html
    ├── vite.config.ts
    ├── tailwind.config.ts
    └── package.json
```

## REST API

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/levels` | All level summaries |
| GET | `/api/levels/:id` | Single level |
| POST | `/api/levels/:id/validate` | Validate submitted sequence |
| GET | `/api/levels/:id/solution` | Reveal correct answer |
| GET | `/api/health` | Health check |

## WebSocket Events

| Direction | Event | Description |
|-----------|-------|-------------|
| Client → Server | `start-simulation` | Begin step-by-step replay |
| Client → Server | `cancel-simulation` | Abort running simulation |
| Server → Client | `simulation-started` | Simulation beginning |
| Server → Client | `pipeline-step-active` | Step is executing (with micro-description) |
| Server → Client | `kernel-state-updated` | New FD table / process table / disk state |
| Server → Client | `pipeline-step-complete` | Step finished |
| Server → Client | `simulation-complete` | All steps done |
| Server → Client | `simulation-cancelled` | Simulation aborted |

## Game Levels

| ID | Title | Difficulty | Key Syscalls |
|----|-------|-----------|--------------|
| `cat-file` | Run `cat file.txt` | Beginner | open → read → write → close |
| `save-vscode` | Save file in VS Code | Intermediate | stat → open → write → close |
| `launch-program` | Launch a new program | Intermediate | fork → exec → wait → exit |
| `pipe-ls-grep` | Run `ls \| grep .ts` | Advanced | pipe → fork → dup2 → exec → close → wait |
| `chrome-open-tab` | Chrome opens local HTML | Advanced | stat → open → read → close → fork |
