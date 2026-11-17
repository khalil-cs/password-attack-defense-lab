import React, { useEffect, useMemo, useState } from 'react';
import { Check, X, Eye, EyeOff, RefreshCw, Info, AlertTriangle } from 'lucide-react';
import {
  analyzePassword, cryptoAvailable, randomSalt, sha256, pbkdf2, DEMO_PASSWORD,
} from '../lib/security.js';
import { PageIntro } from '../components/ui.jsx';

const ITERATIONS = 100000;

function StrengthChecker() {
  const [value, setValue] = useState('');
  const [show, setShow] = useState(false);
  const result = useMemo(() => analyzePassword(value), [value]);

  return (
    <div className="panel">
      <div className="panel-heading">
        <div><h3>1. Password strength checker</h3><p>Runs only in your browser. Nothing is stored or sent. Please test made-up passwords, not real ones.</p></div>
        <span className="tag">LOCAL</span>
      </div>
      <label htmlFor="strength" className="field-label">Try a password</label>
      <div className="password-field standalone">
        <input id="strength" type={show ? 'text' : 'password'} value={value} onChange={(e) => setValue(e.target.value)} autoComplete="off" placeholder="e.g. a made-up test password" />
        <button type="button" className="icon-button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      <div className="try-row">
        <span className="muted small">Quick examples:</span>
        {['123456', 'Maple!2026', 'correct horse battery staple', 'k9#Vq2!rT7@xLm4'].map((ex) => (
          <button key={ex} className="chip" onClick={() => setValue(ex)}>{ex.length > 16 ? `${ex.slice(0, 13)}…` : ex}</button>
        ))}
      </div>

      {!result && <div className="empty-state"><b>Type something to analyse it</b></div>}
      {result && (
        <div className="strength">
          <div className="meter-head">
            <b className={`tone-${result.tone}`}>{result.label}</b>
            <span className="muted small">≈ {result.bits} bits of entropy</span>
          </div>
          <div className="meter" role="progressbar" aria-valuenow={result.percent} aria-valuemin={0} aria-valuemax={100} aria-label="Password strength">
            <span className={`meter-fill tone-bg-${result.tone}`} style={{ width: `${Math.max(4, result.percent)}%` }} />
          </div>
          <ul className="check-list">
            {result.checks.map((c) => (
              <li key={c.label} className={c.ok ? 'ok' : 'no'}>
                {c.ok ? <Check size={15} /> : <X size={15} />}{c.label}
              </li>
            ))}
          </ul>
          <div className="crack-grid">
            <div><span>Online guessing (≈1 guess/sec, throttled login page)</span><b>{result.online}</b></div>
            <div><span>Offline guessing (≈10 billion/sec against a stolen fast hash)</span><b>{result.offline}</b></div>
          </div>
          <p className="small muted">Estimates are for teaching. They average half the search space and ignore smart dictionaries, so real results can be much worse for predictable passwords.</p>
        </div>
      )}
    </div>
  );
}

function HashDemo() {
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [saltA, setSaltA] = useState('');
  const [saltB, setSaltB] = useState('');
  const [out, setOut] = useState(null);
  const supported = cryptoAvailable();

  useEffect(() => {
    if (supported) { setSaltA(randomSalt()); setSaltB(randomSalt()); }
  }, [supported]);

  useEffect(() => {
    if (!supported || !saltA || !saltB) return undefined;
    let cancelled = false;
    (async () => {
      const plain = await sha256(password);
      const sa = await sha256(saltA + password);
      const sb = await sha256(saltB + password);
      const t0 = performance.now();
      const pa = await pbkdf2(password, saltA, ITERATIONS);
      const ms = Math.round(performance.now() - t0);
      const pb = await pbkdf2(password, saltB, ITERATIONS);
      if (!cancelled) setOut({ plain, sa, sb, pa, pb, ms });
    })();
    return () => { cancelled = true; };
  }, [password, saltA, saltB, supported]);

  const short = (h) => `${h.slice(0, 20)}…`;

  if (!supported) {
    return (
      <div className="panel">
        <h3>2. Hashing &amp; salting demo</h3>
        <div className="callout"><AlertTriangle size={18} /><span>The browser’s crypto API is only available on <b>localhost</b> or <b>https</b>. Open the app at <code>http://localhost:5173</code> to use this demo.</span></div>
      </div>
    );
  }

  return (
    <div className="panel">
      <div className="panel-heading">
        <div><h3>2. Hashing &amp; salting demo</h3><p>Two different users choose the same password. Compare what a database would store.</p></div>
        <button className="secondary-btn" onClick={() => { setSaltA(randomSalt()); setSaltB(randomSalt()); }}><RefreshCw size={15} /> New salts</button>
      </div>
      <label htmlFor="hashpw" className="field-label">Shared password (fictional)</label>
      <input id="hashpw" className="plain-input" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off" />

      {out && (
        <div className="table-wrap hash-table">
          <table>
            <thead><tr><th>Storage method</th><th>User A stores</th><th>User B stores</th><th>Verdict</th></tr></thead>
            <tbody>
              <tr>
                <td><b>Plain text</b></td>
                <td><code className="plain-code">{password}</code></td><td><code className="plain-code">{password}</code></td>
                <td><span className="result-badge failed">Readable if leaked</span></td>
              </tr>
              <tr>
                <td><b>SHA-256, no salt</b></td>
                <td><code className="plain-code" title={out.plain}>{short(out.plain)}</code></td><td><code className="plain-code" title={out.plain}>{short(out.plain)}</code></td>
                <td><span className="result-badge failed">Identical hashes: shared password is visible</span></td>
              </tr>
              <tr>
                <td><b>SHA-256 + random salt</b></td>
                <td><code className="plain-code" title={out.sa}>{short(out.sa)}</code><small>salt {saltA}</small></td>
                <td><code className="plain-code" title={out.sb}>{short(out.sb)}</code><small>salt {saltB}</small></td>
                <td><span className="result-badge success">Different, but still very fast to guess</span></td>
              </tr>
              <tr>
                <td><b>PBKDF2-SHA256, salt, {ITERATIONS.toLocaleString()} rounds</b></td>
                <td><code className="plain-code" title={out.pa}>{short(out.pa)}</code></td>
                <td><code className="plain-code" title={out.pb}>{short(out.pb)}</code></td>
                <td><span className="result-badge blocked">Different and deliberately slow (~{out.ms} ms here)</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      <div className="callout"><Info size={18} /><span><b>Takeaway:</b> a <em>salt</em> makes identical passwords produce different hashes, so one cracked hash does not reveal other users. A <em>slow</em> algorithm (PBKDF2, bcrypt, Argon2) makes every offline guess expensive. Production systems use bcrypt or Argon2 on the server.</span></div>
    </div>
  );
}

export default function PasswordTools() {
  return (
    <section className="page">
      <PageIntro
        eyebrow="DEFENSIVE KNOWLEDGE"
        title="Password tools"
        text="Why strong passwords matter, and how real systems store them safely."
      />
      <StrengthChecker />
      <HashDemo />
    </section>
  );
}
