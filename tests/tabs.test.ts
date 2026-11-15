import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDefaultTab } from "../src/stores/tabs/common";

beforeEach(() => vi.resetModules());
const load = () => import("../src/stores/tabs/solid");

describe("tab store", () => {
  it("creates and persists an active tab on first launch", async () => {
    const { tabStore } = await load();
    expect(tabStore.tabs).toHaveLength(1);
    expect(tabStore.selectedTabId).toBe(tabStore.tabs[0].id);
    expect(window.electronTabStore.set).toHaveBeenCalledWith("tabs", expect.arrayContaining([expect.objectContaining({ id: tabStore.selectedTabId })]));
  });

  it("hydrates saved tabs and repairs missing selection and media permission", async () => {
    const tab = getDefaultTab();
    // Old persisted tabs did not have this permission.
    Reflect.deleteProperty(tab.config, "media");
    vi.mocked(window.electronTabStore.getStore).mockResolvedValue({ tabs: [tab], previouslyClosedTab: null, selectedTabId: undefined });
    const { tabStore } = await load();
    expect(tabStore.selectedTabId).toBe(tab.id);
    expect(tabStore.tabs[0].config.media).toBe(true);
    expect(window.electronTabStore.set).toHaveBeenCalledWith("selectedTabId", tab.id);
  });

  it("adds, selects, reorders and restores a closed tab only once", async () => {
    const store = await load();
    const original = store.tabStore.tabs[0];
    const second = getDefaultTab();
    store.addTab(second);
    expect(store.tabStore.selectedTabId).toBe(second.id);
    store.moveTabToIndex(1, 0);
    expect(store.tabStore.tabs.map(t => t.id)).toEqual([second.id, original.id]);
    // Webview render order must remain stable while the visible tabs move.
    expect(store.stableTabArray().map(t => t.id)).toEqual([original.id, second.id].sort());
    store.removeTab(second);
    expect(store.tabStore.selectedTabId).toBe(original.id);
    expect(store.tabStore.previouslyClosedTab?.id).toBe(second.id);
    store.restoreTab();
    store.restoreTab();
    expect(store.tabStore.tabs.map(t => t.id)).toEqual([original.id, second.id]);
    expect(store.tabStore.selectedTabId).toBe(second.id);
    expect(store.tabStore.previouslyClosedTab).toBeNull();
    expect(window.electronTabStore.set).toHaveBeenLastCalledWith("previouslyClosedTab", null);
  });

  it("keeps an active replacement when the last tab closes", async () => {
    const store = await load();
    const original = store.tabStore.tabs[0];
    store.removeTab(original);
    expect(store.tabStore.tabs).toHaveLength(1);
    expect(store.tabStore.selectedTabId).not.toBe(original.id);
    expect(store.tabStore.selectedTabId).toBe(store.tabStore.tabs[0].id);
    store.restoreTab();
    expect(store.tabStore.tabs).toHaveLength(2);
    expect(store.tabStore.selectedTabId).toBe(original.id);
  });
});
