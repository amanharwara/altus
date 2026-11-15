# Working on Altus

Altus uses Electron, SolidJS, TypeScript, and Yarn 4 (via Corepack). Use Node 22
(`.nvmrc`). Install with `corepack yarn install --immutable`.

## Verification

- Run `corepack yarn verify` after changes: application and test type checking,
  ESLint, and the complete offline test suite.
- Run `corepack yarn test:coverage` to inspect coverage in `coverage/index.html`.
- Run `corepack yarn package` after changing build config, main/preload code, or
  dependencies. This compiles and packages all Electron entry points without
  launching the app. CI also checks packaging.
- Add regression tests for behavior changes. Read [docs/testing.md](docs/testing.md)
  for test boundaries, fixtures and focused commands.

Renderer stores hydrate from `window` bridge APIs at module import time. Install
bridge fixtures before dynamically importing stores/components; reset modules
between independent scenarios. Use the real components and stores; mock only
external desktop APIs and the WhatsApp WebView. Do not use a real profile or
WhatsApp account in automated tests.

WhatsApp webview/preload integration and operating-system behavior (tray,
protocol registration, auto-launch, native dialogs, window management) still
need manual verification when changed. Do not claim the mocked tests verify
those integrations.
