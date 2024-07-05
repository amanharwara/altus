import RestoreIcon from "../icons/RestoreIcon";
import MinimizeIcon from "../icons/MinimizeIcon";
import CloseIcon from "../icons/CloseIcon";
import {
  Component,
  For,
  Match,
  Resource,
  Show,
  Switch,
  createSignal,
} from "solid-js";
import { CloneableMenu } from "../main";
import { DropdownMenu } from "@kobalte/core";
import { ChevronRightIcon } from "../icons/ChevronRightIcon";
import MaximizeIcon from "../icons/MaximizeIcon";
import RadioBoxMarked from "../icons/RadioBoxMarked";
import RadioBoxBlank from "../icons/RadioBoxBlank";

const MenuItem: Component<{
  item: CloneableMenu[number];
}> = (props) => {
  return (
    <Switch>
      <Match when={props.item.type === "normal"}>
        <DropdownMenu.Item
          onSelect={() =>
            window.clickMenuItem(
              props.item.id || props.item.commandId.toString()
            )
          }
          class="flex items-center justify-between w-full py-1.5 px-4 hover:bg-white/10 focus:bg-white/20 select-none outline-none"
        >
          <span class="mr-8">{props.item.label.replace(/&/g, "")}</span>
          <Show when={props.item.accelerator}>
            <span class="ml-auto text-[#c3c3c3]">{props.item.accelerator}</span>
          </Show>
        </DropdownMenu.Item>
      </Match>
      <Match when={props.item.type === "radio"}>
        <DropdownMenu.Item
          onSelect={() =>
            window.clickMenuItem(
              props.item.id || props.item.commandId.toString()
            )
          }
          class="flex items-center w-full py-1.5 px-3 hover:bg-white/10 focus:bg-white/20 select-none outline-none"
        >
          {props.item.checked ? (
            <RadioBoxMarked class="w-4 h-4 mr-2.5" />
          ) : (
            <RadioBoxBlank class="w-4 h-4 mr-2.5" />
          )}
          <span class="mr-8 text-left">
            {props.item.label.replace(/&/g, "")}
          </span>
          <Show when={props.item.accelerator}>
            <span class="ml-auto text-[#c3c3c3]">{props.item.accelerator}</span>
          </Show>
        </DropdownMenu.Item>
      </Match>
      <Match when={props.item.type === "separator"}>
        <DropdownMenu.Separator class="my-1.5 h-px border-t border-white/10" />
      </Match>
      <Match when={props.item.type === "submenu"}>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger class="flex items-center justify-between w-full py-1.5 px-4 hover:bg-white/10 focus:bg-white/20 select-none outline-none">
            <span class="mr-8">{props.item.label.replace(/&/g, "")}</span>
            <Show when={props.item.accelerator}>
              <span class="ml-auto text-[#c3c3c3]">
                {props.item.accelerator}
              </span>
            </Show>
            <ChevronRightIcon class="w-4 h-4" />
          </DropdownMenu.SubTrigger>
          <DropdownMenu.Portal>
            <DropdownMenu.SubContent
              data-custom-titlebar-menu
              class="z-[100] text-[13px] py-1 bg-[#202224] text-white outline-none"
            >
              <For each={props.item.submenu}>
                {(submenuItem) => <MenuItem item={submenuItem} />}
              </For>
            </DropdownMenu.SubContent>
          </DropdownMenu.Portal>
        </DropdownMenu.Sub>
      </Match>
    </Switch>
  );
};

const CustomTitlebar: Component<{
  menu: Resource<CloneableMenu>;
}> = (props) => {
  let menubarElement!: HTMLDivElement;

  const isAnyMenuOpen = () => {
    return !!menubarElement.querySelector("[data-expanded]");
  };

  const [maximized, setMaximized] = createSignal(false);
  const [blurred, setBlurred] = createSignal(false);

  window.windowActions.isMaximized().then(setMaximized).catch(console.error);
  window.windowActions.isBlurred().then(setBlurred).catch(console.error);

  window.windowActions.onBlurred(() => setBlurred(true));
  window.windowActions.onFocused(() => setBlurred(false));

  const toggleMaximize = async () => {
    if (maximized()) {
      await window.windowActions.restore();
    } else {
      await window.windowActions.maximize();
    }
    const isMaximized = await window.windowActions.isMaximized();
    setMaximized(isMaximized);
  };

  return (
    <div
      data-custom-titlebar
      classList={{
        "flex h-8 relative w-full bg-[#202224] text-white text-[13px] [-webkit-app-region:drag] select-none isolate z-[100] pointer-events-auto":
          true,
        "opacity-75": blurred(),
      }}
    >
      <div class="p-1.5 mx-0.5">
        <img src="./assets/icons/icon.png?url" class="w-full h-full" />
      </div>
      <Show when={props.menu()}>
        <div
          ref={menubarElement}
          data-custom-titlebar-menu
          class="flex select-none [-webkit-app-region:no-drag]"
        >
          <For each={props.menu()}>
            {(menuItem) =>
              menuItem.type === "submenu" ? (
                <DropdownMenu.Root preventScroll={false} modal={false}>
                  <DropdownMenu.Trigger
                    class="flex items-center px-2 h-full cursor-default hover:bg-white/10 focus:bg-white/20 outline-none ui-expanded:bg-white/20"
                    onMouseOver={(event) => {
                      if (!isAnyMenuOpen()) return;
                      const isCurrentMenuOpen =
                        event.currentTarget.getAttribute("aria-expanded") ===
                        "true";
                      if (isCurrentMenuOpen) return;
                      if (blurred()) return;
                      event.currentTarget.focus();
                      event.currentTarget.dispatchEvent(
                        new KeyboardEvent("keydown", {
                          key: "Enter",
                          bubbles: true,
                          cancelable: true,
                        })
                      );
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "ArrowLeft") {
                        const previousMenuItem =
                          event.currentTarget.previousElementSibling;
                        const lastMenuItem =
                          event.currentTarget.parentElement?.lastElementChild;
                        if (previousMenuItem instanceof HTMLElement) {
                          previousMenuItem.focus();
                        } else if (lastMenuItem instanceof HTMLElement) {
                          lastMenuItem.focus();
                        }
                      } else if (event.key === "ArrowRight") {
                        const nextMenuItem =
                          event.currentTarget.nextElementSibling;
                        const firstMenuItem =
                          event.currentTarget.parentElement?.firstElementChild;
                        if (nextMenuItem instanceof HTMLElement) {
                          nextMenuItem.focus();
                        } else if (firstMenuItem instanceof HTMLElement) {
                          firstMenuItem.focus();
                        }
                      }
                    }}
                  >
                    {menuItem.label.replace(/&/g, "")}
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      data-custom-titlebar-menu
                      class="z-[100] text-[13px] py-1 bg-[#202224] text-white outline-none"
                    >
                      <For each={menuItem.submenu}>
                        {(submenuItem) => <MenuItem item={submenuItem} />}
                      </For>
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              ) : (
                <button class="flex items-center px-2 h-full cursor-default hover:bg-white/10 focus:bg-white/20 outline-none ui-expanded:bg-white/20">
                  {menuItem.label.replace(/&/g, "")}
                </button>
              )
            }
          </For>
        </div>
      </Show>
      <div class="flex-grow flex items-center justify-center pl-4">Altus</div>
      <div class="grid grid-cols-[repeat(3,46px)] h-full [-webkit-app-region:no-drag] ml-auto">
        <button
          onClick={window.windowActions.minimize}
          class="flex items-center justify-center hover:bg-white/10 focus:bg-white/20 outline-none"
        >
          <MinimizeIcon class="h-4 w-4" />
        </button>
        <button
          onClick={toggleMaximize}
          class="flex items-center justify-center hover:bg-white/10 focus:bg-white/20 outline-none"
        >
          {maximized() ? (
            <RestoreIcon class="h-4 w-4" />
          ) : (
            <MaximizeIcon class="h-4 w-4" />
          )}
        </button>
        <button
          onClick={window.windowActions.close}
          class="flex items-center justify-center hover:bg-red-600/70 focus:bg-red-600 outline-none"
        >
          <CloseIcon class="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default CustomTitlebar;
