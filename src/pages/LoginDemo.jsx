import React, { useState } from 'react';
import { LockKeyhole, Eye, EyeOff, Info } from 'lucide-react';
import { DEMO_USERNAME, DEMO_PASSWORD } from '../lib/security.js';
import { LockBanner } from '../components/ui.jsx';

export default function LoginDemo({ lab }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [message, setMessage] = useState(null);
  const [showHint, setShowHint] = useState(false);

  const onSubmit = (e) => {
    e.preventDefault();
    setMessage(lab.submitLogin(username, password));
  };

  return (
    <section className="page narrow-page">
      <div className="section-intro">
        <p className="eyebrow">CONTROLLED TEST ACCOUNT</p>
        <h2>Fictional login page</h2>
        <p className="muted lead">
          Sign in with the sample credentials, or type wrong passwords to see the protections react
          ({lab.cfg.lockout ? `${lab.cfg.lockThreshold} failures in a row lock the account` : 'lockout is currently off'}).
          Do not enter personal passwords.
        </p>
      </div>

      <div className="panel login-panel">
        <div className="login-brand">
          <div className="brand-mark"><LockKeyhole size={21} /></div>
          <div><b>Demo Portal</b><small>Local authentication example</small></div>
        </div>

        {lab.locked && <LockBanner remaining={lab.remaining} />}

        <form onSubmit={onSubmit}>
          <label htmlFor="user">Username</label>
          <input id="user" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="off" placeholder="Enter username" />
          <label htmlFor="pass">Password</label>
          <div className="password-field">
            <input
              id="pass"
              type={show ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              placeholder="Enter demo password"
            />
            <button type="button" className="icon-button" onClick={() => setShow(!show)} aria-label={show ? 'Hide password' : 'Show password'}>
              {show ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </div>
          <button className="primary-btn full-btn" type="submit"><LockKeyhole size={16} /> Sign in to demo</button>
        </form>

        <div aria-live="polite">
          {message && <div className={`form-message ${message.type}`}><Info size={16} />{message.text}</div>}
        </div>

        <button type="button" className="text-btn hint-btn" onClick={() => setShowHint(!showHint)} aria-expanded={showHint}>
          {showHint ? 'Hide demo hint' : 'Show demo hint'}
        </button>
        {showHint && (
          <div className="credentials-box">
            <b>Sample credentials</b>
            <div><span>Username</span><code>{DEMO_USERNAME}</code></div>
            <div><span>Password</span><code>{DEMO_PASSWORD}</code></div>
            <small>These credentials are fictional and are included only for this local exercise. Typed passwords are never stored or logged; the log only shows dots.</small>
          </div>
        )}
      </div>
    </section>
  );
}