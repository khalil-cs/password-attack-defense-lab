# Password Attack & Defense Lab (v2)

A local educational React application that demonstrates a **password guessing simulation**,
two configurable **defences** (rate limiting and temporary account lockout), a
**password strength checker**, and a **hashing / salting demo**.

## Safety and scope
- Uses one fictional account and a small, fixed set of built-in test values.
- Runs entirely in the browser; it does not connect to any real website, account, API or network target.
- Does not accept external targets, wordlists or automated credential lists.
- Typed passwords are never stored or logged (the activity log shows dots only).
- This is a teaching simulation, not production authentication software.

## Demo credentials (fictional)
- Username: `student.demo`
- Password: `Maple!2026`

## Requirements
- Node.js 20.19+ (or 22.12+), LTS recommended
- npm
- VS Code (recommended)

## Run locally
```bash
npm install
npm run dev
```
Open the address printed by Vite (usually `http://localhost:5173`).
Use `localhost` (not a LAN IP) so the browser's crypto API works for the hashing demo.

## Build for deployment
```bash
npm run build
```
The production files are generated in the `dist` folder. Fonts are bundled, so the app works offline.

## What is in the app
| Page | What it shows |
|---|---|
| Overview | Live statistics, defence status, a four-step demo flow, recent activity |
| Login Demo | A fictional login that uses the same rules as the simulation. Wrong passwords count toward lockout, with a live countdown |
| Attack Lab | Animated, one-guess-at-a-time simulation with live status for each guess |
| Protection | Separate switches and sliders for rate limiting (attempts per time window) and lockout (failures before lock, lock duration) |
| Password Tools | Strength meter with estimated crack times, and a plain text vs SHA-256 vs salted vs PBKDF2 comparison for two users |
| Activity Log | Timestamped record of every attempt, block, lock and unlock |
| How It Works | Explanations, a 5-minute demo script and 8 viva questions with answers |

## How the defences work in this model
- **Rate limiting:** at most N attempts are accepted per time window. Extra attempts are blocked without being checked (default 3 per 10 s).
- **Account lockout:** N failed attempts in a row lock the account for S seconds, then it unlocks automatically (default 3 fails, 30 s).
- Both run through one shared "login server" function, so the manual form and the simulation behave identically.

## Suggested demonstration (about 5 minutes)
1. **Login Demo:** sign in correctly, then enter three wrong passwords and show the lockout countdown.
2. **Protection:** switch both protections off. Click *Reset lab* on the Overview page.
3. **Attack Lab:** run the simulation. All guesses are tried and the password is found.
4. **Protection:** switch protections on, reset, and run again. Later guesses are blocked and the password is not found.
5. **Activity Log:** compare the runs; explain rate limiting vs lockout.
6. **Password Tools:** compare a weak and a strong password, then explain salting and slow hashing.
7. Click **Presentation view** (top right) to enlarge all text for a projector.

## Important technical limitation
The authentication and protections are simulated in client-side React state. Browser-side checks can be inspected or changed by a user, so they are not suitable for securing a real application. Real authentication and rate limiting must be enforced on a server. Real systems should also use salted slow password hashing (bcrypt / Argon2), multi-factor authentication, secure recovery, monitoring and secure session management.

## Project structure
```
src/
  App.jsx              shared attempt engine, timers, layout
  lib/security.js      strength analysis and Web Crypto hashing helpers
  components/ui.jsx    stat cards, toggle, slider, log table
  pages/               one file per page
  styles.css           theme (slate / cream / terracotta / sage)
```
