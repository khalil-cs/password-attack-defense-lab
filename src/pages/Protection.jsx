import React from 'react';
import { Gauge, UserX, RotateCcw, Info, FlaskConical } from 'lucide-react';
import { PageIntro, Toggle, Slider, LockBanner } from '../components/ui.jsx';

const REAL_WORLD = [
  ['Salted password hashing', 'Stored passwords cannot be read even if the database leaks (see Password Tools).'],
  ['Multi-factor authentication', 'A guessed password alone is not enough to sign in.'],
  ['Monitoring & alerts', 'Administrators notice unusual login patterns early.'],
  ['Server-side enforcement', 'Limits must run on the server; browser code can be edited by the user.'],
];

export default function Protection({ lab }) {
  const { cfg, updateConfig, defaults } = lab;
  return (
    <section className="page">
      <PageIntro
        eyebrow="DEFENSIVE CONTROLS"
        title="Protection settings"
        text="Two separate defences with adjustable limits. Change them and re-run the Attack Lab to compare."
        action={
          <div className="preset-row">
            <button className="secondary-btn" onClick={() => updateConfig({ rateLimit: false, lockout: false })}>All off</button>
            <button className="secondary-btn" onClick={() => updateConfig({ ...defaults })}>Defaults</button>
          </div>
        }
      />

      {lab.locked && <LockBanner remaining={lab.remaining} />}

      <div className="two-col">
        <div className="panel">
          <div className="setting-row">
            <div className="setting-icon sage-bg"><Gauge size={20} /></div>
            <div className="setting-copy">
              <b>Rate limiting</b>
              <p>Only a few attempts are accepted in a time window. Extra attempts are rejected without being checked, whether right or wrong.</p>
            </div>
            <Toggle on={cfg.rateLimit} label="Rate limiting" onChange={(v) => updateConfig({ rateLimit: v })} />
          </div>
          <Slider id="rmax" label="Max attempts" value={cfg.rateMax} min={1} max={10} unit="attempts" disabled={!cfg.rateLimit} onChange={(v) => updateConfig({ rateMax: v })} />
          <Slider id="rwin" label="Time window" value={cfg.rateWindow} min={5} max={60} unit="sec" disabled={!cfg.rateLimit} onChange={(v) => updateConfig({ rateWindow: v })} />
        </div>

        <div className="panel">
          <div className="setting-row">
            <div className="setting-icon sage-bg"><UserX size={20} /></div>
            <div className="setting-copy">
              <b>Temporary account lockout</b>
              <p>After several wrong passwords in a row the account is locked for a cool-down period, then unlocks by itself.</p>
            </div>
            <Toggle on={cfg.lockout} label="Account lockout" onChange={(v) => updateConfig({ lockout: v })} />
          </div>
          <Slider id="lth" label="Failures before lock" value={cfg.lockThreshold} min={1} max={10} unit="fails" disabled={!cfg.lockout} onChange={(v) => updateConfig({ lockThreshold: v })} />
          <Slider id="lsec" label="Lock duration" value={cfg.lockSeconds} min={5} max={120} unit="sec" disabled={!cfg.lockout} onChange={(v) => updateConfig({ lockSeconds: v })} />
        </div>
      </div>

      <div className="callout">
        <Info size={18} />
        <span><b>Why both?</b> Rate limiting slows down <em>everyone</em> making too many requests. Lockout reacts to repeated <em>failures</em> on one account. Lockout alone can also be abused to lock real users out (a denial-of-service), which is why real systems combine controls.</span>
      </div>

      <div className="panel">
        <div className="panel-heading"><div><h3>What a real system adds</h3><p>Not simulated here, but expected in production.</p></div></div>
        <div className="why-grid">
          {REAL_WORLD.map(([title, text]) => <div key={title}><b>{title}</b><p>{text}</p></div>)}
        </div>
        <div className="panel-actions">
          <button className="primary-btn" onClick={() => lab.go('Attack Lab')}><FlaskConical size={16} /> Test in Attack Lab</button>
          <button className="secondary-btn" onClick={lab.resetLab}><RotateCcw size={16} /> Reset experiment data</button>
        </div>
      </div>
    </section>
  );
}
