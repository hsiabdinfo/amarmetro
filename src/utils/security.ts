// Security and authentication utility for Amar Metro Admin Panel
// Features: Cryptographic SHA-256 password hashing, brute-force lockout, session management, and secret access keys.

const SALT = 'amarmetro_security_salt_2026_v1';
const PWD_HASH_KEY = 'amarmetro_admin_pwd_hash';
const SESSION_KEY = 'amarmetro_admin_session';
const FAILURES_KEY = 'amarmetro_admin_failures';
const LOCKOUT_KEY = 'amarmetro_admin_lockout';
const SECRET_ACCESS_KEY = 'amarmetro_secret_access_slug';

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout after 5 failed attempts
const SESSION_MS = 4 * 60 * 60 * 1000; // 4 hours session validity

// Calculate SHA-256 hash using native Web Crypto API
export async function hashPassword(plainText: string): Promise<string> {
  const enc = new TextEncoder();
  const data = enc.encode(`${SALT}:${plainText.trim()}:${SALT}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
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

// Verify Admin Password
export async function verifyAdminPassword(password: string): Promise<{
  success: boolean;
  message?: string;
  isLocked?: boolean;
  remainingMinutes?: number;
  remainingAttempts?: number;
}> {
  // Check lockout
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

  const storedHash = localStorage.getItem(PWD_HASH_KEY);
  const inputHash = await hashPassword(cleanPass);

  let isMatch = false;

  if (storedHash) {
    // User has set a custom password
    isMatch = (inputHash === storedHash);
  } else {
    // Initial setup fallback passwords before first change
    const defaultInitialPasses = ['admin123', 'metro2026', 'admin'];
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

// Change Admin Password
export async function changeAdminPassword(
  currentPass: string,
  newPass: string,
  confirmPass: string
): Promise<{ success: boolean; message: string; newHash?: string }> {
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
  localStorage.setItem(PWD_HASH_KEY, newHash);
  createAdminSession();

  // Try updating backend if available
  try {
    await fetch('/api/admin/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ newHash }),
    });
  } catch {
    // Backend may not be active in static GitHub Pages environment
  }

  return {
    success: true,
    message: 'পাসওয়ার্ড সফলভাবে পরিবর্তিত হয়েছে! এখন থেকে কেবল আপনার এই নতুন পাসওয়ার্ড দিয়েই লগইন করা যাবে।',
    newHash,
  };
}

// Check session validity (4-hour rolling expiry)
export function isSessionValid(): boolean {
  try {
    const sessionStr = localStorage.getItem(SESSION_KEY);
    if (!sessionStr) return false;

    const sessionData = JSON.parse(sessionStr);
    const now = Date.now();
    if (sessionData && sessionData.expiresAt && now < sessionData.expiresAt) {
      return true;
    }
    // Expired
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
    localStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));
    localStorage.setItem('amarmetro_admin_auth', 'true');
  } catch {}
}

// Clear admin session
export function clearAdminSession(): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('amarmetro_admin_auth');
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
