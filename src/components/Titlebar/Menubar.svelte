<script lang="ts">
  let focused;
  let menubarElement;
  let menu;

  import type { CloneableMenuItem } from "../../types";
  import MenuItem from "./MenuItem.svelte";
  import { createEventDispatcher } from "svelte";
  const { ipcRenderer } = require("electron");
  const dispatchEvent = createEventDispatcher();

  async function getMenu() {
    const appMenu: CloneableMenuItem[] | undefined = await ipcRenderer.invoke(
      "getMenu"
    );

    menu = appMenu;

    if (appMenu) {
      return null;
    } else {
      throw new Error("Could not get menu.");
    }
  }

  $: {
    if (focused) {
      dispatchEvent("focused", true);
    } else {
      dispatchEvent("focused", false);
    }
  }

  const closeAllMenus = () => {
    menu = menu.map((item) => {
      return { ...item, focused: false };
    });
    focused = false;
  };

  const onClick = () => {
    focused = true;
  };

  const closeWhenBlurred = (e) => {
    if (!e.target.closest("#menubar")) {
      menu = menu.map((item) => {
        return {
          ...item,
          focused: false,
        };
      });
      focused = false;
    }
  };

  const onHover = (e) => {
    if (focused && e.target.id) {
      menu = menu.map((item) => {
        return {
          ...item,
          focused: item.id === e.target.id ? true : false,
        };
      });
    }
  };

  const onItemClick = () => {
    closeAllMenus();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    if (e.altKey) {
      if (focused) {
        closeAllMenus();
      } else {
        focused = true;
      }
    }
    if (focused) {
      if (e.key === "Escape") {
        closeAllMenus();
      }
      if (e.key === "ArrowRight") {
        let indexToFocus = menu.findIndex((item) => item.focused) + 1;
        if (indexToFocus === menu.length) indexToFocus = 0;
        menu = menu.map((item, index) => {
          return { ...item, focused: index === indexToFocus ? true : false };
        });
      }
      if (e.key === "ArrowLeft") {
        let indexToFocus = menu.findIndex((item) => item.focused) - 1;
        if (indexToFocus === -1) indexToFocus = menu.length - 1;
        menu = menu.map((item, index) => {
          return { ...item, focused: index === indexToFocus ? true : false };
        });
      }
    }
  };
</script>

<svelte:window on:click={closeWhenBlurred} on:keydown={onKeyDown} />

<div
  id="menubar"
  bind:this={menubarElement}
  on:mouseover={onHover}
  on:click={onClick}
  on:blur={() => closeAllMenus()}
>
  {#await getMenu() then _}
    {#each menu as menuItem}
      <MenuItem {menuItem} on:item-clicked={onItemClick} />
    {/each}
  {/await}
</div>

<style lang="scss">
  #menubar {
    display: flex;
    grid-column: 2;
    margin-left: 8px;
    font-family: inherit;
    -webkit-app-region: no-drag;
    user-select: none;
  }
</style>
