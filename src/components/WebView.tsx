import {
  type Component,
  onMount,
  createEffect,
  createMemo,
  createSignal,
} from "solid-js";
import { type Tab } from "../stores/tabs/common";
import { WebviewTag } from "electron";
import { themeStore } from "../stores/themes/solid";
import { unwrap } from "solid-js/store";

const WebView: Component<{ tab: Tab }> = (props) => {
  let webviewRef: WebviewTag | undefined;
  const [didStopLoading, setDidStopLoading] = createSignal(false);
  const [permissionHandlerRegistered, setPermissionHandlerRegistered] =
    createSignal(false);

  const selectedTheme = createMemo(() => {
    return unwrap(
      themeStore.themes.find((theme) => theme.id === props.tab.config.theme)
    );
  });

  const webviewSettings = createMemo(() => {
    const theme = selectedTheme();

    return {
      theme,
      sound: props.tab.config.sound,
      notifications: props.tab.config.notifications,
      media: props.tab.config.media,
      tabId: props.tab.id,
    };
  });

  let previousState:
    | {
        themeId?: string;
        sound?: boolean;
        notifications?: boolean;
        media?: boolean;
        tabId?: string;
      }
    | undefined;

  createEffect(() => {
    const webview = webviewRef;
    const ready = didStopLoading();
    const state = webviewSettings();

    if (!webview || !ready) return;

    const partition = `persist:${state.tabId}`;
    const themeId = state.theme?.id;
    const tabChanged = previousState?.tabId !== state.tabId;

    if (tabChanged && permissionHandlerRegistered()) {
      setPermissionHandlerRegistered(false);
    }

    if (!permissionHandlerRegistered()) {
      window.initPermissionHandler(partition);
      setPermissionHandlerRegistered(true);
    }

    if (tabChanged) {
      webview.send("set-id", state.tabId);
    }

    if (previousState?.themeId !== themeId) {
      webview.send("set-theme", state.theme);
    }

    if (previousState?.sound !== state.sound) {
      webview.setAudioMuted(!state.sound);
    }

    if (previousState?.notifications !== state.notifications) {
      window.toggleNotifications(state.notifications, partition);
    }

    if (previousState?.media !== state.media) {
      window.toggleMediaPermission(state.media, partition);
    }

    previousState = {
      themeId,
      sound: state.sound,
      notifications: state.notifications,
      media: state.media,
      tabId: state.tabId,
    };
  });

  onMount(() => {
    const webview = webviewRef;

    if (!webview) {
      return;
    }

    webview.addEventListener("did-stop-loading", () => {
      setDidStopLoading(false);
      setDidStopLoading(true);
    });

    webview.addEventListener("focus", () => {
      const anyOpenTitlebarMenu = document.querySelector(
        "[data-custom-titlebar-menu] > [data-expanded]"
      );
      if (!anyOpenTitlebarMenu) return;
      anyOpenTitlebarMenu.dispatchEvent(
        new KeyboardEvent("keydown", {
          key: "Enter",
          bubbles: true,
          cancelable: true,
        })
      );
    });
  });

  return (
    <webview
      ref={webviewRef}
      class="w-full h-full"
      id={`webview-${props.tab.id}`}
      src="https://web.whatsapp.com"
      partition={`persist:${props.tab.id}`}
      preload={window.whatsappPreloadPath}
      webpreferences={`spellcheck=${props.tab.config.spellChecker}`}
    />
  );
};

export default WebView;
