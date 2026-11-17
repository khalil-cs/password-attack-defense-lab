// Helper functions for the Password Tools page.
// Everything here runs locally in the browser. Nothing is stored or sent anywhere.

export const DEMO_USERNAME = 'student.demo';
export const DEMO_PASSWORD = 'Maple!2026';

// Fixed, fictional test values. The simulator never accepts an external target
// or a user-supplied password list.
export const TEST_GUESSES = ['welcome', '123456', 'password', 'letmein', 'Maple!2026'];

// A tiny sample of very common passwords, used only by the strength checker.
const COMMON = [
  'password', '123456', '12345678', 'qwerty', 'abc123', 'letmein', 'welcome',
  'admin', 'iloveyou', 'monkey', 'dragon', 'football', '111111', '123123',
  'password1', 'welcome1', 'login', 'princess', 'sunshine', 'master',
];

const SEQUENCES = ['abc', 'bcd', 'cde', 'def', '123', '234', '345', '456', '567', '678', '789', 'qwe', 'wer', 'asd'];

function charsetSize(p) {
  let size = 0;
  if (/[a-z]/.test(p)) size += 26;
  if (/[A-Z]/.test(p)) size += 26;
  if (/\d/.test(p)) size += 10;
  if (/[^A-Za-z0-9]/.test(p)) size += 33;
  return size || 1;
}

function hasPattern(p) {
  const lower = p.toLowerCase();
  const wordPlusNumber = /^[a-z]+[^a-z0-9]?\d{2,4}[^a-z0-9]?$/i.test(p);
  const sequence = SEQUENCES.some((s) => lower.includes(s));
  const repeats = /(.)\1{2,}/.test(p);
  return wordPlusNumber || sequence || repeats;
}

export function formatDuration(seconds) {
  if (seconds < 1) return 'instantly';
  const units = [
    ['year', 31557600], ['day', 86400], ['hour', 3600], ['minute', 60], ['second', 1],
  ];
  if (seconds >= 31557600 * 1e9) return 'billions of years';
  if (seconds >= 31557600 * 1e6) return 'millions of years';
  if (seconds >= 31557600 * 1000) return 'thousands of years';
  for (const [name, size] of units) {
    if (seconds >= size) {
      const n = Math.round(seconds / size);
      return `${n.toLocaleString()} ${name}${n === 1 ? '' : 's'}`;
    }
  }
  return 'instantly';
}

// Educational estimate only: entropy = length x log2(character-set size), then reduced
// for predictable structure. Real strength depends on how attackers actually guess.
export function analyzePassword(p) {
  if (!p) return null;
  const common = COMMON.includes(p.toLowerCase());
  const pattern = hasPattern(p);
  const repeats = /(.)\1{2,}/.test(p);

  let bits = p.length * Math.log2(charsetSize(p));
  if (pattern) bits *= 0.6;
  if (repeats) bits *= 0.8;
  if (common) bits = Math.min(bits, 8);
  bits = Math.max(1, bits);

  const checks = [
    { label: 'At least 12 characters', ok: p.length >= 12 },
    { label: 'Contains lowercase letters', ok: /[a-z]/.test(p) },
    { label: 'Contains uppercase letters', ok: /[A-Z]/.test(p) },
    { label: 'Contains numbers', ok: /\d/.test(p) },
    { label: 'Contains symbols', ok: /[^A-Za-z0-9]/.test(p) },
    { label: 'Not a commonly used password', ok: !common },
    { label: 'No predictable pattern (word + number, sequence, repeats)', ok: !pattern },
  ];

  let label = 'Very weak', tone = 'red';
  if (bits >= 80) { label = 'Very strong'; tone = 'green'; }
  else if (bits >= 60) { label = 'Strong'; tone = 'green'; }
  else if (bits >= 40) { label = 'Fair'; tone = 'amber'; }
  else if (bits >= 28) { label = 'Weak'; tone = 'red'; }

  const averageGuesses = Math.pow(2, bits - 1);
  return {
    bits: Math.round(bits),
    percent: Math.min(100, Math.round((bits / 80) * 100)),
    label,
    tone,
    checks,
    online: formatDuration(averageGuesses / 1),        // about 1 guess per second (throttled login page)
    offline: formatDuration(averageGuesses / 1e10),    // about 10 billion guesses per second (stolen fast hashes)
  };
}

// ---------- Hashing demo (Web Crypto API) ----------
const encoder = new TextEncoder();
const toHex = (buffer) => [...new Uint8Array(buffer)].map((b) => b.toString(16).padStart(2, '0')).join('');

export const cryptoAvailable = () => Boolean(globalThis.crypto && globalThis.crypto.subtle);

export function randomSalt() {
  return toHex(globalThis.crypto.getRandomValues(new Uint8Array(8)));
}

export async function sha256(text) {
  return toHex(await crypto.subtle.digest('SHA-256', encoder.encode(text)));
}

export async function pbkdf2(text, salt, iterations) {
  const key = await crypto.subtle.importKey('raw', encoder.encode(text), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt: encoder.encode(salt), iterations, hash: 'SHA-256' }, key, 256,
  );
  return toHex(bits);
}
