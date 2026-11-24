import { render, screen, waitFor } from "@solidjs/testing-library";
import { useContext } from "solid-js";
import { beforeEach, expect, it, vi } from "vitest";
import { readFileSync } from "node:fs";
import { languages } from "../src/i18n/langauges.config";
import { installBridge } from "./setup";

vi.mock("electron", () => ({ ipcMain: { handle: vi.fn() } }));
beforeEach(() => vi.resetModules());

it("uses current translations, English fallback, then the key; reloads and unsubscribes", async () => {
  const bridge = installBridge();
  vi.mocked(window.i18n.getTranslations).mockResolvedValue({
    current: { greeting: "Hola" }, fallback: { greeting: "Hello", fallback: "Fallback" },
  });
  const { I18NProvider, I18NContext } = await import("../src/i18n/solid");
  const Content = () => {
    const { t } = useContext(I18NContext);
    return <div>{t("greeting")} / {t("fallback")} / {t("unknown")}</div>;
  };
  const { unmount } = render(() => <I18NProvider><Content /></I18NProvider>);
  expect(await screen.findByText("Hola / Fallback / unknown")).toBeInTheDocument();
  expect(window.i18n.keyMissing).toHaveBeenCalledWith("unknown");
  vi.mocked(window.i18n.getTranslations).mockResolvedValue({ current: { greeting: "Hallo" }, fallback: {} });
  bridge.emit("onReloadTranslations");
  expect(await screen.findByText("Hallo / fallback / unknown")).toBeInTheDocument();
  unmount();
  expect(bridge.listenerCount()).toBe(0);
});

it("initializes main-process translations, guards lifecycle and notifies language changes", async () => {
  const { ElectronI18N } = await import("../src/i18n/electron");
  const i18n = new ElectronI18N();
  expect(() => i18n.t("greeting")).toThrow("not initialized");
  vi.spyOn(i18n, "loadLanguage").mockImplementation(async language => language === "en" ? { greeting: "Hello", fallback: "Fallback" } : { greeting: "Hola" });
  vi.spyOn(i18n, "keyMissing").mockImplementation(() => undefined);
  await i18n.initialize();
  expect(i18n.t("greeting")).toBe("Hello");
  expect(i18n.t("unknown")).toBe("unknown");
  expect(() => i18n.setLanguage("es")).toThrow("callback not set");
  const changed = vi.fn();
  const loaded = vi.fn();
  i18n.setLanguageChangeCallback(changed);
  i18n.setLanguageLoadedCallback(loaded);
  i18n.setLanguage("es");
  await waitFor(() => expect(loaded).toHaveBeenCalledOnce());
  expect(changed).toHaveBeenCalledWith("es");
  expect(i18n.getLanguage()).toBe("es");
  expect(i18n.t("greeting")).toBe("Hola");
  expect(i18n.t("fallback")).toBe("Fallback");
});

it.each(languages)("ships a usable %s translation catalog", language => {
  const catalog = JSON.parse(readFileSync(`public/locales/${language}/translation.json`, "utf8"));
  expect(Object.keys(catalog).length).toBeGreaterThan(0);
  expect(Object.values(catalog).every(value => typeof value === "string")).toBe(true);
  // Partial catalogs are supported by the English fallback, so key parity is not required.
});
