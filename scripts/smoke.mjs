import assert from "node:assert/strict";
import { mkdir, mkdtemp, readFile, realpath, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
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
const downloadDirectory = path.join(profile, "downloads");
await mkdir(downloadDirectory);
await mkdir(diagnosticsDir, { recursive: true });
await writeFile(
  path.join(profile, "settings.json"),
  JSON.stringify({
    registerProtocol: { value: false },
    autoLaunch: { value: false },
    launchMinimized: { value: false },
    closeToTray: { value: false },
    exitPrompt: { value: false },
    showSaveDialog: { value: false },
    defaultDownloadDir: { value: downloadDirectory },
  })
);

let application;
let window;
let fixtureServer;
const log = [];
const rendererErrors = [];
// Bound the whole check, including teardown, if Electron stops responding.
const deadline = setTimeout(() => {
  application?.process().kill("SIGKILL");
  console.error("Packaged application smoke test timed out");
  process.exit(1);
}, 180_000);

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
      "--proxy-bypass-list=127.0.0.1",
      "--host-resolver-rules=EXCLUDE 127.0.0.1, MAP * ~NOTFOUND",
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
  assert.equal(
    await application.evaluate(({ BrowserWindow }) =>
      BrowserWindow.getAllWindows()[0].webContents.session.listenerCount("will-download") > 0
    ),
    true,
    "Download handling must be installed for the first window's session"
  );
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
  // Exercise the real download helper without remote traffic or a save dialog.
  const contents = "Altus packaged download fixture\n";
  fixtureServer = createServer((_request, response) => {
    response.writeHead(200, {
      "Content-Type": "text/plain",
      "Content-Disposition": 'attachment; filename="altus-smoke.txt"',
    });
    response.end(contents);
  });
  await new Promise((resolve, reject) => {
    fixtureServer.once("error", reject);
    fixtureServer.listen(0, "127.0.0.1", resolve);
  });
  const download = await application.evaluate(({ BrowserWindow }, url) =>
    new Promise((resolve, reject) => {
      const win = BrowserWindow.getAllWindows()[0];
      const timeout = setTimeout(() => reject(new Error("Download timed out")), 15_000);
      win.webContents.session.once("will-download", (_event, item) => {
        item.once("done", (_event, state) => {
          clearTimeout(timeout);
          resolve({ state, path: item.getSavePath() });
        });
      });
      win.webContents.downloadURL(url);
    }),
    `http://127.0.0.1:${fixtureServer.address().port}/fixture`
  );
  assert.equal(download.state, "completed");
  assert.equal(await realpath(path.dirname(download.path)), await realpath(downloadDirectory));
  assert.equal(await readFile(download.path, "utf8"), contents);
  await window.screenshot({ path: path.join(diagnosticsDir, "startup.png") });
  console.log(`Packaged Altus opened successfully on ${process.platform}-${process.arch}`);

  // Regression (issue #394): with "Start Minimized" enabled the window must
  // stay hidden in the tray, and launching the app again must reveal it.
  await application.close();
  application = null;

  const minimizedProfile = await mkdtemp(path.join(os.tmpdir(), "altus-smoke-minimized-"));
  try {
    await writeFile(
      path.join(minimizedProfile, "settings.json"),
      JSON.stringify({
        registerProtocol: { value: false },
        autoLaunch: { value: false },
        launchMinimized: { value: true },
        trayIcon: { value: true },
        closeToTray: { value: false },
        exitPrompt: { value: false },
      })
    );
    const minimizedEnv = { ...process.env };
    delete minimizedEnv.ELECTRON_RUN_AS_NODE;
    application = await electron.launch({
      executablePath,
      args: [
        `--user-data-dir=${minimizedProfile}`,
        ...(process.platform === "linux" && process.env.CI ? ["--no-sandbox"] : []),
        "--proxy-server=http://127.0.0.1:9",
        "--proxy-bypass-list=127.0.0.1",
        "--host-resolver-rules=EXCLUDE 127.0.0.1, MAP * ~NOTFOUND",
        "--disable-background-networking",
      ],
      env: minimizedEnv,
      timeout: 45_000,
    });
    application.process().stdout?.on("data", (data) => log.push(String(data)));
    application.process().stderr?.on("data", (data) => log.push(String(data)));
    const minimizedWindow = await application.firstWindow({ timeout: 30_000 });
    minimizedWindow.setDefaultTimeout(30_000);

    // The preload running proves the renderer booted; give the window time to
    // finish its first paint so a buggy "ready-to-show" would have shown it.
    await minimizedWindow.waitForFunction(() => typeof globalThis.whatsappPreloadPath === "string");
    await minimizedWindow.waitForTimeout(2_000);
    assert.equal(
      await application.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isVisible()
      ),
      false,
      "Window must stay hidden in the tray when 'Start Minimized' is enabled"
    );

    // Launching a second instance hands focus back and must reveal the window.
    const secondInstance = spawn(
      executablePath,
      [`--user-data-dir=${minimizedProfile}`],
      { stdio: "ignore" }
    );
    await new Promise((resolve, reject) => {
      secondInstance.once("error", reject);
      secondInstance.once("exit", resolve);
    });
    await minimizedWindow.waitForFunction(() => document.visibilityState === "visible");
    assert.equal(
      await application.evaluate(({ BrowserWindow }) =>
        BrowserWindow.getAllWindows()[0].isVisible()
      ),
      true,
      "Launching the app again must reveal the hidden window"
    );
    console.log("Packaged Altus starts hidden in the tray and is revealed on re-launch");
  } finally {
    await rm(minimizedProfile, { recursive: true, force: true, maxRetries: 5 });
  }
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
  fixtureServer?.close();
  await writeFile(path.join(diagnosticsDir, "startup.log"), log.join("\n"));
  try {
    await application?.close();
  } finally {
    await rm(profile, { recursive: true, force: true, maxRetries: 5 });
    clearTimeout(deadline);
  }
}
