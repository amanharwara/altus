<script lang="ts">
  import Menubar from "./Titlebar/Menubar.svelte";
  import WindowControls from "./Titlebar/WindowControls.svelte";

  const { ipcRenderer } = require("electron");

  let maximized = false;
  let blurred = false;

  const minimize = () => {
    ipcRenderer.send("minimize-window");
  };

  const maximize = () => {
    ipcRenderer.send("maximize-window");
    maximized = true;
  };

  const restore = () => {
    ipcRenderer.send("restore-window");
    maximized = false;
  };

  const close = () => {
    ipcRenderer.send("close-window");
  };

  ipcRenderer.on("window-blurred", () => (blurred = true));
  ipcRenderer.on("window-focused", () => (blurred = false));
</script>

<header id="titlebar" class:blurred class:maximized>
  <div id="drag-region">
    <div id="window-icon">
      <img src="./icon.png" alt="Altus Icon" />
    </div>
    <Menubar />
    <div id="window-title">
      <span>Altus</span>
    </div>
    <WindowControls
      on:close={close}
      on:maximize={maximize}
      on:minimize={minimize}
      on:restore={restore}
      {maximized}
    />
  </div>
</header>

<style lang="scss">
  #titlebar {
    display: block;
    height: 32px;
    width: 100%;
    position: relative;
    padding: 1px 1px 0 1px;
    background: #202224;
    color: #fff;
    fill: #fff;
    font-family: "Segoe UI", "Inter", Roboto, Oxygen, Ubuntu, Cantarell,
      "Open Sans", "Helvetica Neue", sans-serif;
    z-index: 3;

    &.maximized {
      padding: 0;
    }
  }
  #drag-region {
    display: flex;
    width: 100%;
    height: 100%;
    -webkit-app-region: drag;
    user-select: none;

    & > :global(:not(#window-controls)) {
      font-size: 13px;
    }

    .blurred & {
      opacity: 0.75;
    }
  }
  #window-icon {
    display: flex;
    align-items: center;
    width: 24px;
    height: 100%;
    margin-left: 4px;

    img {
      width: 24px;
      height: 24px;
    }
  }
  #window-title {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-family: inherit;
  }
</style>
