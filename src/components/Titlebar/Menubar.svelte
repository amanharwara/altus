<script lang="ts">
  import type { CloneableMenuItem } from "../../types";
  const { ipcRenderer } = require("electron");

  async function getMenu() {
    const menu: CloneableMenuItem[] | undefined = await ipcRenderer.invoke(
      "getMenu"
    );

    if (menu) {
      return menu;
    } else {
      throw new Error("Could not get menu.");
    }
  }

  const submenuItemClick = (item) => {
    if (item.type === "normal") {
      ipcRenderer.send("click-menu-item", item.id);
    } else {
      return;
    }
  };
</script>

<div id="menubar">
  {#await getMenu()}
    Menu
  {:then menu}
    {#each menu as menuItem}
      <div class="menu-item">
        <div class="label">{menuItem.label.replace("&", "")}</div>
        {#if menuItem.submenu}
          <div class="submenu">
            {#each menuItem.submenu as submenuItem}
              <div
                class={`submenu-item ${submenuItem.type}`}
                on:click={() => submenuItemClick(submenuItem)}
              >
                {#if submenuItem.type !== "separator"}
                  <div class="label">{submenuItem.label.replace("&", "")}</div>
                  {#if submenuItem.accelerator}
                    <div class="accelerator">{submenuItem.accelerator}</div>
                  {/if}
                {:else}
                  <hr />
                {/if}
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/each}
  {/await}
</div>

<style lang="scss">
  #menubar {
    display: flex;
    grid-column: 2;
    margin-left: 8px;
    font-family: inherit;
    font-size: 14px;
    -webkit-app-region: no-drag;
    user-select: none;
  }

  .menu-item {
    display: flex;
    align-items: center;
    position: relative;
    padding: 0 8px;
    height: 100%;

    &:hover {
      background: #303336;

      & > .submenu {
        display: flex;
      }
    }
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

    &:hover {
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
