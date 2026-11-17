import React from 'react';
import { Play, RotateCcw, Terminal, Activity, CheckCircle2, XCircle, ShieldAlert, Loader2, Circle, MinusCircle } from 'lucide-react';
import { DEMO_USERNAME } from '../lib/security.js';
import { PageIntro, LockBanner } from '../components/ui.jsx';

const STATUS = {
  pending: { icon: Circle, label: 'Waiting', cls: 'pending' },
  testing: { icon: Loader2, label: 'Testing…', cls: 'testing' },
  rejected: { icon: XCircle, label: 'Rejected', cls: 'rejected' },
  match: { icon: CheckCircle2, label: 'Match found', cls: 'match' },
  'blocked-rate': { icon: ShieldAlert, label: 'Blocked · rate limit', cls: 'blocked' },
  'blocked-lockout': { icon: ShieldAlert, label: 'Blocked · lockout', cls: 'blocked' },
  skipped: { icon: MinusCircle, label: 'Not needed', cls: 'pending' },
};

export default function AttackLab({ lab }) {
  const { stats, simSteps, simRunning, locked, remaining, cfg } = lab;
  const anyProtection = cfg.rateLimit || cfg.lockout;
  const done = simSteps && !simRunning;
  const found = simSteps && simSteps.some((s) => s.status === 'match');

  return (
    <section className="page">
      <PageIntro
        eyebrow="CONTROLLED EXPERIMENT"
        title="Guessing simulation"
        text="Watch a small, fixed list of test values being tried one by one against the fictional account."
      />

      <div className="lab-grid">
        <div className="panel">
          <div className="panel-heading">
            <div><h3>Simulation controls</h3><p>One run tries the built-in list, one value at a time.</p></div>
            <span className="tag">LOCAL</span>
          </div>
          <div className="experiment-box">
            <div className="experiment-icon"><Terminal size={22} /></div>
            <div>
              <b>Target: <code className="plain-code">{DEMO_USERNAME}</code> (fictional)</b>
              <p>Five sample values are tried in order. The run stops when the demo password matches. Protections can block attempts first.</p>
            </div>
          </div>
          <div className="config-row">
            <span>Rate limiting</span>
            <span className={`status-pill ${cfg.rateLimit ? 'safe' : 'warning'}`}>{cfg.rateLimit ? `ON · ${cfg.rateMax} per ${cfg.rateWindow}s` : 'OFF'}</span>
          </div>
          <div className="config-row">
            <span>Account lockout</span>
            <span className={`status-pill ${cfg.lockout ? 'safe' : 'warning'}`}>{cfg.lockout ? `ON · ${cfg.lockThreshold} fails → ${cfg.lockSeconds}s` : 'OFF'}</span>
          </div>
          {locked && <LockBanner remaining={remaining} />}
          <button className="primary-btn full-btn run-btn" onClick={lab.runSimulation} disabled={simRunning}>
            <Play size={16} />{simRunning ? 'Running…' : 'Run simulation'}
          </button>
          <button className="secondary-btn full-btn" onClick={lab.resetLab}><RotateCcw size={16} /> Reset all results</button>
          <p className="small muted hint">
            {anyProtection
              ? 'Tip: run once with protections on, then switch them off on the Protection page and compare.'
              : 'Protections are off: nothing stops the guessing. Now turn them on and run again.'}
          </p>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div><h3>Live guess sequence</h3><p>Updates as each value is tried.</p></div>
            <Activity size={19} className="muted" />
          </div>
          {!simSteps && <div className="empty-state"><Terminal size={26} /><b>No run yet</b><span>Press “Run simulation” to start.</span></div>}
          {simSteps && (
            <ol className="guess-list" aria-live="polite">
              {simSteps.map((step, i) => {
                const meta = STATUS[step.status];
                const Icon = meta.icon;
                return (
                  <li key={i} className={`guess ${meta.cls}`}>
                    <span className="guess-num">{i + 1}</span>
                    <code>{step.guess}</code>
                    <span className="guess-status"><Icon size={16} className={step.status === 'testing' ? 'spin' : ''} />{meta.label}</span>
                  </li>
                );
              })}
            </ol>
          )}
          {done && (
            <div className={`outcome ${found ? 'bad' : 'good'}`}>
              {found
                ? 'Outcome: the password was found. Nothing slowed the guessing down.'
                : 'Outcome: the password was NOT found. The protections stopped the guessing early.'}
            </div>
          )}
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading"><div><h3>Results so far</h3><p>Totals across every run since the last reset.</p></div></div>
        <div className="result-grid">
          <div><span>Checked</span><b>{stats.attempts}</b></div>
          <div><span>Rejected</span><b>{stats.failed}</b></div>
          <div><span>Blocked by rate limit</span><b className="sage-text">{stats.rateBlocked}</b></div>
          <div><span>Blocked by lockout</span><b className="sage-text">{stats.lockBlocked}</b></div>
          <div><span>Matches</span><b className="amber-text">{stats.success}</b></div>
        </div>
        <p className="small muted result-explain">“Checked” counts guesses that actually reached the password check. Blocked guesses never get checked, which is exactly how the defences help.</p>
      </div>
    </section>
  );
}
