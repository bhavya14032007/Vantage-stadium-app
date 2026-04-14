/**
 * useStadiumData — interval-based mock data generator
 * Simulates live IoT data: crowd density, wait times, friend positions.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

/* ─── Static venue topology ──────────────────────────────── */
export const SECTIONS = [
  { id: 'A1', label: 'Sec A1', x: 80,  y: 60,  w: 70, h: 50, type: 'seating' },
  { id: 'A2', label: 'Sec A2', x: 160, y: 60,  w: 70, h: 50, type: 'seating' },
  { id: 'A3', label: 'Sec A3', x: 240, y: 60,  w: 70, h: 50, type: 'seating' },
  { id: 'B1', label: 'Sec B1', x: 80,  y: 200, w: 70, h: 50, type: 'seating' },
  { id: 'B2', label: 'Sec B2', x: 160, y: 200, w: 70, h: 50, type: 'seating' },
  { id: 'B3', label: 'Sec B3', x: 240, y: 200, w: 70, h: 50, type: 'seating' },
  { id: 'C1', label: 'Sec C1', x: 80,  y: 340, w: 70, h: 50, type: 'seating' },
  { id: 'C2', label: 'Sec C2', x: 160, y: 340, w: 70, h: 50, type: 'seating' },
  { id: 'C3', label: 'Sec C3', x: 240, y: 340, w: 70, h: 50, type: 'seating' },
];

export const AMENITIES = [
  { id: 'rest_A', label: 'WC North', icon: '🚻', x: 155, y: 125, type: 'restroom' },
  { id: 'rest_B', label: 'WC South', icon: '🚻', x: 155, y: 280, type: 'restroom' },
  { id: 'con_A',  label: 'Concession 1', icon: '🍟', x: 330, y: 120, type: 'concession' },
  { id: 'con_B',  label: 'Concession 2', icon: '🍔', x: 40,  y: 280, type: 'concession' },
  { id: 'med_A',  label: 'Medical', icon: '🏥', x: 330, y: 280, type: 'medical' },
];

export const EXITS = [
  { id: 'exit_N', label: 'Gate North', x: 195, y: 15, clearLevel: 'clear', shuttleWait: 4 },
  { id: 'exit_S', label: 'Gate South', x: 195, y: 420, clearLevel: 'busy', shuttleWait: 11 },
  { id: 'exit_E', label: 'Gate East', x: 395, y: 210, clearLevel: 'clear', shuttleWait: 2 },
  { id: 'exit_W', label: 'Gate West', x: 35, y: 210, clearLevel: 'avoid', shuttleWait: 19 },
];

/* ─── Graph for A* pathfinding (grid cells 20x20px) ─────── */
const GRID_W = 22; // cells across
const GRID_H = 25; // cells down

function buildGrid(densities) {
  const grid = Array.from({ length: GRID_H }, () =>
    Array.from({ length: GRID_W }, () => ({ walkable: true, cost: 1 }))
  );
  // Mark walls (field / pitch in center)
  for (let gy = 6; gy <= 17; gy++) {
    for (let gx = 7; gx <= 14; gx++) {
      grid[gy][gx].walkable = false;
    }
  }
  // Map density to cost
  SECTIONS.forEach(sec => {
    const density = densities[sec.id] || 0;
    const cellX = Math.floor((sec.x + sec.w / 2) / 20);
    const cellY = Math.floor((sec.y + sec.h / 2) / 20);
    const cost = density > 75 ? 99 : density > 50 ? 5 : 2;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const cy = cellY + dy; const cx = cellX + dx;
        if (cy >= 0 && cy < GRID_H && cx >= 0 && cx < GRID_W) {
          grid[cy][cx].cost = density > 75 ? 99 : cost;
        }
      }
    }
  });
  return grid;
}

/* ─── A* Implementation ─────────────────────────────────── */
function heuristic(a, b) {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

export function aStarPath(densities, startCell, goalCell) {
  const grid = buildGrid(densities);
  const open = [];
  const closed = new Set();
  const gCost = {};
  const parent = {};

  const key = (x, y) => `${x},${y}`;
  const startKey = key(startCell.x, startCell.y);
  const goalKey  = key(goalCell.x, goalCell.y);

  gCost[startKey] = 0;
  open.push({ ...startCell, f: heuristic(startCell, goalCell) });

  const dirs = [
    { x: 1, y: 0 }, { x: -1, y: 0 }, { x: 0, y: 1 }, { x: 0, y: -1 },
    { x: 1, y: 1 }, { x: -1, y: -1 }, { x: 1, y: -1 }, { x: -1, y: 1 },
  ];

  let iterations = 0;
  while (open.length > 0 && iterations++ < 500) {
    open.sort((a, b) => a.f - b.f);
    const current = open.shift();
    const cKey = key(current.x, current.y);
    if (cKey === goalKey) {
      // Reconstruct path
      const path = [];
      let k = goalKey;
      while (k) { const [px, py] = k.split(',').map(Number); path.unshift({ x: px, y: py }); k = parent[k]; }
      return path;
    }
    closed.add(cKey);

    for (const dir of dirs) {
      const nx = current.x + dir.x;
      const ny = current.y + dir.y;
      if (nx < 0 || ny < 0 || nx >= GRID_W || ny >= GRID_H) continue;
      const cell = grid[ny][nx];
      if (!cell.walkable || cell.cost >= 99) continue;
      const nKey = key(nx, ny);
      if (closed.has(nKey)) continue;

      const isDiag = dir.x !== 0 && dir.y !== 0;
      const moveCost = (isDiag ? 1.414 : 1) * cell.cost;
      const newG = (gCost[cKey] || 0) + moveCost;

      if (gCost[nKey] === undefined || newG < gCost[nKey]) {
        gCost[nKey] = newG;
        parent[nKey] = cKey;
        const f = newG + heuristic({ x: nx, y: ny }, goalCell);
        open.push({ x: nx, y: ny, f });
      }
    }
  }
  return []; // no path found
}

/* ─── Random helpers ─────────────────────────────────────── */
const clamp    = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const jitter   = (v, amt = 8) => clamp(v + (Math.random() - 0.5) * amt * 2, 0, 100);
const jitterAbs = (v, lo, hi, amt = 2) => clamp(v + (Math.random() - 0.5) * amt * 2, lo, hi);

/* ─── Initial density state ─────────────────────────────── */
function initDensities() {
  return {
    A1: 82, A2: 45, A3: 30,
    B1: 65, B2: 90, B3: 55,
    C1: 20, C2: 40, C3: 72,
  };
}

/* ─── Initial wait times ─────────────────────────────────── */
function initWaitTimes() {
  return {
    rest_A: { current: 12, nearby: { label: 'WC East (Sec B3)', wait: 0, distance: 3 } },
    rest_B: { current: 7,  nearby: { label: 'WC West (Sec B1)', wait: 2, distance: 5 } },
    con_A:  { current: 9,  nearby: { label: 'Food Truck C2',    wait: 1, distance: 4 } },
    con_B:  { current: 4,  nearby: { label: 'Kiosk A1',         wait: 0, distance: 6 } },
  };
}

/* ─── Initial friends ────────────────────────────────────── */
function initFriends() {
  return [
    { id: 'f1', name: 'Arjun', avatar: '🧑‍🦱', section: 'A2', x: 195, y: 85,  status: 'online' },
    { id: 'f2', name: 'Priya', avatar: '👩‍🦰', section: 'B3', x: 268, y: 220, status: 'online' },
    { id: 'f3', name: 'Rohan', avatar: '🧔', section: 'C1', x: 115, y: 358, status: 'away' },
  ];
}

/* ─── Initial orders ─────────────────────────────────────── */
function initOrders() {
  return [
    { id: 'o1', item: 'Spicy Loaded Fries', emoji: '🍟', price: 180, timeToReady: 18, totalTime: 18, status: 'preparing', notified: false },
    { id: 'o2', item: 'Stadium Burger',     emoji: '🍔', price: 250, timeToReady: 0,  totalTime: 12, status: 'ready',    notified: true  },
  ];
}

/* ─── Main hook ──────────────────────────────────────────── */
export function useStadiumData(tickMs = 3000) {
  const [densities,  setDensities]  = useState(initDensities);
  const [waitTimes,  setWaitTimes]  = useState(initWaitTimes);
  const [friends,    setFriends]    = useState(initFriends);
  const [orders,     setOrders]     = useState(initOrders);
  const [tickCount,  setTickCount]  = useState(0);
  const tickRef = useRef(0);

  const tick = useCallback(() => {
    tickRef.current += 1;
    const t = tickRef.current;

    // Density drift
    setDensities(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => { next[id] = Math.round(jitter(next[id], 6)); });
      return next;
    });

    // Wait time drift
    setWaitTimes(prev => {
      const next = { ...prev };
      Object.keys(next).forEach(id => {
        next[id] = {
          ...next[id],
          current: Math.round(jitterAbs(next[id].current, 0, 20, 2)),
          nearby: {
            ...next[id].nearby,
            wait: Math.round(jitterAbs(next[id].nearby.wait, 0, 8, 1)),
          },
        };
      });
      return next;
    });

    // Friend position drift (small movements)
    setFriends(prev => prev.map(f => ({
      ...f,
      x: clamp(f.x + (Math.random() - 0.5) * 10, 70, 380),
      y: clamp(f.y + (Math.random() - 0.5) * 8, 50, 400),
    })));

    // Order countdown
    setOrders(prev => prev.map(o => {
      if (o.status === 'ready' || o.status === 'delivered') return o;
      const newTime = Math.max(0, o.timeToReady - Math.ceil(tickMs / 60000));
      const shouldNotify = newTime <= 2 && !o.notified;
      return {
        ...o,
        timeToReady: newTime,
        status: newTime === 0 ? 'ready' : 'preparing',
        notified: o.notified || shouldNotify,
      };
    }));

    setTickCount(t);
  }, [tickMs]);

  useEffect(() => {
    const id = setInterval(tick, tickMs);
    return () => clearInterval(id);
  }, [tick, tickMs]);

  return { densities, waitTimes, friends, orders, setOrders, tickCount };
}

/* ─── Density helpers ────────────────────────────────────── */
export function densityLevel(v) {
  if (v > 75) return 'red';
  if (v > 50) return 'amber';
  return 'green';
}
export function densityLabel(v) {
  if (v > 75) return 'Congested';
  if (v > 50) return 'Busy';
  return 'Clear';
}
