import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { PageIntro } from '../components/ui.jsx';

const SECTIONS = [
  ['1. What is a password guessing attack?', 'An attempt to gain access by trying many possible passwords for an account. Weak or commonly used passwords are found much sooner than long, random ones.'],
  ['2. Online vs offline guessing', 'Online guessing targets a live login page, so the website can slow or block it (this lab). Offline guessing happens after a database leak, when the attacker tries guesses against stolen hashes on their own computer with no limits, which is why slow salted hashing matters.'],
  ['3. What does this project simulate?', 'One fictional account and a small fixed list of sample values, checked one at a time by a local “login server” inside the browser. It never contacts a real website, account or network.'],
  ['4. Which defences are demonstrated?', 'Rate limiting accepts only a few attempts per time window. Account lockout locks the account for a cool-down after several failures in a row and then unlocks automatically. Both are configurable on the Protection page.'],
  ['5. Which defences are explained but not simulated?', 'Salted slow hashing (shown on the Password Tools page), multi-factor authentication, monitoring and alerts, secure password reset and secure session management.'],
  ['6. What are the limitations?', 'This is a teaching model. The checks run in browser code that a user could inspect or edit, nothing is stored, and no real passwords are hashed for login. A real application must enforce security on the server.'],
];

const VIVA = [
  ['Why is this called a simulation rather than a real attack?', 'It uses fixed fictional test data locally and never targets a real account or network service.'],
  ['What is the difference between rate limiting and account lockout?', 'Rate limiting caps how many attempts are accepted in a time window, whatever the result. Lockout triggers after repeated failures on one account and lasts for a cool-down period.'],
  ['What is a downside of account lockout?', 'An attacker can deliberately lock real users out (a denial-of-service). That is why lockouts are temporary and combined with other controls such as rate limiting and MFA.'],
  ['Can client-side protection secure a real website?', 'No. Real protections must be enforced and verified on the server, where a user cannot simply change the browser code.'],
  ['Why add a salt to a password hash?', 'A unique random salt makes identical passwords produce different hashes, so attackers cannot reuse precomputed tables or spot users who share a password.'],
  ['Why use PBKDF2, bcrypt or Argon2 instead of plain SHA-256?', 'They are deliberately slow and tunable, so each offline guess costs far more time. Plain SHA-256 is designed to be fast.'],
  ['Why does a longer password beat a complex short one?', 'Each extra character multiplies the number of possibilities. Length adds more entropy than swapping letters for symbols in a predictable way.'],
  ['What other protections should a real system use?', 'Multi-factor authentication, breached-password checks, monitoring and alerts, secure password reset and safe session management.'],
];

const SCRIPT = [
  'Login Demo: sign in with the sample credentials, then type three wrong passwords and show the lockout countdown.',
  'Protection: turn both protections OFF, then reset the lab.',
  'Attack Lab: run the simulation. All five guesses are tried and the password is found.',
  'Protection: turn both protections ON, reset, and run the same simulation again. Later guesses are blocked and the password is not found.',
  'Activity Log: compare both runs and explain rate limiting versus lockout.',
  'Password Tools: show a weak vs strong password, and the plain / hashed / salted storage comparison.',
];

export default function HowItWorks() {
  return (
    <section className="page">
      <PageIntro eyebrow="PRESENTATION NOTES" title="How the lab works" text="Concise explanations and viva questions for your practical demonstration." />

      <div className="panel explainer">
        {SECTIONS.map(([h, p]) => <React.Fragment key={h}><h3>{h}</h3><p>{p}</p></React.Fragment>)}
        <div className="callout">
          <AlertTriangle size={18} />
          <span><b>Key point for viva:</b> client-side JavaScript can demonstrate the concept, but it cannot securely enforce authentication or rate limiting in a real application because users can inspect and modify browser code.</span>
        </div>
      </div>

      <div className="panel">
        <h3>Suggested 5-minute demo script</h3>
        <ol className="steps-list">{SCRIPT.map((s) => <li key={s}>{s}</li>)}</ol>
      </div>

      <div className="panel">
        <h3>Suggested viva questions</h3>
        <div className="viva-list">
          {VIVA.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
        </div>
      </div>
    </section>
  );
}
