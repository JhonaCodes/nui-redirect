# deeplink-bridge

Single-page web bridge for NUI App deep linking (Strategy 2 — custom scheme).

Receives a magic link from email, detects if the user is on mobile, and redirects
to the native app via `nuimarkets://` scheme. Desktop users see a "open on mobile" message.

## Setup

```bash
yarn install
```

## Development

```bash
yarn dev
# Open http://localhost:5173/?token=test-token-123
```

## Build & Deploy

```bash
yarn build
# Upload contents of dist/ to your server
```

The page must be served at a public HTTPS URL, e.g.:
`https://your-server.com/deeplink/`

The magic link in emails should point to:
`https://your-server.com/deeplink/?token=<TOKEN>`

## Testing

### Android emulator (bypasses browser, direct scheme test)
```bash
adb shell am start -W -a android.intent.action.VIEW \
  -d "nuimarkets://login/email?token=test-token-123" \
  com.nuimarkets.app
```

### iOS simulator
```bash
xcrun simctl openurl booted \
  "nuimarkets://login/email?token=test-token-123"
```

### Full flow test (from browser)
Open on a real mobile device or emulator browser:
```
https://your-server.com/deeplink/?token=test-token-123
```

## Behavior

| Scenario | Result |
|----------|--------|
| Mobile + valid token | Redirects to `nuimarkets://login/email?token=X` |
| Mobile + no token | Shows error message |
| Desktop / tablet < 1024px | Shows "open on mobile" message |
| App not installed | OS silently ignores scheme (enable fallback in `main.ts` if needed) |

## Fallback (optional)

To redirect to the App Store/Play Store when the app is not installed,
uncomment the `setTimeout` block in `src/main.ts` and set the store URLs.
