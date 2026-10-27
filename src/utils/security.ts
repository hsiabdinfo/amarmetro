// Security and authentication utility for Amar Metro Admin Panel
// Features: Cryptographic SHA-256 password hashing (with zero-dependency fallback),
// persistent multi-tier storage (localStorage, sessionStorage, cookies),
// static Git repository auth file synchronization (data/auth.json),
// brute-force lockout protection, and session management.

import defaultAuthConfig from '../../data/auth.json';

const SALT = 'amarmetro_security_salt_2026_v1';
const PWD_HASH_KEY = 'amarmetro_admin_pwd_hash';
const SESSION_KEY = 'amarmetro_admin_session';
const FAILURES_KEY = 'amarmetro_admin_failures';
const LOCKOUT_KEY = 'amarmetro_admin_lockout';
const SECRET_ACCESS_KEY = 'amarmetro_secret_access_slug';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout after 5 failed attempts
const SESSION_MS = 4 * 60 * 60 * 1000; // 4 hours session validity

// In-memory cache for active password hash
let inMemoryPasswordHash: string | null = null;

// Multi-tier storage helpers (handles private browsing, cookie fallbacks, cross-subdomain)
function setStorageFallback(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {}

  try {
    sessionStorage.setItem(key, value);
  } catch {}

  try {
    if (typeof document !== 'undefined') {
      const d = new Date();
      d.setTime(d.getTime() + 365 * 24 * 60 * 60 * 1000);
      document.cookie = `${key}=${encodeURIComponent(value)};expires=${d.toUTCString()};path=/;SameSite=Lax`;
    }
  } catch {}
}

function getStorageFallback(key: string): string | null {
  try {
    const val = localStorage.getItem(key);
    if (val && val.trim().length > 0) return val.trim();
  } catch {}

  try {
    const val = sessionStorage.getItem(key);
    if (val && val.trim().length > 0) return val.trim();
  } catch {}

  try {
    if (typeof document !== 'undefined' && document.cookie) {
      const match = document.cookie.match(new RegExp('(^|;\\s*)' + key + '=([^;]*)'));
      if (match && match[2]) {
        const decoded = decodeURIComponent(match[2]).trim();
        if (decoded.length > 0) return decoded;
      }
    }
  } catch {}

  return null;
}

// Pure JavaScript SHA-256 implementation fallback (for non-HTTPS / legacy mobile browsers)
function pureJsSha256(str: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }
  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let i = 0;
  let result = '';
  const words: number[] = [];
  let ascii = unescape(encodeURIComponent(str));
  const asciiBitLength = ascii.length * 8;
  const hash: number[] = [];
  const k: number[] = [];
  let primeCounter = 0;

  const isComposite: Record<number, number> = {};
  for (let candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = candidate;
      }
      hash[primeCounter] = (mathPow(candidate, 0.5) * maxWord) | 0;
      k[primeCounter++] = (mathPow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  ascii += '\x80';
  while ((ascii.length % 64) - 56) ascii += '\x00';
  for (i = 0; i < ascii.length; i++) {
    const j = ascii.charCodeAt(i);
    words[i >> 2] |= j << (((3 - i) % 4) * 8);
  }
  words[words.length] = (asciiBitLength / maxWord) | 0;
  words[words.length] = asciiBitLength | 0;

  for (let j = 0; j < words.length; ) {
    const w = words.slice(j, (j += 16));
    const oldHash = hash.slice(0);

    for (i = 0; i < 64; i++) {
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const s0 = rightRotate(w15, 7) ^ rightRotate(w15, 18) ^ (w15 >>> 3);
      const s1 = rightRotate(w2, 17) ^ rightRotate(w2, 19) ^ (w2 >>> 10);
      const ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      const temp1 =
        hash[7] +
        (rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25)) +
        ch +
        k[i] +
        (w[i] = i < 16 ? w[i] : (w[i - 16] + s0 + w[i - 7] + s1) | 0);
      const maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      const temp2 =
        (rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22)) + maj;

      hash[7] = hash[6];
      hash[6] = hash[5];
      hash[5] = hash[4];
      hash[4] = (hash[3] + temp1) | 0;
      hash[3] = hash[2];
      hash[2] = hash[1];
      hash[1] = hash[0];
      hash[0] = (temp1 + temp2) | 0;
    }

    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }

  for (i = 0; i < 8; i++) {
    for (let j = 3; j >= 0; j--) {
      const b = (hash[i] >> (8 * j)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Calculate SHA-256 hash using native Web Crypto API with robust pure-JS fallback
export async function hashPassword(plainText: string): Promise<string> {
  const saltedInput = `${SALT}:${plainText.trim()}:${SALT}`;

  try {
    if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
      const enc = new TextEncoder();
      const data = enc.encode(saltedInput);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    }
  } catch (err) {
    console.warn('Web Crypto SHA-256 fallback triggered:', err);
  }

  // Fallback to pure JavaScript SHA-256
  return pureJsSha256(saltedInput);
}

// Retrieve the currently active admin password hash across all storage layers & repository files
export async function getActivePasswordHash(): Promise<string> {
  // 1. In-memory session cache
  if (inMemoryPasswordHash && inMemoryPasswordHash.trim().length > 0) {
    return inMemoryPasswordHash.trim();
  }

  // 2. Multi-tier browser storage (localStorage, sessionStorage, cookies)
  const stored = getStorageFallback(PWD_HASH_KEY);
  if (stored && stored.trim().length > 0) {
    inMemoryPasswordHash = stored.trim();
    return inMemoryPasswordHash;
  }

  // 3. Bundled auth.json from project repository (works on GitHub Pages & static builds)
  if (defaultAuthConfig && typeof defaultAuthConfig === 'object') {
    const configHash = (defaultAuthConfig as any).passwordHash;
    if (configHash && typeof configHash === 'string' && configHash.trim().length > 0) {
      const trimmed = configHash.trim();
      inMemoryPasswordHash = trimmed;
      setStorageFallback(PWD_HASH_KEY, trimmed);
      return trimmed;
    }
  }

  // 4. Runtime fetch from /data/auth.json (static hosting) or /api/admin/auth (Express)
  try {
    const res = await fetch('/data/auth.json?v=' + Date.now());
    if (res.ok) {
      const data = await res.json();
      if (data && data.passwordHash && typeof data.passwordHash === 'string' && data.passwordHash.trim().length > 0) {
        const trimmed = data.passwordHash.trim();
        inMemoryPasswordHash = trimmed;
        setStorageFallback(PWD_HASH_KEY, trimmed);
        return trimmed;
      }
    }
  } catch {}

  try {
    const res = await fetch('/api/admin/auth');
    if (res.ok) {
      const data = await res.json();
      if (data && data.passwordHash && typeof data.passwordHash === 'string' && data.passwordHash.trim().length > 0) {
        const trimmed = data.passwordHash.trim();
        inMemoryPasswordHash = trimmed;
        setStorageFallback(PWD_HASH_KEY, trimmed);
        return trimmed;
      }
    }
  } catch {}

  return '';
}

// Check if currently locked out due to brute-force protection
export function checkLockoutStatus(): { isLocked: boolean; remainingMinutes: number } {
  try {
    const lockoutUntil = localStorage.getItem(LOCKOUT_KEY);
    if (!lockoutUntil) return { isLocked: false, remainingMinutes: 0 };

    const lockTime = parseInt(lockoutUntil, 10);
    const now = Date.now();
    if (now < lockTime) {
      const remainingMinutes = Math.ceil((lockTime - now) / 60000);
      return { isLocked: true, remainingMinutes };
    }

    // Lockout expired, clean up
    localStorage.removeItem(LOCKOUT_KEY);
    localStorage.removeItem(FAILURES_KEY);
    return { isLocked: false, remainingMinutes: 0 };
  } catch {
    return { isLocked: false, remainingMinutes: 0 };
  }
}

// Record a failed login attempt
function recordFailedAttempt(): { remainingAttempts: number; isLocked: boolean; remainingMinutes: number } {
  try {
    const current = parseInt(localStorage.getItem(FAILURES_KEY) || '0', 10) + 1;
    localStorage.setItem(FAILURES_KEY, current.toString());

    if (current >= MAX_ATTEMPTS) {
      const lockUntil = Date.now() + LOCKOUT_MS;
      localStorage.setItem(LOCKOUT_KEY, lockUntil.toString());
      return { remainingAttempts: 0, isLocked: true, remainingMinutes: 15 };
    }

    return { remainingAttempts: MAX_ATTEMPTS - current, isLocked: false, remainingMinutes: 0 };
  } catch {
    return { remainingAttempts: 3, isLocked: false, remainingMinutes: 0 };
  }
}

// Reset failure counter on successful login
function resetFailedAttempts(): void {
  try {
    localStorage.removeItem(FAILURES_KEY);
    localStorage.removeItem(LOCKOUT_KEY);
  } catch {}
}

// Verify Admin Password with strict fallback control
export async function verifyAdminPassword(password: string): Promise<{
  success: boolean;
  message?: string;
  isLocked?: boolean;
  remainingMinutes?: number;
  remainingAttempts?: number;
}> {
  // Check lockout status
  const lockout = checkLockoutStatus();
  if (lockout.isLocked) {
    return {
      success: false,
      isLocked: true,
      remainingMinutes: lockout.remainingMinutes,
      message: `বারবার ভুল পাসওয়ার্ডের কারণে অ্যাডমিন এক্সেস সাময়িকভাবে স্থগিত। অনুগ্রহ করে ${lockout.remainingMinutes} মিনিট পর চেষ্টা করুন।`,
    };
  }

  const cleanPass = password.trim();
  if (!cleanPass) {
    return { success: false, message: 'পাসওয়ার্ড প্রদান করুন।' };
  }

  const activeHash = await getActivePasswordHash();
  const inputHash = await hashPassword(cleanPass);

  let isMatch = false;

  if (activeHash && activeHash.length > 0) {
    // A custom password has been configured! STRICTLY check against this custom hash only.
    // Default initial passwords (metro2026, admin123) are COMPLETELY DISABLED.
    isMatch = (inputHash === activeHash);
  } else {
    // No custom password set anywhere yet — allow initial setup default passwords
    const defaultInitialPasses = ['metro2026', 'admin123', 'admin'];
    isMatch = defaultInitialPasses.includes(cleanPass);
  }

  if (isMatch) {
    resetFailedAttempts();
    createAdminSession();
    return { success: true };
  } else {
    const failureStatus = recordFailedAttempt();
    if (failureStatus.isLocked) {
      return {
        success: false,
        isLocked: true,
        remainingMinutes: 15,
        message: 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সিস্টেম ১৫ মিনিটের জন্য লক করা হয়েছে!',
      };
    }
    return {
      success: false,
      remainingAttempts: failureStatus.remainingAttempts,
      message: `ভুল পাসওয়ার্ড! সতর্ক থাকুন, আর ${failureStatus.remainingAttempts} বার ভুল করলে এক্সেস ১৫ মিনিটের জন্য লক হয়ে যাবে।`,
    };
  }
}

// Change Admin Password and persist across all layers
export async function changeAdminPassword(
  currentPass: string,
  newPass: string,
  confirmPass: string
): Promise<{ success: boolean; message: string; newHash?: string; authJson?: string }> {
  if (!currentPass || !newPass) {
    return { success: false, message: 'বর্তমান এবং নতুন পাসওয়ার্ড উভয়ই দেওয়া আবশ্যক।' };
  }

  // Verify current password first
  const verifyRes = await verifyAdminPassword(currentPass);
  if (!verifyRes.success) {
    return { success: false, message: verifyRes.message || 'বর্তমান পাসওয়ার্ডটি সঠিক নয়।' };
  }

  if (newPass.length < 6) {
    return { success: false, message: 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে (৮+ অক্ষর ও সংখ্যা সুপারিশকৃত)।' };
  }

  if (newPass !== confirmPass) {
    return { success: false, message: 'নতুন পাসওয়ার্ড এবং নিশ্চিতকরণ পাসওয়ার্ড মেলেনি।' };
  }

  const newHash = await hashPassword(newPass);

  // 1. Update in-memory session cache
  inMemoryPasswordHash = newHash;

  // 2. Persist to browser multi-tier storage
  setStorageFallback(PWD_HASH_KEY, newHash);
  createAdminSession();

  // 3. Try updating backend API if running Express
  try {
    await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newHash }),
    });
  } catch {
    // Static GitHub Pages host might return 404
  }

  const authJson = JSON.stringify(
    {
      passwordHash: newHash,
      updatedAt: new Date().toISOString(),
      note: 'Amar Metro Admin Authentication Config - Place this in data/auth.json and commit to GitHub',
    },
    null,
    2
  );

  return {
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত ও সংরক্ষিত হয়েছে! এখন থেকে কেবল আপনার এই নতুন পাসওয়ার্ড দিয়েই প্রবেশ করা যাবে।',
    newHash,
    authJson,
  };
}

// Download auth.json file directly for committing to GitHub Pages
export function downloadAuthJson(hash?: string): void {
  const currentHash = hash || inMemoryPasswordHash || getStorageFallback(PWD_HASH_KEY) || '';
  const content = {
    passwordHash: currentHash,
    updatedAt: new Date().toISOString(),
    note: 'Amar Metro Admin Authentication Config - Place this in data/auth.json and commit to GitHub',
  };
  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(content, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', dataStr);
  downloadAnchor.setAttribute('download', 'auth.json');
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Check session validity (4-hour rolling expiry)
export function isSessionValid(): boolean {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;

    const sessionData = JSON.parse(sessionStr);
    const now = Date.now();
    if (sessionData && sessionData.expiresAt && now < sessionData.expiresAt) {
      return true;
    }
    clearAdminSession();
    return false;
  } catch {
    return false;
  }
}

// Create or refresh admin session
export function createAdminSession(): void {
  try {
    const sessionData = {
      authenticated: true,
      createdAt: Date.now(),
      expiresAt: Date.now() + SESSION_MS,
    };
    const str = JSON.stringify(sessionData);
    localStorage.setItem(SESSION_KEY, str);
    localStorage.setItem('amarmetro_admin_auth', 'true');
    sessionStorage.setItem(SESSION_KEY, str);
  } catch {}
}

// Clear admin session
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('amarmetro_admin_auth');
    sessionStorage.removeItem(SESSION_KEY);
  } catch {}
}

// Secret access slug (defaults to 'login' and 'backend')
export function getCustomSecretSlug(): string {
  try {
    return localStorage.getItem(SECRET_ACCESS_KEY) || 'metro-admin';
  } catch {
    return 'metro-admin';
  }
}

export function setCustomSecretSlug(slug: string): void {
  try {
    const clean = slug.toLowerCase().replace(/[^a-z0-9_-]/g, '').trim();
    if (clean) {
      localStorage.setItem(SECRET_ACCESS_KEY, clean);
    }
  } catch {}
}
