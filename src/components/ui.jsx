import React from 'react';
import { ClipboardList, Clock3, Timer } from 'lucide-react';

export function StatCard({ label, value, note, icon: Icon, tone = 'neutral' }) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <span>{label}</span>
        <span className={`stat-icon ${tone}`}><Icon size={18} /></span>
      </div>
      <strong>{value}</strong>
      <small>{note}</small>
    </div>
  );
}

export function PageIntro({ eyebrow, title, text, action }) {
  return (
    <div className="welcome-row">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
        {text && <p className="muted lead">{text}</p>}
      </div>
      {action}
    </div>
  );
}

export function Toggle({ on, onChange, label }) {
  return (
    <button
      className={`toggle ${on ? 'on' : ''}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    >
      <span />
    </button>
  );
}

export function Slider({ id, label, value, min, max, unit, onChange, disabled }) {
  return (
    <div className={`slider-row ${disabled ? 'disabled' : ''}`}>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <output htmlFor={id}>{value} {unit}</output>
    </div>
  );
}

export function LockBanner({ remaining }) {
  return (
    <div className="lock-banner" role="status" aria-live="polite">
      <Timer size={18} />
      <span><b>Demo account locked.</b> It unlocks automatically in <b>{remaining}s</b>.</span>
    </div>
  );
}

const BADGE = {
  rejected: 'failed',
  blocked: 'blocked',
  match: 'success',
  locked: 'locked',
  info: 'neutral',
};

export function LogTable({ logs }) {
  if (!logs.length) {
    return (
      <div className="empty-state">
        <ClipboardList size={26} />
        <b>No activity yet</b>
        <span>Run a simulation or try the demo login to create events.</span>
      </div>
    );
  }
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr><th>Time</th><th>Source</th><th>Attempt</th><th>Result</th><th>Detail</th></tr>
        </thead>
        <tbody>
          {logs.map((log) => (
            <tr key={log.id}>
              <td className="time-cell"><Clock3 size={14} />{log.time}</td>
              <td>{log.source}</td>
              <td><code className="plain-code">{log.attempt}</code></td>
              <td><span className={`result-badge ${BADGE[log.kind] || 'neutral'}`}>{log.result}</span></td>
              <td className="detail-cell">{log.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
