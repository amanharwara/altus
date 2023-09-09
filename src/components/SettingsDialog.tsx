import { Dialog } from "@kobalte/core";
import { Accessor, Component, Setter } from "solid-js";
import CloseIcon from "../icons/CloseIcon";
import { getSettingValue, setSettingValue } from "../stores/settings/solid";
import { StyledSwitch } from "./StyledSwitch";

const SettingsDialog: Component<{
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
}> = (props) => {
  return (
    <Dialog.Root open={props.isOpen()} onOpenChange={props.setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/30" />
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <Dialog.Content class="z-50 bg-zinc-800 text-white border rounded border-zinc-600 min-w-[22.5rem] px-3.5 pt-3 pb-2 max-w-[min(calc(100vw_-_1rem),32rem)]">
            <div class="flex items-center justify-between mb-3">
              <Dialog.Title class="font-semibold">Settings</Dialog.Title>
              <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
                <CloseIcon class="w-4 h-4" />
              </Dialog.CloseButton>
            </div>
            <Dialog.Description>
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
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingsDialog;
