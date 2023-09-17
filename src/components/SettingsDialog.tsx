import { Dialog } from "@kobalte/core";
import {
  Accessor,
  Component,
  Setter,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import CloseIcon from "../icons/CloseIcon";
import { getSettingValue, setSettingValue } from "../stores/settings/solid";
import { StyledSwitch } from "./StyledSwitch";
import StyledSelect from "./StyledSelect";
import { createResizeObserver } from "@solid-primitives/resize-observer";
import { I18NContext } from "../i18n/solid";

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
  const { t } = useContext(I18NContext);

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
            <Dialog.Description
              class="overflow-y-auto"
              ref={(element) => {
                setSettingsListElement(element);
                addRightPaddingIfOverflowing(element);
              }}
            >
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
                  checked={getSettingValue("customTitlebar")}
                  onChange={(checked) =>
                    setSettingValue("customTitlebar", checked)
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
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default SettingsDialog;
