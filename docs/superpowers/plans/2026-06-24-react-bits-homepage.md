# React Bits Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current static homepage as a concise Vite React landing page with a premium yin-yang motion hero inspired by React Bits.

**Architecture:** Convert the single-page static files into a Vite React app. Keep content data in small arrays, use one reusable `YinYangOrb` component for the animated hero object, and keep business logic for the share-card preview inside `App.jsx`.

**Tech Stack:** Vite, React, Vitest, Testing Library, CSS animations/canvas-free SVG/CSS motion, Impeccable detector.

---

### Task 1: React/Vite Test Harness

**Files:**
- Create: `package.json`
- Create: `src/App.test.jsx`
- Create: `src/test/setup.js`

- [ ] **Step 1: Write failing smoke tests**

Create a test that imports `App` from `src/App.jsx`, renders it, expects the brand title, expects concise section count, and expects a yin-yang orb element. This must fail because `src/App.jsx` does not exist yet.

- [ ] **Step 2: Run the test and verify red**

Run: `npm test -- --run`
Expected: fail with a missing `src/App.jsx` module or missing React test dependency before implementation exists.

### Task 2: React Homepage Implementation

**Files:**
- Create: `src/App.jsx`
- Create: `src/main.jsx`
- Modify: `index.html`
- Replace: `styles.css`
- Remove legacy dependency from: `script.js` by no longer loading it

- [ ] **Step 1: Implement app structure**

Build a concise homepage with five bands: hero, free reading form, core abilities, method proof, FAQ/final CTA.

- [ ] **Step 2: Add React Bits-inspired orb**

Create `YinYangOrb` as a React component with layered rotating yin-yang, orbit rings, and gua lines. It must respect `prefers-reduced-motion`.

- [ ] **Step 3: Wire share-card state**

Changing the focus select updates the card title, tags, and sentence immediately.

### Task 3: Verification and Polish

**Files:**
- Modify as needed: `src/App.jsx`, `styles.css`, `index.html`

- [ ] **Step 1: Run unit tests**

Run: `npm test -- --run`
Expected: all tests pass.

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Vite build succeeds.

- [ ] **Step 3: Run Impeccable detector**

Run: `node .agents/skills/impeccable/scripts/detect.mjs --json index.html styles.css src`
Expected: no findings or only intentional findings fixed before final.

- [ ] **Step 4: Browser verification**

Run local preview, test desktop and 390px mobile for no horizontal overflow, no console errors, animated orb presence, and focus-select card update.
