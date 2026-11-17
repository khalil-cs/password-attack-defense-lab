import React from 'react';
import { Activity, Ban, ShieldCheck, CheckCircle2, FlaskConical, ChevronRight, RotateCcw, Timer } from 'lucide-react';
import { StatCard, PageIntro, LogTable } from '../components/ui.jsx';

const STEPS = [
  ['Login Demo', 'Sign in once with the sample credentials.'],
  ['Protection', 'Turn both protections off.'],
  ['Attack Lab', 'Run the simulation and watch the password get found.'],
  ['Protection', 'Reset, turn protections on, run again and compare.'],
];

export default function Overview({ lab }) {
  const { stats, cfg, locked, remaining, logs, go, resetLab } = lab;
  const total = stats.attempts + stats.blocked;
  const protectedNow = cfg.rateLimit || cfg.lockout;

  return (
    <section className="page">
      <PageIntro
        eyebrow="LAB CONTROL CENTER"
        title="Password Attack & Defense Lab"
        text="Explore how repeated password guesses work, and how basic protections reduce the risk."
        action={<button className="secondary-btn" onClick={resetLab}><RotateCcw size={16} /> Reset lab</button>}
      />

      <div className="stats-grid">
        <StatCard label="TOTAL ATTEMPTS" value={total} note="Checked + blocked" icon={Activity} />
        <StatCard label="REJECTED" value={stats.failed} note="Incorrect credentials" icon={Ban} tone="red" />
        <StatCard label="BLOCKED" value={stats.blocked} note={`${stats.rateBlocked} rate limit · ${stats.lockBlocked} lockout`} icon={ShieldCheck} tone="sage" />
        <StatCard label="MATCHES" value={stats.success} note="Demo password matched" icon={CheckCircle2} tone="amber" />
      </div>

      <div className="overview-grid">
        <div className="panel">
          <div className="panel-heading">
            <div><h3>Suggested demo flow</h3><p>Follow these four steps during your practical.</p></div>
            <span className="tag">READY</span>
          </div>
          <ol className="flow-list">
            {STEPS.map(([page, text], i) => (
              <li key={i}>
                <span className="flow-num">{i + 1}</span>
                <div><b>{page}</b><p>{text}</p></div>
                <button className="text-btn" onClick={() => go(page)}>Open <ChevronRight size={15} /></button>
              </li>
            ))}
          </ol>
          <div className="panel-actions">
            <button className="primary-btn" onClick={() => go('Attack Lab')}><FlaskConical size={16} /> Open Attack Lab</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <div><h3>Defense status</h3><p>Current lab configuration</p></div>
            <ShieldCheck size={20} className="sage-text" />
          </div>
          <div className="defense-status">
            <span className={`status-pill ${protectedNow ? 'safe' : 'warning'}`}>{protectedNow ? 'Protections active' : 'No protections'}</span>
            <span className={`muted small ${locked ? 'warn-text' : ''}`}>
              {locked ? <><Timer size={13} /> Locked · {remaining}s</> : 'Demo account available'}
            </span>
          </div>
          <div className="defense-line"><span>Rate limiting ({cfg.rateMax} per {cfg.rateWindow}s)</span><b>{cfg.rateLimit ? 'ON' : 'OFF'}</b></div>
          <div className="defense-line"><span>Account lockout ({cfg.lockThreshold} fails → {cfg.lockSeconds}s)</span><b>{cfg.lockout ? 'ON' : 'OFF'}</b></div>
          <button className="text-btn" onClick={() => go('Protection')}>Configure protections <ChevronRight size={15} /></button>
        </div>
      </div>

      <div className="panel">
        <div className="panel-heading">
          <div><h3>Recent activity</h3><p>Latest events recorded in this browser session.</p></div>
          <button className="text-btn" onClick={() => go('Activity Log')}>View all <ChevronRight size={15} /></button>
        </div>
        <LogTable logs={logs.slice(0, 5)} />
      </div>
    </section>
  );
}
