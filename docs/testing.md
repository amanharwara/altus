# Testing and verification

Use Node 22 and the repository's Yarn version:

```sh
corepack enable
corepack yarn install --immutable
corepack yarn verify
```

`verify` checks both application and test TypeScript, runs ESLint, and runs the
suite once. Tests use Vitest, jsdom, Solid Testing Library and user-event; they
need no display server, Electron process, network or WhatsApp account.

| Command | Purpose |
| --- | --- |
| `corepack yarn test` | All offline tests, once (nonzero exit on failure) |
| `corepack yarn test tests/ui.test.tsx` | Focus on one test file |
| `corepack yarn test:watch` | Rerun related tests while editing |
| `corepack yarn test:coverage` | Console summary, HTML and JSON in `coverage/` |
| `corepack yarn typecheck` | Check application, tests and test configuration |
| `corepack yarn lint` | Existing TypeScript/ESLint checks |
| `corepack yarn package` | Compile and package the Electron app without launching |
| `corepack yarn test:smoke` | Launch the native package in `out/` and check window, renderer and preload startup (requires a desktop display) |

The Verify workflow runs type checking, lint and coverage for pushes and pull
requests. Separate platform jobs run `yarn make` to build AppImage, NSIS and DMG
artifacts, then launch the packaged application on Linux x64, Windows x64,
macOS Intel and macOS Apple Silicon. Linux uses Xvfb for its display. Platform
jobs run independently so a failure on one platform does not cancel the others.
Coverage is uploaded even on failure; each platform also uploads startup logs
and a screenshot from the smoke check under `out/smoke/`.

The smoke check uses Playwright Core to control the packaged Electron executable
without downloading a separate browser. It requires a visible native window,
the selected tab and add-tab button, a working settings preload/IPC round trip,
and no uncaught shell renderer errors. A disposable user-data directory disables
protocol registration and exit prompts; Chromium networking is blocked so no
WhatsApp account or live service is needed. The profile is removed on completion.
Run this in a disposable desktop/OS session, since normal app startup still
exercises native integrations such as tray setup and disabling auto-launch.
For a local Linux check after `corepack yarn make`, use
`xvfb-run --auto-servernum corepack yarn test:smoke` (or use an existing display).
The smoke check launches the unpacked Forge package used to build the release
artifact; it does not install or launch the AppImage, NSIS installer or DMG.

Coverage includes untested application files so gaps remain visible. Icons,
type declarations and WhatsApp-specific WebView/preload code are excluded.
There is no arbitrary overall coverage gate; add assertions around the behavior
you change and inspect uncovered branches.

## Covered behavior

- Tab bootstrap, saved-tab hydration/migration, selection, reordering, stable
  webview order, last-tab replacement and restoring a closed tab.
- Settings hydration and persistence; theme CRUD and stale built-in theme cleanup.
- Application shell dialog/menu wiring and active tab panels with the WhatsApp
  surface replaced.
- Real tab-list interactions and IPC navigation, close confirmation/cancellation,
  message badges and event-listener cleanup.
- Settings dialog edits; theme manager creation, empty-name validation and
  confirmed/cancelled deletion.
- Preload bridge store channels/arguments, event payload wrappers and unsubscribe
  behavior.
- Renderer translation reload, fallback and subscription cleanup; main-process
  translation lifecycle; shipped locale catalog validity.

## Writing tests

Put tests in `tests/*.test.ts` or `tests/*.test.tsx`. `tests/setup.ts` installs
fresh typed desktop bridge mocks before each test and cleans rendered DOM after
each test. `installBridge()` also exposes `emit()` to simulate menu/IPC events
and `listenerCount()` to verify cleanup. Stub missing browser layout APIs only
when needed (for example jsdom's `scrollTo` for dialog scroll-lock cleanup).

Stores are module singletons with asynchronous hydration. Use `vi.resetModules()`
and dynamic imports after configuring `getStore` to test independent persisted
states. Wait for hydration/observable UI updates before acting. Keep assertions
on user-visible results and the persistence/IPC boundary rather than snapshots.
Solid currently creates store-level effects outside a root; its development
runtime emits a warning when these modules load in tests, as in development.
Do not suppress unexpected warnings or errors.

The main theme migration test replaces electron-store with an in-memory boundary;
it verifies migration logic, not filesystem persistence. Preload tests replace
Electron with spies. These tests never write actual user settings or register
protocols/startup entries.

## Manual integration checks

Run `corepack yarn start` in a desktop session when changing native integration.
Use a disposable OS/profile and inspect the relevant platform behavior: window
controls/size/position, menu shortcuts, tray close/restore, protocol links,
auto-launch and native save dialogs. Packaging verifies compilation, not these
runtime behaviors. The CI smoke check verifies basic packaged startup on all
platforms, but does not replace these manual integration checks.
WhatsApp authentication, webview DOM, messages, media and notifications inside
WhatsApp are outside this automated suite.

Forge and the test runner now share Vite 8. Solid is externalized in test workers
with browser/development conditions so module-reset tests share one client
runtime. Revisit these conditions when updating the test runner or Solid plugin.
