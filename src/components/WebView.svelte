<script lang="ts">
  import { afterUpdate, onMount } from "svelte";
  import type { TabType } from "../types";
  export let partition;
  export let tab: TabType;

  let webviewElement;
  let hasStoppedLoading = false;

  const sendWebviewConfig = () => {
    webviewElement.send("set-theme", tab.config.theme);
    webviewElement.setAudioMuted(!tab.config.sound);
  };

  afterUpdate(() => {
    if (!hasStoppedLoading) {
      webviewElement.addEventListener("did-stop-loading", () => {
        hasStoppedLoading = true;
        sendWebviewConfig();
      });
    } else {
      sendWebviewConfig();
    }
  });
</script>

<webview
  id={`webview-${partition}`}
  src="https://web.whatsapp.com"
  preload="../src/preload.js"
  {partition}
  bind:this={webviewElement}
  useragent={window.navigator.userAgent.replace(
    /(Altus4|Electron)([^\s]+\s)/g,
    ""
  )}
  webpreferences={`spellcheck=${tab.config.spellChecker ? 1 : 0}`}
/>
