# Live Interview Deepfake Detection — Signaling Server

A WebRTC signaling server built to support **real-time deepfake detection during remote interviews or exams** — checking whether the person on camera is genuinely who they claim to be, live, not just after the fact.

This is the real-time companion to my batch video analysis project: [deepfake-detection-backend](https://github.com/Shaghana-E/deepfake-detection-backend).

---

## What it does

- Manages **room-based WebRTC sessions** between an interviewer and a candidate using Socket.IO
- Handles the full WebRTC signaling handshake (offer/answer/ICE candidate exchange) needed to establish a live peer connection
- Proxies live video frames from the candidate's browser to the backend's `/analyze-frame` endpoint for real-time deepfake scoring
- Relays detection results (`detection-result` events) back to the room in real time

## How it works

Candidate joins room (candidate.html)
↓
WebRTC handshake via Socket.IO (offer/answer/ICE)
↓
Live video frames proxied to backend /analyze-frame (localhost:5000)
↓
Detection results relayed back to the room in real time


## Tech stack
Node.js, Express, Socket.IO, `http-proxy-middleware` (for proxying frames to the detection backend)

## What's implemented and tested
- **Candidate-side flow is fully built**: `public/candidate.html` lets a candidate enter a Room ID, select a camera source, and join an interview session.
- Room creation/joining, WebRTC signaling, and disconnect handling are all implemented in `server.js`.

## Known limitations
- **No interviewer-facing web page exists yet** — only `public/candidate.html`. The server supports a `create-room` event for an interviewer role, but there's currently no dedicated UI for it; room creation would need to be triggered directly (e.g., for testing) rather than through an interface.
- `cors: { origin: '*' }` is wide open, which is fine for local development but would need to be locked to a specific frontend URL for any real deployment.
- The proxy target (`http://localhost:5000`) is hardcoded to local development — would need to be updated to point at a deployed backend URL if hosted elsewhere.

## Setup & running locally
```bash
npm install
node server.js
```
Runs on `http://localhost:3001`. Requires the [backend](https://github.com/Shaghana-E/deepfake-detection-backend) running locally on port 5000 for live frame analysis to work end-to-end.

## Related repositories
- [deepfake-detection-backend](https://github.com/Shaghana-E/deepfake-detection-backend) — batch video/audio analysis pipeline
- Mobile app (React Native/Expo) — coming soon

---

**Author:** Shaghana E — MCA, College of Engineering, Guindy, Anna University (2026)
