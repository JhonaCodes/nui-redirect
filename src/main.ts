const SCHEME = 'nuimarkets';
const PATH   = 'magic-link';

// Optional: uncomment and set URLs to enable app-not-installed fallback
// const ANDROID_STORE_URL = 'https://play.google.com/store/apps/details?id=com.nuimarkets.app';
// const IOS_STORE_URL     = 'https://apps.apple.com/app/idXXXXXXXXX';
// const FALLBACK_DELAY_MS = 2500;

function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
}

function setStatus(icon: string, title: string, subtitle: string, isError = false): void {
  const iconEl     = document.getElementById('icon');
  const titleEl    = document.getElementById('title');
  const subtitleEl = document.getElementById('subtitle');

  if (iconEl)     iconEl.textContent    = icon;
  if (titleEl)    titleEl.textContent   = title;
  if (subtitleEl) {
    subtitleEl.textContent = subtitle;
    if (isError) subtitleEl.classList.add('error');
  }
}

function redirect(): void {
  const params = new URLSearchParams(window.location.search);
  const token  = params.get('token');

  if (!token) {
    setStatus('⚠️', 'Invalid Link', 'This link is missing the required token. Please request a new one.', true);
    return;
  }

  if (!isMobileDevice()) {
    setStatus('📱', 'Open on your mobile device', 'This link is intended for the NUI mobile app. Please open it from your phone.');
    return;
  }

  // Triple slash (empty authority) → GoRouter sees path as /magic-link
  window.location.href = `${SCHEME}:///${PATH}?token=${encodeURIComponent(token)}`;

  // Optional fallback: if the app is not installed, redirect to store after delay
  // setTimeout(() => {
  //   const isAndroid = /Android/i.test(navigator.userAgent);
  //   window.location.href = isAndroid ? ANDROID_STORE_URL : IOS_STORE_URL;
  // }, FALLBACK_DELAY_MS);
}

redirect();
