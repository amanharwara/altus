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

The Verify workflow runs type checking, lint, coverage and Linux packaging for
pushes and pull requests. It uploads coverage even if later packaging fails.
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
runtime behaviors. macOS and Windows packaging remain in the release workflow.
WhatsApp authentication, webview DOM, messages, media and notifications inside
WhatsApp are outside this automated suite.

The scoped `vitest/vite` and `vite-node/vite` resolutions keep the test runner
and its module loader on Vite 6 to match `vite-plugin-solid`'s supported peer
range. Revisit it when upgrading the test
runner or Solid plugin together. Forge retains its own build-time Vite version.
