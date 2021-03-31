<script lang="ts">
  export let menuItem: CloneableMenuItem;
  $: focused = menuItem.focused;
  let menuItemElement;

  const { ipcRenderer } = require("electron");
  import type { CloneableMenuItem } from "../../types";
  import { createEventDispatcher } from "svelte";
  const dispatchEvent = createEventDispatcher();

  const submenuItemClick = (item, event) => {
    event.stopPropagation();
    if (item.type === "normal") {
      ipcRenderer.send("click-menu-item", item.id);
    } else {
      return;
    }
    dispatchEvent("item-clicked", item.id);
  };

  const menuItemClick = () => {
    focused = !focused;
  };

  const menuItemBlur = () => {
    focused = false;
  };
</script>

<button
  type="button"
  class="menu-item"
  class:focused
  id={menuItem.id}
  bind:this={menuItemElement}
  on:click={menuItemClick}
  on:blur={menuItemBlur}
>
  <div class="label">{menuItem.label.replace("&", "")}</div>
  {#if menuItem.submenu}
    <div class="submenu">
      {#each menuItem.submenu as submenuItem}
        <div
          class={`submenu-item ${submenuItem.type}`}
          on:click={(e) => {
            submenuItemClick(submenuItem, e);
          }}
        >
          {#if submenuItem.type !== "separator"}
            <div class="label">{submenuItem.label.replace("&", "")}</div>
            {#if submenuItem.accelerator}
              <div class="accelerator">
                {submenuItem.accelerator.replace("CmdOrCtrl", "Ctrl")}
              </div>
            {/if}
          {:else}
            <hr />
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</button>

<style lang="scss">
  .menu-item {
    display: flex;
    align-items: center;
    position: relative;
    padding: 0 8px;
    height: 100%;
    border: 0;
    background: transparent;
    color: inherit;

    &:focus {
      outline: none;
    }

    &:hover,
    &.focused {
      background: #303336;
    }
  }

  .focused > .submenu {
    display: flex !important;
  }

  .menu-item > .submenu {
    display: none;
    flex-flow: column nowrap;
    width: max-content;
    position: absolute;
    top: 100%;
    left: 0;
    background: #202224;
    color: #fff;
  }

  .submenu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 12px 16px;

    .label {
      margin-right: 2rem;
    }

    .accelerator {
      color: #c3c3c3;
    }

    &:not(.separator):hover {
      background: #1c2028;
    }

    &.separator {
      padding: 4px 8px;

      hr {
        width: 100%;
        border-color: rgba(255, 255, 255, 0.25);
        margin: 0;
      }
    }
  }
</style>
