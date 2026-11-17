import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  LayoutDashboard, LockKeyhole, FlaskConical, ShieldCheck, KeyRound,
  ClipboardList, BookOpen, Menu, X, ChevronRight, Info, Monitor, Timer,
} from 'lucide-react';
import { DEMO_USERNAME, DEMO_PASSWORD, TEST_GUESSES } from './lib/security.js';
import Overview from './pages/Overview.jsx';
import LoginDemo from './pages/LoginDemo.jsx';
import AttackLab from './pages/AttackLab.jsx';
import Protection from './pages/Protection.jsx';
import PasswordTools from './pages/PasswordTools.jsx';
import ActivityLog from './pages/ActivityLog.jsx';
import HowItWorks from './pages/HowItWorks.jsx';

const NAV = [
  { name: 'Overview', icon: LayoutDashboard },
  { name: 'Login Demo', icon: LockKeyhole },
  { name: 'Attack Lab', icon: FlaskConical },
  { name: 'Protection', icon: ShieldCheck },
  { name: 'Password Tools', icon: KeyRound },
  { name: 'Activity Log', icon: ClipboardList },
  { name: 'How It Works', icon: BookOpen },
];

export const DEFAULT_CONFIG = {
  rateLimit: true, rateMax: 3, rateWindow: 10,   // at most N attempts per window (seconds)
  lockout: true, lockThreshold: 3, lockSeconds: 30, // N failures in a row -> locked for S seconds
};

const EMPTY_STATS = { attempts: 0, failed: 0, blocked: 0, success: 0, rateBlocked: 0, lockBlocked: 0 };
const INITIAL_LOG = [{
  id: 0, time: '—', source: 'System', attempt: '—', kind: 'info',
  result: 'Ready', detail: 'Local demonstration initialised.',
}];
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function Sidebar({ active, open, onSelect, onClose }) {
  return (
    <aside className={`sidebar ${open ? 'open' : ''}`}>
      <div className="brand">
        <div className="brand-mark"><ShieldCheck size={22} /></div>
        <div><b>SECURITY LAB</b><span>EDUCATIONAL WORKSPACE</span></div>
        <button className="mobile-close icon-button" onClick={onClose} aria-label="Close menu"><X size={18} /></button>
      </div>
      <div className="side-label">WORKSPACE</div>
      <nav aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.name}
            className={`nav-item ${active === item.name ? 'selected' : ''}`}
            aria-current={active === item.name ? 'page' : undefined}
            onClick={() => onSelect(item.name)}
          >
            <item.icon size={18} /><span>{item.name}</span>
            {active === item.name && <ChevronRight size={15} className="nav-arrow" />}
          </button>
        ))}
      </nav>
      <div className="sidebar-bottom">
        <div className="local-note">
          <span className="status-dot" />
          <div><b>Local simulation</b><small>No external connection</small></div>
        </div>
        <div className="side-version">PASSWORD LAB <span>v2.0</span></div>
      </div>
    </aside>
  );
}

export default function App() {
  const [active, setActive] = useState('Overview');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [presentation, setPresentation] = useState(false);

  const [cfg, setCfg] = useState(DEFAULT_CONFIG);
  const [stats, setStats] = useState(EMPTY_STATS);
  const [logs, setLogs] = useState(INITIAL_LOG);
  const [lockedUntil, setLockedUntil] = useState(0);
  const [now, setNow] = useState(Date.now());
  const [simSteps, setSimSteps] = useState(null);
  const [simRunning, setSimRunning] = useState(false);

  // The "server" state lives in refs so the animated simulation always sees fresh values.
  const cfgRef = useRef(DEFAULT_CONFIG);
  const engine = useRef({ fails: 0, stamps: [], lockedUntil: 0 });
  const runId = useRef(0);
  const logId = useRef(1);

  const addLog = useCallback((source, attempt, kind, result, detail) => {
    const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [{ id: logId.current++, time, source, attempt, kind, result, detail }, ...prev].slice(0, 60));
  }, []);

  const updateConfig = useCallback((patch) => {
    const next = { ...cfgRef.current, ...patch };
    cfgRef.current = next;
    setCfg(next);
    if ('lockout' in patch) {         // switching lockout on/off clears any active lock
      engine.current.lockedUntil = 0;
      engine.current.fails = 0;
      setLockedUntil(0);
    }
    if ('rateLimit' in patch) engine.current.stamps = [];
  }, []);

  // One login "server" used by both the manual form and the simulation.
  const processAttempt = useCallback((source, attempt, user, password) => {
    const c = cfgRef.current;
    const e = engine.current;
    const t = Date.now();

    if (c.lockout && e.lockedUntil > t) {
      setStats((s) => ({ ...s, blocked: s.blocked + 1, lockBlocked: s.lockBlocked + 1 }));
      addLog(source, attempt, 'blocked', 'Blocked · lockout', 'Account is locked, so this attempt was not checked.');
      return { kind: 'blocked', reason: 'lockout', remaining: Math.ceil((e.lockedUntil - t) / 1000) };
    }

    if (c.rateLimit) {
      e.stamps = e.stamps.filter((x) => t - x < c.rateWindow * 1000);
      if (e.stamps.length >= c.rateMax) {
        setStats((s) => ({ ...s, blocked: s.blocked + 1, rateBlocked: s.rateBlocked + 1 }));
        addLog(source, attempt, 'blocked', 'Blocked · rate limit', `More than ${c.rateMax} attempts within ${c.rateWindow}s.`);
        return { kind: 'blocked', reason: 'rate' };
      }
      e.stamps.push(t);
    }

    if (user === DEMO_USERNAME && password === DEMO_PASSWORD) {
      e.fails = 0;
      setStats((s) => ({ ...s, attempts: s.attempts + 1, success: s.success + 1 }));
      addLog(source, attempt, 'match', source === 'Simulation' ? 'Match found' : 'Login success',
        source === 'Simulation' ? 'The fictional demo password was in the test set.' : 'Correct demo credentials.');
      return { kind: 'match' };
    }

    e.fails += 1;
    setStats((s) => ({ ...s, attempts: s.attempts + 1, failed: s.failed + 1 }));
    addLog(source, attempt, 'rejected', 'Rejected', 'Credentials did not match.');

    if (c.lockout && e.fails >= c.lockThreshold) {
      e.lockedUntil = t + c.lockSeconds * 1000;
      setLockedUntil(e.lockedUntil);
      addLog('System', '—', 'locked', 'Account locked',
        `${c.lockThreshold} failed attempts in a row. Locked for ${c.lockSeconds}s.`);
      return { kind: 'rejected', locked: true };
    }
    return { kind: 'rejected', failsLeft: c.lockout ? c.lockThreshold - e.fails : null };
  }, [addLog]);

  // Countdown ticker + automatic unlock.
  useEffect(() => {
    if (!lockedUntil) return undefined;
    setNow(Date.now());
    const ticker = setInterval(() => setNow(Date.now()), 250);
    const unlock = setTimeout(() => {
      if (engine.current.lockedUntil === lockedUntil) {
        engine.current.lockedUntil = 0;
        engine.current.fails = 0;
        setLockedUntil(0);
        addLog('System', '—', 'info', 'Unlocked', 'Lockout period ended; the account is available again.');
      }
    }, Math.max(0, lockedUntil - Date.now()));
    return () => { clearInterval(ticker); clearTimeout(unlock); };
  }, [lockedUntil, addLog]);

  useEffect(() => {
    document.documentElement.classList.toggle('presentation', presentation);
  }, [presentation]);

  const locked = cfg.lockout && lockedUntil > now;
  const remaining = locked ? Math.max(0, Math.ceil((lockedUntil - now) / 1000)) : 0;

  const submitLogin = (username, password) => {
    const attempt = password ? '•'.repeat(Math.min(password.length, 16)) : '(empty)';
    const out = processAttempt('Manual login', attempt, username.trim(), password);
    const c = cfgRef.current;
    if (out.kind === 'match') return { type: 'success', text: 'Demo login successful. This is the fictional test account.' };
    if (out.kind === 'blocked' && out.reason === 'lockout') return { type: 'warning', text: `Account locked. Try again in ${out.remaining}s.` };
    if (out.kind === 'blocked') return { type: 'warning', text: `Too many attempts. The limit is ${c.rateMax} per ${c.rateWindow}s — wait a moment and retry.` };
    if (out.locked) return { type: 'error', text: `Invalid username or password. The account is now locked for ${c.lockSeconds}s.` };
    const left = out.failsLeft != null ? ` ${out.failsLeft} attempt${out.failsLeft === 1 ? '' : 's'} left before lockout.` : '';
    return { type: 'error', text: `Invalid username or password.${left}` };
  };

  const runSimulation = async () => {
    if (simRunning) return;
    const id = ++runId.current;
    setSimRunning(true);
    setSimSteps(TEST_GUESSES.map((guess) => ({ guess, status: 'pending' })));
    const mark = (i, status) => setSimSteps((steps) => steps && steps.map((s, k) => (k === i ? { ...s, status } : s)));

    for (let i = 0; i < TEST_GUESSES.length; i += 1) {
      mark(i, 'testing');
      await sleep(700);
      if (runId.current !== id) return;
      const out = processAttempt('Simulation', `Test ${i + 1}: ${TEST_GUESSES[i]}`, DEMO_USERNAME, TEST_GUESSES[i]);
      mark(i, out.kind === 'blocked' ? `blocked-${out.reason}` : out.kind);
      if (out.kind === 'match') {
        setSimSteps((steps) => steps && steps.map((s, k) => (k > i ? { ...s, status: 'skipped' } : s)));
        break;
      }
    }
    setSimRunning(false);
  };

  const resetLab = () => {
    runId.current += 1;                 // cancels any running simulation
    engine.current = { fails: 0, stamps: [], lockedUntil: 0 };
    setLockedUntil(0);
    setStats(EMPTY_STATS);
    setLogs(INITIAL_LOG);
    setSimSteps(null);
    setSimRunning(false);
  };

  const lab = {
    cfg, updateConfig, stats, logs, locked, remaining, simSteps, simRunning,
    submitLogin, runSimulation, resetLab, go: setActive,
    defaults: DEFAULT_CONFIG,
  };

  const select = (name) => { setActive(name); setMobileOpen(false); };

  return (
    <div className="app-shell">
      <Sidebar active={active} open={mobileOpen} onSelect={select} onClose={() => setMobileOpen(false)} />
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <main className="main-area">
        <header className="topbar">
          <div className="top-left">
            <button className="icon-button mobile-menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
            <div><div className="eyebrow">SECURITY TESTING / TRAINING ENVIRONMENT</div><h1>{active}</h1></div>
          </div>
          <div className="top-actions">
            {locked && <span className="lock-pill"><Timer size={14} /> LOCKED {remaining}s</span>}
            <span className="local-pill"><span className="status-dot" /> LOCAL ONLY</span>
            <button className={`presentation-btn ${presentation ? 'active' : ''}`} onClick={() => setPresentation(!presentation)}>
              <Monitor size={16} /><span>{presentation ? 'Exit presentation' : 'Presentation view'}</span>
            </button>
          </div>
        </header>

        <div className="content">
          <div className="notice">
            <Info size={18} />
            <span><b>Educational simulation:</b> fictional credentials and a fixed test set are used. This application does not connect to or attack real accounts.</span>
          </div>

          {active === 'Overview' && <Overview lab={lab} />}
          {active === 'Login Demo' && <LoginDemo lab={lab} />}
          {active === 'Attack Lab' && <AttackLab lab={lab} />}
          {active === 'Protection' && <Protection lab={lab} />}
          {active === 'Password Tools' && <PasswordTools />}
          {active === 'Activity Log' && <ActivityLog lab={lab} />}
          {active === 'How It Works' && <HowItWorks />}

          <footer className="footer">
            <span>Password Attack &amp; Defense Lab</span>
            <span>Educational use only · Local browser simulation</span>
          </footer>
        </div>
      </main>
    </div>
  );
}
