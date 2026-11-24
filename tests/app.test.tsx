import { render, screen, waitFor } from "@solidjs/testing-library";
import userEvent from "@testing-library/user-event";
import { beforeEach, expect, it, vi } from "vitest";
import { installBridge } from "./setup";

// Keep the full application shell; replace only the remote WhatsApp surface.
vi.mock("../src/components/WebView", () => ({
  default: (props: { tab: { id: string } }) => <div data-testid={`offline-webview-${props.tab.id}`} />,
}));
beforeEach(() => vi.resetModules());

it("opens app dialogs from menu events and renders the selected offline tab panel", async () => {
  const bridge = installBridge();
  const { default: App } = await import("../src/App");
  const { tabStore } = await import("../src/stores/tabs/solid");
  const { unmount } = render(() => <App />);
  expect(screen.getByRole("tabpanel")).toHaveAttribute("id", `tabpanel-${tabStore.selectedTabId}`);
  expect(screen.getByTestId(`offline-webview-${tabStore.selectedTabId}`)).toBeInTheDocument();
  await userEvent.click(screen.getByRole("button", { name: "Add new tab" }));
  const panels = screen.getAllByRole("tabpanel");
  expect(panels).toHaveLength(2);
  for (const panel of panels) {
    if (panel.id === `tabpanel-${tabStore.selectedTabId}`) {
      expect(panel).not.toHaveClass("hidden");
    } else {
      expect(panel).toHaveClass("hidden");
    }
  }
  bridge.emit("onOpenSettings");
  const settings = await screen.findByRole("dialog", { name: "Settings" });
  expect(settings).toHaveAttribute("data-expanded");
  await userEvent.keyboard("{Escape}");
  await waitFor(() => expect(settings).toHaveAttribute("data-closed"));
  bridge.emit("onOpenThemeManager");
  expect(await screen.findByRole("dialog", { name: "Theme Manager" })).toBeInTheDocument();
  unmount();
  expect(bridge.listenerCount()).toBe(0);
});
