import { Dialog, TextField } from "@kobalte/core";
import { Accessor, Component, Setter, useContext } from "solid-js";
import CloseIcon from "../icons/CloseIcon";
import { getSettingValue, setSettingValue } from "../stores/settings/solid";
import { StyledSwitch } from "./StyledSwitch";
import StyledSelect from "./StyledSelect";
import { I18NContext } from "../i18n/solid";

const SettingsDialog: Component<{
  isOpen: Accessor<boolean>;
  setIsOpen: Setter<boolean>;
}> = (props) => {
  const { t } = useContext(I18NContext);

  return (
    <Dialog.Root open={props.isOpen()} onOpenChange={props.setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/30" />
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <Dialog.Content
            class="flex flex-col z-50 bg-zinc-800 text-white border rounded border-zinc-600 min-w-[30rem] px-3.5 pt-3 pb-2 max-w-[min(calc(100vw_-_1rem),32rem)] max-h-[70vh] overflow-hidden"
            onPointerDownOutside={(event) => {
              if (
                (event.target as HTMLElement).closest(
                  "[data-custom-titlebar],[data-custom-titlebar-menu]"
                )
              ) {
                event.preventDefault();
              }
            }}
          >
            <div class="flex items-center justify-between mb-3">
              <Dialog.Title class="font-semibold">{t("Settings")}</Dialog.Title>
              <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
                <CloseIcon class="w-4 h-4" />
              </Dialog.CloseButton>
            </div>
            <Dialog.Description class="overflow-y-auto">
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("trayIcon")}
                  onChange={(checked) => setSettingValue("trayIcon", checked)}
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("trayIcon")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("trayIconDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("tabBar")}
                  onChange={(checked) => setSettingValue("tabBar", checked)}
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("showTabBar")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("showTabBarDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("exitPrompt")}
                  onChange={(checked) => setSettingValue("exitPrompt", checked)}
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("exitPrompt")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("exitPromptDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("closeToTray")}
                  onChange={(checked) =>
                    setSettingValue("closeToTray", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("closeToTray")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("closeToTrayDescription")}
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
                      <div class="font-semibold">{t("tabBarPosition")}</div>
                      <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                        {t("tabBarPositionDescription")}
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
                    <div class="font-semibold">{t("promptWhenClosingTab")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("promptWhenClosingTabDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("autoLaunch")}
                  onChange={(checked) => setSettingValue("autoLaunch", checked)}
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("autoLaunch")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("autoLaunchDescription")}
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
                    <div class="font-semibold">{t("launchMinimized")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("launchMinimizedDescription")}
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
                    <div class="font-semibold">{t("rememberWindowSize")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("rememberWindowSizeDescription")}
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
                    <div class="font-semibold">
                      {t("rememberWindowPosition")}
                    </div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("rememberWindowPositionDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("preventEnter")}
                  onChange={(checked) =>
                    setSettingValue("preventEnter", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("preventEnter")}</div>
                    <div class="text-zinc-300 max-w-[30ch] leading-snug text-sm">
                      {t("preventEnterDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  defaultChecked={getSettingValue("customTitlebar")}
                  onChange={(checked) =>
                    window.electronSettingsStore.setSetting(
                      "customTitlebar",
                      checked
                    )
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("customTitlebar")}</div>
                    <div class="text-zinc-300 max-w-[40ch] leading-snug text-sm">
                      {t("customTitlebarDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("autoHideMenuBar")}
                  onChange={(checked) =>
                    setSettingValue("autoHideMenuBar", checked)
                  }
                  class="items-start"
                  disabled={!!getSettingValue("customTitlebar")}
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("autoHideMenuBar")}</div>
                    <div class="text-zinc-300 max-w-[40ch] leading-snug text-sm">
                      {t("autoHideMenuBarDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <StyledSwitch
                  checked={getSettingValue("showSaveDialog")}
                  onChange={(checked) =>
                    setSettingValue("showSaveDialog", checked)
                  }
                  class="items-start"
                >
                  <div class="flex flex-col gap-1.5">
                    <div class="font-semibold">{t("showSaveDialog")}</div>
                    <div class="text-zinc-300 max-w-[40ch] leading-snug text-sm">
                      {t("showSaveDialogDescription")}
                    </div>
                  </div>
                </StyledSwitch>
              </div>
              <div class="py-2.5">
                <TextField.Root
                  class="flex gap-4 items-start"
                  value={getSettingValue("defaultDownloadDir")}
                  onChange={(value) =>
                    setSettingValue("defaultDownloadDir", value)
                  }
                >
                  <TextField.Label class="text-[0.95rem] leading-none">
                    <div class="flex flex-col gap-1.5">
                      <div class="font-semibold">{t("defaultDownloadDir")}</div>
                      <div class="text-zinc-300 max-w-[40ch] leading-snug text-sm">
                        {t("defaultDownloadDirDescription")}
                      </div>
                    </div>
                  </TextField.Label>
                  <TextField.Input
                    class="text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300 "
                    spellcheck={false}
                  />
                </TextField.Root>
              </div>
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingsDialog;
