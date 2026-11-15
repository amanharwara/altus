# Dependency upgrade batches

Apply and review one batch at a time, in the order below. Batches 1 through 5 are
applied. The order estimates regression risk for this app;
urgent security fixes can take priority. Recheck npm metadata and release notes
before each later batch, since versions and compatibility requirements change.

## Batch 1: development-only patches

- `@types/auto-launch`: 5.0.3 → 5.0.5
- `autoprefixer`: 10.4.15 → 10.4.27
- `postcss`: 8.5.3 → 8.5.32

These stay within their existing minor release lines. Use `~` ranges for these
three packages so subsequent resolutions stay on those lines. Autoprefixer's
browser data and PostCSS's helper dependencies change with them in `yarn.lock`.
This does not update Tailwind, application runtime dependencies, or Electron.

Release notes: [Autoprefixer](https://github.com/postcss/autoprefixer/blob/main/CHANGELOG.md),
[PostCSS](https://github.com/postcss/postcss/blob/main/CHANGELOG.md).

## Batch 2: compatible development tooling

- `eslint`: 8.48.0 → 8.57.1 (stays on the legacy configuration format)
- `eslint-plugin-import`: 2.31.0 → 2.32.0
- `ts-node`: 10.9.1 → 10.9.2
- `vite`: originally declared the missing development peer at 4.5.14;
  rebasing onto master retains its newer `^6.4.6` declaration for Vitest
- `@types/node`: declare 22.20.5 explicitly, matching Node 22 and Electron 35's
  `^22.7.7` requirement; the previously hoisted root copy was 20.5.9

Use `~` ranges to keep the upgraded tools on the verified minor release lines,
except Vite, whose declaration follows master. Forge's existing Vite v4 remains
separately resolved; the root Vite v6 serves the renderer configuration and tests.
The missing Node and Vite peer warnings are resolved. The existing
`electron-builder-squirrel-windows` peer remains for the packaging batch.

TypeScript stays at 5.8.3 and the matched TypeScript ESLint packages stay at
5.62.0. Their installed parser declares support for TypeScript `>=3.3.1 <5.2.0`,
so this is a pre-existing unsupported combination. Defer the compiler update
until the parser/plugin migration rather than increasing that mismatch here.
ESLint v8 is also end-of-life; this batch is an intermediate step toward the
major tooling migration below.

Release notes: [ESLint 8.57.1](https://eslint.org/blog/2024/09/eslint-v8.57.1-released/),
[import plugin](https://github.com/import-js/eslint-plugin-import/blob/main/CHANGELOG.md),
[ts-node](https://github.com/TypeStrong/ts-node/releases/tag/v10.9.2),
[Vite 4.5.14](https://github.com/vitejs/vite/releases/tag/v4.5.14).

## Batch 3: application-library patches

- `color2k`: 2.0.3 → 2.0.4
- `nanoid`: 5.1.5 → 5.1.16
- `solid-js`: 1.9.5 → 1.9.19
- `@kobalte/core`: resolved 0.13.9 → 0.13.14 (old manifest minimum: 0.13.8)
- `@kobalte/utils`: 0.9.0 → 0.9.2

All five stay within their existing minor lines and use `~` ranges. Kobalte core's
Solid peer (`^1.9.8`) is satisfied by 1.9.19. The Tailwind plugin remains at
0.9.0 because it has no newer patch. Zod and the styling, build, and Electron
dependencies remain unchanged. Transitive changes are limited to Kobalte's
presence/scroll helpers and Solid's serialization helpers.

Kobalte defers modal accessibility changes until an animation frame. The theme
creation test now waits for the parent dialog to leave the accessibility tree
while the editor is open and to return after saving. It still queries accessible
roles and checks creation and cancelled/confirmed deletion with real components.

Validation: immutable install, `yarn verify` (all 41 tests; the same 40 lint
warnings), `yarn test:coverage`, and Linux x64 packaging pass. Native desktop
interaction and macOS/Windows packaging have not been checked for this batch.

Release history: [Kobalte](https://github.com/kobaltedev/kobalte/releases),
[Solid](https://github.com/solidjs/solid/commits/main/),
[Nano ID](https://github.com/ai/nanoid/releases),
[color2k](https://github.com/ricokahler/color2k/releases).

## Batch 4: Zod v3

- `zod`: 3.24.2 → 3.25.76, with a `~3.25.76` range.

The existing root import still uses the v3 API. Although the package ships v4
as a separate subpath, this change does not adopt it. Only Zod's lock entry and
workspace declaration change in this batch; no other versions are refreshed.
Application/test type checking and the existing settings/defaults/hydration tests
pass with the upgraded declarations. `SettingsSchema` currently provides inferred
types; it is not used to parse saved settings at runtime.

Validation: immutable install, `yarn verify` (41 tests), `yarn test:coverage`, and
Linux x64 packaging pass. A real packaged Electron smoke test also passes using
a disposable `--user-data-dir`, HOME, and XDG configuration directory:

- Launch with the real preload bridge, add a tab, and select between tabs.
- Open Settings through its native menu, edit the download directory, verify
  persistence over IPC, and dismiss with Escape.
- Open Theme Manager through its native menu, create a CSS theme, and verify
  that the parent dialog becomes accessible again after saving.
- Quit and relaunch; confirm the setting, tab IDs/selection, and theme hydrate
  from disk.
- Delete the custom theme through the confirmation dialog; preserve built-ins.

No renderer exceptions were observed. The smoke test closes the app afterwards.
Its automation dependencies and disposable profiles live outside the repository.
The host emits graphics/font warnings but the tested UI flows complete. Existing
user profiles were not used. WhatsApp authentication, messaging, notifications,
tray/protocol/auto-launch behavior, and macOS/Windows remain outside this check.

## Batch 5: compatible styling updates

- `tailwindcss`: 3.3.3 → 3.4.19
- `autoprefixer`: 10.4.27 → 10.6.2
- `tailwind-merge`: 3.2.0 → 2.6.1 to use the Tailwind v3-compatible release line

Use `~` ranges for all three. Tailwind remains on v3 and retains the current
PostCSS configuration and Kobalte plugin. The merge helper's v3 line targets
Tailwind v4; this deliberately lower version aligns its conflict rules with the
CSS framework actually used by the app. The existing `twMerge`/`twJoin` imports
remain compatible. Electron, Forge, Solid, Zod, TypeScript, Vite, and the direct
PostCSS resolution are unchanged. Tailwind updates its own PostCSS and build
helpers transitively.

Validation: immutable install, type checking, lint, all 41 offline tests,
coverage, Linux x64 packaging, and `yarn test:smoke` pass. Generated CSS review
shows Tailwind preflight updates and opacity-variable fallbacks; removed utility
selectors are not referenced as standalone classes in the source. A separate
packaged desktop smoke check verifies tabs, Settings, CSS-theme creation/deletion and parent
modal accessibility, plus settings/tab/theme persistence across restart. It
also checks the dark editor's computed background/text colors, border, flex
layout, and dialog size, with a visual inspection of its screenshot. Both smoke
checks use disposable profiles and close the app afterwards. They do not verify
WhatsApp or macOS/Windows behavior.

Compatibility reference: [tailwind-merge](https://github.com/dcastil/tailwind-merge),
release notes: [Tailwind 3.4.19](https://github.com/tailwindlabs/tailwindcss/releases/tag/v3.4.19),
[Autoprefixer 10.6.2](https://github.com/postcss/autoprefixer/releases/tag/10.6.2),
[tailwind-merge 2.6.1](https://github.com/dcastil/tailwind-merge/releases/tag/v2.6.1).

## Remaining batches, lowest risk first

1. **Packaging and build tooling.** Align all `@electron-forge/*` packages on
   one compatible v7 release, including `plugin-vite`, and update
   `vite-plugin-solid` with its Vite peer requirements checked. Keep
   `app-builder-lib` and `dmg-builder` matched. Review the missing
   `electron-builder-squirrel-windows` peer when updating the custom makers.
   Run all three platform makers before considering this batch validated.
2. **Major development-tool migrations.** Migrate ESLint and its TypeScript
   integrations together, including configuration changes, and restore supported
   compiler/parser compatibility before updating TypeScript within v5. Handle TypeScript
   major upgrades separately. Then migrate Forge/Vite majors as a coupled build
   change, preserving all three main/preload entry points. Check required Node
   versions against `.nvmrc`, CI, and developer machines.
3. **Application API and styling migrations.** Migrate Zod v4, Nano ID v6, and
   Tailwind v4 in separate changes. Coordinate Tailwind's PostCSS integration,
   Kobalte plugin, and `tailwind-merge` versions. Validate existing settings and
   custom themes as well as creating new ones.
4. **Electron integrations and persisted data.** Upgrade
   `electron-context-menu`, `electron-dl`, and `electron-store` separately.
   Review Node/Electron minimums and ESM changes before choosing target versions;
   the current TypeScript output uses CommonJS. Test existing settings with a
   disposable profile, downloads, context menus, and launch-at-login behavior.
   Coordinate packages requiring a newer Electron runtime with the final batch.
5. **Electron runtime.** Upgrade the pinned Electron version in staged major
   steps to a supported target. Read breaking changes for every crossed major.
   Verify preload isolation, IPC, WhatsApp login and sessions, multiple accounts,
   notifications, tray, downloads, and external links. Exercise packaged apps
   and installers on Linux, macOS (both architectures), and Windows.

Packages already current, such as `auto-launch`, do not need a forced bump.
Keep Node/Yarn and GitHub Actions upgrades in separate changes so failures can
be attributed to one batch.

## Validation gate for every batch

Run `yarn install --immutable`, `yarn lint`, and `yarn package` with Node 22
and the Yarn version pinned in package.json, adjusting Node only in an explicitly scoped migration. Review
the lockfile for unrelated changes. For runtime/UI changes, launch the app and
exercise the affected features. For maker changes, run `yarn make` on each
supported platform. Keep each batch as a separate commit or PR, and revert the
whole batch if a regression cannot be resolved within its scope.

Before rebasing onto master, there was no automated test suite. Master now adds
offline Vitest tests, test type checking, coverage, and `yarn verify`; follow
`AGENTS.md` and `docs/testing.md` for the current verification workflow.
The original starting baseline
passes lint with 40 Zod import warnings and packages successfully on Linux x64.
Install also reports missing `@types/node`, `vite`, and
`electron-builder-squirrel-windows` peers; packaging reports an existing
`DEP0174` warning. Do not count these as new regressions in batch 1. Packaging
alone does not verify desktop behavior or macOS/Windows installers.

Batch 1 validation: immutable install and Linux x64 packaging pass. Generated
renderer CSS and JavaScript are byte-for-byte identical to the baseline.
Run lint before packaging, or remove generated `out/` packages first: the current
ESLint command also scans packaged source copies and duplicates their warnings.

Batch 2 validation: immutable install, TypeScript/ESLint (the same 40 existing
warnings), and Linux x64 packaging pass. Renderer CSS and JavaScript remain
byte-for-byte identical to batch 1. Runtime dependency declarations and the
Electron, Forge, TypeScript, and TypeScript ESLint lock entries are unchanged.
Desktop interaction and macOS/Windows packaging were not tested in this batch.

After rebasing onto master (`6c92181`), retain master's testing dependencies,
scripts, and Vite v6 declaration instead of the batch 2 Vite v4 declaration.
The remaining batch 1/2 upgrades are restored. Immutable install, `yarn verify`
(41 offline tests), `yarn test:coverage`, and Linux x64 packaging pass on the
combined tree. Earlier renderer comparisons describe the pre-rebase tree.

## Execution of remaining batches

### Batch 6: compatible packaging tools (completed)

Aligned Forge packages and shared types on 7.11.2, upgraded the Solid Vite plugin
within 2.11, and matched builder/DMG/Squirrel packages on 26.0.20. The attempted
26.18 line has an upstream `ElectronDownloadCacheMode`/`@electron/get` mismatch
that prevents AppImage creation; stay on the verified 26.0 patch line. The missing
builder peer is now explicitly provided. Vitest workers externalize Solid with
browser/development conditions so module resets share the renderer's runtime.
Immutable install, type/lint, 41 offline tests, coverage, Linux packaging,
packaged startup, and Linux AppImage creation pass. Native macOS/Windows maker
and startup checks run in the existing CI matrix. Styling batch CI passed all
four platform builds and launches before this batch.
### Batch 7: supported lint/compiler migration (completed)

Migrated to ESLint 9 flat configuration, matched TypeScript ESLint 8.72.2
parser/plugin, and TypeScript 5.9.3. The configured parser now supports the
compiler. Preserve import/Electron checks, browser/Node globals, and warnings for
unused variables; generated package/coverage output is explicitly ignored.
Tailwind's plugin uses an ESM import. ESLint 10 remains outside the import
plugin's supported peer range, and TypeScript 7 is outside the parser's supported
range, so neither is forced into an unsupported combination. Repository checks,
coverage, Linux packaging and real packaged startup pass.
### Batch 8: major build/test tools (completed)

Migrated Forge to 8.0.1, Vite to 8.3.8, Vitest/coverage to 5.1.0, updated Solid's
Vite plugin and testing-library packages, and refreshed Playwright and PostCSS.
Removed the old Vite 6 test resolutions. TypeScript now uses bundler resolution;
ESLint's TypeScript resolver handles modern package exports. Vitest worker
options follow its current schema. Forge 8 emits `.cjs` files: update the main
entry, both preload paths, and explicit main/preload build targets. The packaged
smoke check now verifies the WhatsApp preload URL points to its real bundled
file. Removed obsolete import.meta error suppressions. Repository verification,
coverage, all three Electron entry builds, Linux AppImage creation, and packaged
startup pass. The prior lint/compiler commit passed the full native CI matrix.
### Batch 9: Zod v4 (completed)

Moved Zod to 4.6.7 and use its named `z` export. Existing object/enum/boolean
settings types remain compatible; no persisted-data format or runtime parsing
policy changes. Immutable installation, type/lint, 41 offline tests, coverage,
Linux packaging and real packaged startup pass.
### Batch 10: Nano ID v6 (completed)

Updated Nano ID to 6.0.2. The app uses the unchanged zero-argument generator;
saved IDs stay untouched. Existing first-launch, distinct-defaults, tab CRUD,
theme creation and hydration tests pass, along with immutable installation,
coverage, Linux packaging, type/lint and real packaged startup.
### Forge 8 asset-copy correction (completed)

The deeper desktop check found missing native menus: Forge 8 disables public
asset copying for main bundles by default, leaving translation catalogs and
icons out of the main-process build directory. Explicitly enable copying there.
The persistent packaged smoke check now waits for loaded fallback translations
and asserts the native Settings menu exists. Full verification, coverage,
packaging and the strengthened smoke test pass.
### Batch 11: Tailwind v4 (completed)

Migrated Tailwind/PostCSS to 4.3.5 and tailwind-merge to 3.7.0. Replaced the
v3-only Kobalte plugin with the three used data-state variants, removed redundant
Autoprefixer and the legacy JS theme config, and use the v4 CSS import/source
workflow. Preserve the existing dark color tokens; rename outline/flex utilities
to preserve their behavior. Full checks and coverage (41 tests), Linux packaging,
and the strengthened native startup check pass. A real desktop check verifies
tab/settings/theme flows, accessibility restoration and persistence across a
restart; dark dialog colors/borders/sizing are asserted and its screenshot was
inspected. The Forge asset-copy correction is included in the tested base.
### Batch 12: Node 22 and test environment refresh (completed)

Pin Node 22.23.5 in `.nvmrc`, update Yarn to 4.18.1, and jsdom to 31.0.1. This
stays on the project's Node 22 line while satisfying current jsdom minimums.
Retain dependency build scripts for Electron tooling, without broad Git-source
allowlisting. Full repository checks (41 tests), coverage, Linux packaging and
the strengthened real packaged smoke check pass using the pinned Node binary.
### Batch 13: storage and compatible context menus (completed)

Upgraded electron-store to 12.0.0 and context menus within v4.1.2. IPC handler
annotations now match the existing renderer bridge contracts required by the
store's stricter generic types; persisted formats and deletion behavior are
unchanged. Keep electron-dl v4 until the runtime batch because v5 requires
Electron 44. Full verification/coverage, packaging and packaged startup pass.
Real desktop tests verify settings, theme CRUD and restart persistence. A copied
JSON profile written by electron-store 8 hydrates with unchanged settings, tab
IDs/selection and themes under electron-store 12. Only disposable profiles were
used.
### Batch 14: Electron 43 runtime checkpoint (completed)

Updated the pinned runtime from 35.1.5 to 43.8.10 after reviewing intervening
breaking changes. Main and sandboxed preload entry points build, repository
verification and coverage pass, Linux AppImage creation passes, and the packaged
translation/menu/preload smoke test succeeds. This is the verified checkpoint
before the Electron 44 clipboard changes and Electron 45 sandbox changes. No
account or real profile is used in these tests.
