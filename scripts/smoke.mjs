import assert from "node:assert/strict";
import { mkdir, mkdtemp, realpath, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { _electron as electron } from "playwright-core";

// Launch the native Forge package produced by `yarn make`, not a development
// Electron binary. The release installers themselves are not installed here.
const packageDir = path.resolve(`out/Altus-${process.platform}-${process.arch}`);
const executablePath = path.join(
  packageDir,
  process.platform === "darwin"
    ? "Altus.app/Contents/MacOS/Altus"
    : process.platform === "win32"
      ? "Altus.exe"
      : "Altus"
);
const diagnosticsDir = path.resolve("out/smoke");
const profile = await mkdtemp(path.join(os.tmpdir(), "altus-smoke-"));
await mkdir(diagnosticsDir, { recursive: true });
await writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({
    registerProtocol: { value: false },
    autoLaunch: { value: false },
    launchMinimized: { value: false },
    closeToTray: { value: false },
    exitPrompt: { value: false },
  })
);

let application;
let window;
const log = [];
const rendererErrors = [];
// Bound the whole check, including teardown, if Electron stops responding.
const deadline = setTimeout(() => {
  application?.process().kill("SIGKILL");
  console.error("Packaged application smoke test timed out");
  process.exit(1);
}, 90_000);

try {
  const env = { ...process.env };
  delete env.ELECTRON_RUN_AS_NODE;
  application = await electron.launch({
    executablePath,
    args: [
      `--user-data-dir=${profile}`,
      // Hosted Linux runners restrict Chromium's unprivileged sandbox setup.
      ...(process.platform === "linux" && process.env.CI ? ["--no-sandbox"] : []),
      // Keep WhatsApp and Chromium background traffic offline. This smoke test
      // exercises the local shell and preload, not WhatsApp or a real account.
      "--proxy-server=http://127.0.0.1:9",
      "--proxy-bypass-list=<-loopback>",
      "--host-resolver-rules=MAP * ~NOTFOUND",
      "--disable-background-networking",
    ],
    env,
    timeout: 45_000,
  });
  application.process().stdout?.on("data", (data) => log.push(String(data)));
  application.process().stderr?.on("data", (data) => log.push(String(data)));
  application.on("window", (page) => {
    page.on("pageerror", (error) => {
      log.push(`Renderer error (${page.url()}): ${error.stack}`);
      rendererErrors.push({ page, message: error.message });
    });
  });
  window = await application.firstWindow({ timeout: 30_000 });
  window.setDefaultTimeout(30_000);

  const runtime = await application.evaluate(({ app }) => ({
    packaged: app.isPackaged,
    userData: app.getPath("userData"),
    appPath: app.getAppPath(),
    arch: process.arch,
  }));
  assert.equal(runtime.packaged, true, "Must launch the packaged app");
  // macOS resolves /var to /private/var in Electron's userData path. Compare
  // filesystem identities so a symlink alias still verifies profile isolation.
  assert.equal(
    await realpath(runtime.userData),
    await realpath(profile),
    "Must use a fresh profile"
  );
  assert.equal(runtime.arch, process.arch, "Must run the native architecture");

  await window.getByRole("tab", { selected: true }).waitFor({ state: "visible" });
  await window.getByRole("button", { name: "Add new tab", exact: true }).waitFor({
    state: "visible",
  });
  await window.waitForFunction(() => document.visibilityState === "visible");
  const nativeWindow = await application.browserWindow(window);
  await nativeWindow.evaluate((win) => {
    if (win.isVisible()) return;
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        win.removeListener("show", onShow);
        reject(new Error("The application window was not shown within 30 seconds"));
      }, 30_000);
      function onShow() {
        clearTimeout(timeout);
        resolve();
      }
      win.once("show", onShow);
    });
  });
  assert.equal(
    await application.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows().some((win) => win.isVisible())
    ),
    true,
    "The application window must be shown"
  );
  const settings = await window.evaluate(() => window.electronSettingsStore.getStore());
  assert.equal(settings.registerProtocol.value, false, "Preload IPC must work");
  await window.waitForFunction(async () => {
    const translations = await globalThis.i18n.getTranslations();
    return translations.fallback.Settings === "Settings";
  });
  assert.equal(
    await application.evaluate(({ Menu }) => Boolean(
      Menu.getApplicationMenu()?.getMenuItemById("open-settings")
    )),
    true,
    "Packaged translation assets must initialize the native application menu"
  );
  await window.waitForFunction(() => typeof globalThis.whatsappPreloadPath === "string");
  const preloadURL = await window.evaluate(() => globalThis.whatsappPreloadPath);
  const preloadPath = fileURLToPath(preloadURL);
  assert.equal(path.basename(preloadPath), "whatsapp.preload.cjs");
  assert.equal(
    await realpath(preloadPath),
    await realpath(path.join(runtime.appPath, ".vite", "build", "whatsapp.preload.cjs")),
    "WhatsApp preload must point to the packaged entry point"
  );
  assert.deepEqual(
    rendererErrors.filter((error) => error.page === window).map((error) => error.message),
    [],
    "Shell renderer must start without uncaught errors"
  );
  await window.screenshot({ path: path.join(diagnosticsDir, "startup.png") });
  console.log(`Packaged Altus opened successfully on ${process.platform}-${process.arch}`);
} catch (error) {
  if (window && !window.isClosed()) {
    await window.screenshot({
      path: path.join(diagnosticsDir, "failure.png"),
      timeout: 5_000,
    }).catch(() => {});
  }
  log.push(String(error));
  throw error;
} finally {
  await writeFile(path.join(diagnosticsDir, "startup.log"), log.join("\n"));
  try {
    await application?.close();
  } finally {
    await rm(profile, { recursive: true, force: true, maxRetries: 5 });
    clearTimeout(deadline);
  }
}
