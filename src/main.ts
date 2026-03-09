// ─── Config ──────────────────────────────────────────────────────────────────
const SCHEME          = 'nuimarkets';
const PATH            = 'magic-link';
const FALLBACK_DELAY  = 2200;  // ms before assuming app is not installed

// Replace with real URLs when available:
const FRAICHE_URL     = 'https://app.nuimarkets.com';
const IOS_STORE_URL   = '';    // e.g. 'https://apps.apple.com/app/idXXXXXXXXX'
const ANDROID_STORE_URL = '';  // e.g. 'https://play.google.com/store/apps/details?id=com.nuimarkets.app'

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isIOS(): boolean {
  return /iPhone|iPad|iPod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /Android/i.test(navigator.userAgent);
}

function isMobile(): boolean {
  return isIOS() || isAndroid();
}

function showState(id: string): void {
  const states = ['state-loading', 'state-error', 'state-desktop', 'state-not-installed', 'state-invite'];
  for (const s of states) {
    const el = document.getElementById(s);
    if (el) el.hidden = s !== id;
  }
}

function setHref(id: string, url: string, show = true): void {
  const el = document.getElementById(id) as HTMLAnchorElement | null;
  if (!el) return;
  el.href   = url;
  el.hidden = !show;
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

// ─── Flow: magic link from email ─────────────────────────────────────────────
//
//   URL: /deeplink?token=X
//
//   Mobile + app installed  → custom scheme → app opens → done
//   Mobile + no app         → FALLBACK_DELAY ms → show store buttons + web link
//   Desktop                 → show "open on mobile"
//   No token                → show error
//
function handleMagicLink(token: string): void {
  if (!isMobile()) {
    showState('state-desktop');
    return;
  }

  // Try to open the app via custom scheme
  window.location.href = `${SCHEME}:///${PATH}?token=${encodeURIComponent(token)}`;

  // If we're still here after the delay, the app wasn't installed
  const timer = setTimeout(() => {
    showState('state-not-installed');

    // Store buttons (only show if URLs are configured)
    if (IOS_STORE_URL && isIOS()) {
      setHref('btn-appstore', IOS_STORE_URL);
    }
    if (ANDROID_STORE_URL && isAndroid()) {
      setHref('btn-playstore', ANDROID_STORE_URL);
    }

    // Web fallback — go to fraiche sign-in with the same token
    setHref('btn-web-fallback', `${FRAICHE_URL}/sign-in?token=${encodeURIComponent(token)}`);
  }, FALLBACK_DELAY);

  // If the page hides (app opened), cancel the timer
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) clearTimeout(timer);
  });
}

// ─── Flow: install invite from fraiche ───────────────────────────────────────
//
//   URL: /deeplink?invite&token=X
//
//   1. Copy deep link to clipboard (so app can read it on first launch)
//   2. Show store buttons to download the app
//   3. When app opens for the first time, it reads clipboard → auto-login
//
async function handleInvite(token: string): Promise<void> {
  showState('state-invite');

  const deepLink = `${SCHEME}:///${PATH}?token=${encodeURIComponent(token)}`;
  const copied   = await copyToClipboard(deepLink);

  // Show feedback badge
  const badgeOk   = document.getElementById('badge-clipboard');
  const badgeFail = document.getElementById('badge-clipboard-fail');
  if (copied) {
    if (badgeOk)   badgeOk.hidden   = false;
    if (badgeFail) badgeFail.hidden = true;
  } else {
    if (badgeOk)   badgeOk.hidden   = true;
    if (badgeFail) badgeFail.hidden = false;
  }

  // Show the right store button
  if (IOS_STORE_URL) {
    setHref('btn-invite-appstore', IOS_STORE_URL, isIOS() || !isAndroid());
  }
  if (ANDROID_STORE_URL) {
    setHref('btn-invite-playstore', ANDROID_STORE_URL, isAndroid() || !isIOS());
  }
}

// ─── Entry point ─────────────────────────────────────────────────────────────
(async function main(): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');
  const invite = params.has('invite');

  if (!token) {
    showState('state-error');
    return;
  }

  if (invite) {
    await handleInvite(token);
  } else {
    handleMagicLink(token);
  }
})();
