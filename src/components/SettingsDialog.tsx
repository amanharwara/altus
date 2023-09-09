import { Dialog } from "@kobalte/core";
import {
  Accessor,
  Component,
  Setter,
  createEffect,
  createSignal,
} from "solid-js";
import CloseIcon from "../icons/CloseIcon";
import { getSettingValue, setSettingValue } from "../stores/settings/solid";
import { StyledSwitch } from "./StyledSwitch";
import StyledSelect from "./StyledSelect";
import { createResizeObserver } from "@solid-primitives/resize-observer";

function addRightPaddingIfOverflowing(element: Element | undefined) {
  setTimeout(() => {
    if (!element) return;
    const hasOverflow = element.scrollHeight > element.clientHeight;
    if (hasOverflow) {
      element.classList.add("pr-3");
    } else {
      element.classList.remove("pr-3");
    }
  });
}

const SettingsDialog: Component<{
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
}> = (props) => {
  const [settingsListElement, setSettingsListElement] =
    createSignal<HTMLDivElement>();

  createEffect(() => {
    createResizeObserver(settingsListElement(), (_, element) => {
      addRightPaddingIfOverflowing(element);
    });
  });

  return (
    <Dialog.Root open={props.isOpen()} onOpenChange={props.setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/30" />
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <Dialog.Content class="flex flex-col z-50 bg-zinc-800 text-white border rounded border-zinc-600 min-w-[30rem] px-3.5 pt-3 pb-2 max-w-[min(calc(100vw_-_1rem),32rem)] max-h-[70vh] overflow-hidden">
            <div class="flex items-center justify-between mb-3">
              <Dialog.Title class="font-semibold">Settings</Dialog.Title>
              <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
                <CloseIcon class="w-4 h-4" />
              </Dialog.CloseButton>
            </div>
            <Dialog.Description
              class="overflow-y-auto"
              ref={(element) => {
                setSettingsListElement(element);
                addRightPaddingIfOverflowing(element);
              }}
            >
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("tabBar")}
                  onChange={(checked) => setSettingValue("tabBar", checked)}
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">Show Tab Bar</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      Controls whether the tab bar is visible or not
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSelect
                  rootClass="items-start justify-between"
                  triggerClass="min-w-[15ch]"
                  multiple={false}
                  label={
                    <div class="flex flex-col gap-1.5">
                      <div class="font-semibold">Tab Bar Position</div>
                      <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                        Controls the position of the tab bar
                      </div>
                    </div>
                  }
                  options={["top", "bottom"]}
                  value={getSettingValue("tabBarPosition")}
                  onChange={(position) => {
                    setSettingValue(
                      "tabBarPosition",
                      position as "top" | "bottom"
                    );
                  }}
                  class="flex flex-col gap-1.5 py-2"
                  valueRender={(state) => state.selectedOption()}
                  itemLabelRender={(item) => item.rawValue}
                />
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("tabClosePrompt")}
                  onChange={(checked) =>
                    setSettingValue("tabClosePrompt", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">Prompt when closing tab</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      When enabled, you will be prompted when you close a tab
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("launchMinimized")}
                  onChange={(checked) =>
                    setSettingValue("launchMinimized", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">Start minimized</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      When enabled, Altus will start minimized
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("rememberWindowSize")}
                  onChange={(checked) =>
                    setSettingValue("rememberWindowSize", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">Remember window size</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      When enabled, Altus will remember the size of the window
                      from previous use
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("rememberWindowPosition")}
                  onChange={(checked) =>
                    setSettingValue("rememberWindowPosition", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">Remember window position</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      When enabled, Altus will remember the position of the
                      window from previous use
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("customTitlebar")}
                  onChange={(checked) =>
                    setSettingValue("customTitlebar", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">Use custom titlebar</div>
                    <div class="text-zinc-300 max-w-[40ch] leading-snug text-sm">
                      When enabled, Altus will use a custom titlebar instead of
                      the one provided by the system. (NOTE: Requires a restart
                      for changes to apply.)
                    </div>
                  </div>
                </StyledSwitch>
              </div>
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingsDialog;
