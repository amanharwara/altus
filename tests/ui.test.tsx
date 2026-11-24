import { fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { createSignal } from "solid-js";
import { installBridge } from "./setup";

let bridge: ReturnType<typeof installBridge>;
beforeEach(() => { vi.resetModules(); bridge = installBridge(); });

it("adds and selects tabs, wraps keyboard navigation, honors close cancellation and cleans listeners", async () => {
  const { default: TabsList } = await import("../src/components/TabsList");
  const { tabStore } = await import("../src/stores/tabs/solid");
  const { unmount } = render(() => <TabsList />);
  const original = tabStore.selectedTabId;
  await userEvent.click(screen.getByRole("button", { name: "Add new tab" }));
  expect(screen.getAllByRole("tab")).toHaveLength(2);
  expect(tabStore.selectedTabId).not.toBe(original);
  bridge.emit("onNextTab");
  expect(tabStore.selectedTabId).toBe(original);
  bridge.emit("onPreviousTab");
  expect(tabStore.selectedTabId).toBe(tabStore.tabs[1].id);
  vi.mocked(window.showMessageBox).mockResolvedValueOnce({ response: 1, checkboxChecked: false });
  bridge.emit("onCloseActiveTab");
  await waitFor(() => expect(window.showMessageBox).toHaveBeenCalled());
  expect(screen.getAllByRole("tab")).toHaveLength(2);
  bridge.emit("onCloseActiveTab");
  await waitFor(() => expect(screen.getAllByRole("tab")).toHaveLength(1));
  bridge.emit("onRestoreTab");
  expect(screen.getAllByRole("tab")).toHaveLength(2);
  unmount();
  expect(bridge.listenerCount()).toBe(0);
});

it("updates notification badges only for the matching tab and caps large counts", async () => {
  const { default: TabsList } = await import("../src/components/TabsList");
  const { tabStore } = await import("../src/stores/tabs/solid");
  render(() => <TabsList />);
  bridge.emit("onMessageCount", { tabId: "other", messageCount: 123 });
  expect(screen.queryByText("99+")).not.toBeInTheDocument();
  bridge.emit("onMessageCount", { tabId: tabStore.selectedTabId, messageCount: 123 });
  expect(screen.getByText("99+")).toBeInTheDocument();
  bridge.emit("onMessageCount", { tabId: tabStore.selectedTabId, messageCount: 0 });
  expect(screen.queryByText("99+")).not.toBeInTheDocument();
});

it("persists settings changed through the real settings dialog", async () => {
  const { default: SettingsDialog } = await import("../src/components/SettingsDialog");
  render(() => {
    const [open, setOpen] = createSignal(true);
    return <SettingsDialog isOpen={open} setIsOpen={setOpen} />;
  });
  const tray = await screen.findByRole("switch", { name: /trayIcon/ });
  expect(tray).toBeChecked();
  await userEvent.click(tray);
  expect(tray).not.toBeChecked();
  expect(window.electronSettingsStore.setSetting).toHaveBeenCalledWith("trayIcon", false);
  const directory = screen.getByRole("textbox", { name: /defaultDownloadDir/ });
  fireEvent.input(directory, { target: { value: "/tmp/downloads" } });
  expect(window.electronSettingsStore.setSetting).toHaveBeenCalledWith("defaultDownloadDir", "/tmp/downloads");
});

it("creates a CSS theme through the theme manager and confirms deletion", async () => {
  const { default: ThemeManager } = await import("../src/components/ThemeManagerDialog");
  const { themeStore } = await import("../src/stores/themes/solid");
  render(() => <ThemeManager isOpen={() => true} setIsOpen={() => undefined} />);
  expect(screen.queryByRole("button", { name: "deleteTheme" })).not.toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "addTheme" }));
  // The parent modal is hidden from accessibility after an animation frame.
  await waitFor(() => expect(screen.queryByRole("dialog", { name: "Theme Manager" })).not.toBeInTheDocument());
  expect(screen.getByRole("dialog", { name: "addTheme" })).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "addTheme" })).toBeDisabled();
  await userEvent.type(screen.getByRole("textbox", { name: "Name" }), "My theme");
  await userEvent.click(screen.getByRole("radio", { name: "useCSS" }));
  fireEvent.input(screen.getByRole("textbox", { name: "CSS" }), { target: { value: "body { color: red; }" } });
  await userEvent.click(screen.getByRole("button", { name: "addTheme" }));
  expect(themeStore.themes.at(-1)).toMatchObject({ name: "My theme", css: "body { color: red; }" });
  // Kobalte restores the parent modal's accessibility after an animation frame.
  // Wait for the manager to become accessible again, not just for store updates.
  await screen.findByRole("dialog", { name: "Theme Manager" });
  vi.spyOn(window, "confirm").mockReturnValueOnce(false).mockReturnValueOnce(true);
  await userEvent.click(screen.getByRole("button", { name: "deleteTheme" }));
  expect(screen.getByText("My theme")).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "deleteTheme" }));
  expect(screen.queryByText("My theme")).not.toBeInTheDocument();
  expect(themeStore.themes.map(t => t.id)).toEqual(["default", "dark"]);
});
