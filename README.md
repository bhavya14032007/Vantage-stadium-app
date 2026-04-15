# 🏟️ Vantage — AI-Powered Stadium Companion

> **Eliminating "dead time" at large-scale sporting events (50,000+ attendees) to maximize "fan time."**

[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?logo=github)](https://github.com/bhavya14032007/Vantage-stadium-app)
![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Vite-61DAFB?logo=react)
![Mobile First](https://img.shields.io/badge/Design-Mobile--First-00ff88)

---

## 🎯 Chosen Vertical

**Large-Scale Sporting Event Logistics & Fan Experience**

Vantage targets the critical UX problem faced by fans at venues with 50,000+ attendees: losing precious "fan time" to crowd jams, long restroom queues, missed food pick-ups, and panicked exits.

---

## 🧠 Approach & Logic

The app is built as a **modular, component-driven single-page application** using React + Vite. All "real-time" data is simulated via an interval-based mock data generator (`useStadiumData`) that feeds the entire UI, making the prototype feel alive without a backend.

### Modules

| Module | Description |
|---|---|
| 🗺️ **Pulse Map** | Interactive SVG stadium floor plan with color-coded heat zones (crowd density). Includes a full **A\* pathfinding algorithm** that routes users to their seat while avoiding "Red" (congested) zones. |
| 📊 **Live-Wait Analytics** | Dashboard showing real-time queue lengths for restrooms and concessions. **Smart Suggestion logic** recommends the nearest lower-wait alternative with walk-time estimates. |
| 🍟 **Express Order** | Full food pre-order interface with cart, menu browsing, and a **Time-to-Ready** countdown. The system triggers a "Leave your seat now!" alert when the order is ≤2 minutes from completion. |
| 👥 **Friend Finder** | Shows group members' relative positions on a mini venue SVG map with live-updating coordinates. Supports meet-up request and message actions. |
| 🚨 **Emergency Flow** | A toggleable high-contrast emergency overlay that presents the **nearest clear exit**, live shuttle wait times, and a numbered safety steps guide — sorted by crowd clearance level. |

---

## ⚙️ How the Solution Works

```
useStadiumData (hook)
│
├── Crowd density per section → PulseMap (A* pathfinding)
├── Wait times per amenity → LiveWaitAnalytics (smart suggestions)
├── Friend positions → FriendFinder (SVG map pins)
├── Order state → ExpressOrder (countdown + notifications)
└── Exit data → EmergencyFlow (sorted by clearance level)
```

### A\* Pathfinding
- The stadium is overlaid with a **22×25 cell grid**.
- Sections with density >75% receive a node cost of 99 (effectively impassable).
- The algorithm finds the minimum-cost path from the user's section (B2) to the target, producing an SVG polyline route overlay.

### Real-Time Data Simulation
- `useStadiumData` runs a `setInterval` at 3500ms.
- Each tick applies **Gaussian-like random drift** (clamped to valid ranges) to densities, wait times, and friend positions, creating a realistic "live IoT" feel.

### Emergency Flow
- Exits are sorted first by clearance level (`clear → busy → avoid`), then by walking distance.
- The top `clear` exit is auto-recommended. Route lines are drawn from the user's position to every exit.

---

## 📐 Design System

| Token | Value |
|---|---|
| Primary Font | Inter (Google Fonts) |
| Display Font | Orbitron |
| Grid Unit | 8px |
| Action Green | `#00ff88` |
| Busy Amber | `#ffb700` |
| Avoid Red | `#ff3d5a` |
| Background | `#080c10` |

- All animations respect `prefers-reduced-motion`.
- Full keyboard accessibility (`tabIndex`, `aria-*` attributes, `onKeyDown` handlers).
- CSS custom properties for seamless theme switching.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + Vite 6
- **Icons:** lucide-react
- **Styling:** Vanilla CSS with CSS Custom Properties
- **Data:** Interval-based mock data generator (no backend required)
- **Fonts:** Google Fonts (Inter, Orbitron)

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.
**For best results, use DevTools → Toggle device toolbar → iPhone 14 Pro** (or similar mobile viewport).

---

## 📝 Assumptions Made

1. **User location** is fixed at Section B2, Row 14, Seat 7 (simulated GPS).
2. **Friend locations** are randomly drifted to simulate low-latency BLE/UWB coordinate updates.
3. **All wait times and densities** are simulated — in production these would come from IoT sensor feeds and computer-vision crowd counting.
4. **Order "Time-to-Ready"** decreases on each data tick. In a real system, this would sync with the POS/kitchen display system.
5. **A\* path costs** are simplified 2D grid costs — a real implementation would use actual venue topology graphs.
6. **Prices are in Indian Rupees (₹)** — venue is the Narendra Modi Stadium, Ahmedabad.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── PulseMap.jsx          # SVG heat map + A* routing
│   ├── LiveWaitAnalytics.jsx # Queue dashboard + smart suggestions
│   ├── ExpressOrder.jsx      # Food ordering + countdown
│   ├── FriendFinder.jsx      # Group coordination map
│   └── EmergencyFlow.jsx     # Exit strategy overlay
├── hooks/
│   └── useStadiumData.js     # Real-time mock data generator + A*
├── App.jsx                   # App shell + bottom navigation
├── main.jsx                  # Entry point
└── index.css                 # Global design system
```

---

*Built for GDG Prompt Wars Hackathon · 2026*
