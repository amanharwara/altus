import { Dialog, TextField } from "@kobalte/core";
import {
  Accessor,
  Component,
  Setter,
  createMemo,
  createSignal,
  useContext,
} from "solid-js";
import { Tab } from "../stores/tabs/common";
import CloseIcon from "../icons/CloseIcon";
import { themeStore } from "../stores/themes/solid";
import { updateAndSyncTabStore } from "../stores/tabs/solid";
import { StyledSwitch } from "./StyledSwitch";
import StyledSelect from "./StyledSelect";
import { I18NContext } from "../i18n/solid";

const TabEditDialog: Component<{
  tabToEdit: Accessor<Tab>;
  setTabToEdit: Setter<Tab | null>;
}> = (props) => {
  const { t } = useContext(I18NContext);

  const availableThemes = createMemo(() => {
    return themeStore.themes;
  });

  const theme = createMemo(() =>
    availableThemes().find(
      (theme) => theme.id === props.tabToEdit().config.theme
    )
  );

  const [hasColor, setHasColor] = createSignal(
    !!props.tabToEdit().config.color
  );
  const [color, setColor] = createSignal(props.tabToEdit().config.color);

  return (
    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 z-50 bg-black/30" />
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <Dialog.Content
          class="z-50 bg-zinc-800 text-white border rounded border-zinc-600 min-w-[20rem] px-3.5 pt-3 pb-2 max-w-[min(calc(100vw_-_1rem),32rem)]"
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
          <div class="flex items-center justify-between">
            <Dialog.Title class="font-semibold">{t("Edit tab")}</Dialog.Title>
            <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
              <CloseIcon class="w-4 h-4" />
            </Dialog.CloseButton>
          </div>
          <Dialog.Description class="pt-0.5">
            <TextField.Root
              class="flex flex-col gap-1.5 py-2"
              defaultValue={props.tabToEdit().name}
            >
              <TextField.Label class="text-[0.95rem] leading-none">
                {t("Name")}
              </TextField.Label>
              <TextField.Input
                class="text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300 "
                spellcheck={false}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  updateAndSyncTabStore(
                    "tabs",
                    (t) => t.id === props.tabToEdit().id,
                    "name",
                    value
                  );
                }}
              />
            </TextField.Root>
            <StyledSelect
              rootClass="flex-col py-2"
              multiple={false}
              options={availableThemes()}
              optionValue="id"
              optionTextValue="name"
              label={t("Theme")}
              placeholder={t("selectTheme")}
              value={theme()}
              onChange={(theme) => {
                updateAndSyncTabStore(
                  "tabs",
                  (t) => t.id === props.tabToEdit().id,
                  "config",
                  "theme",
                  theme.id
                );
              }}
              class="flex flex-col gap-1.5 py-2"
              valueRender={(state) => state.selectedOption().name}
              itemLabelRender={(item) => item.rawValue.name}
            />
            <div class="py-2">
              <StyledSwitch
                checked={props.tabToEdit().config.notifications}
                onChange={(value) => {
                  updateAndSyncTabStore(
                    "tabs",
                    (t) => t.id === props.tabToEdit().id,
                    "config",
                    "notifications",
                    value
                  );
                }}
              >
                {t("Notifications")}
              </StyledSwitch>
            </div>
            <div class="py-2">
              <StyledSwitch
                checked={props.tabToEdit().config.media}
                onChange={(value) => {
                  updateAndSyncTabStore(
                    "tabs",
                    (t) => t.id === props.tabToEdit().id,
                    "config",
                    "media",
                    value
                  );
                }}
              >
                {t("Microphone and Camera")}
              </StyledSwitch>
            </div>
            <div class="py-2">
              <StyledSwitch
                checked={props.tabToEdit().config.sound}
                onChange={(value) => {
                  updateAndSyncTabStore(
                    "tabs",
                    (t) => t.id === props.tabToEdit().id,
                    "config",
                    "sound",
                    value
                  );
                }}
              >
                {t("Sound")}
              </StyledSwitch>
            </div>
            <div class="py-2">
              <StyledSwitch
                checked={props.tabToEdit().config.spellChecker}
                onChange={(value) => {
                  updateAndSyncTabStore(
                    "tabs",
                    (t) => t.id === props.tabToEdit().id,
                    "config",
                    "spellChecker",
                    value
                  );
                }}
              >
                {t("Spellcheck")}
              </StyledSwitch>
            </div>
            <div class="py-2">
              <StyledSwitch
                checked={hasColor()}
                onChange={(hasColor) => {
                  setHasColor(hasColor);
                  if (hasColor) {
                    updateAndSyncTabStore(
                      "tabs",
                      (t) => t.id === props.tabToEdit().id,
                      "config",
                      "color",
                      color() ? color() : null
                    );
                  } else {
                    setColor(props.tabToEdit().config.color);
                    updateAndSyncTabStore(
                      "tabs",
                      (t) => t.id === props.tabToEdit().id,
                      "config",
                      "color",
                      null
                    );
                  }
                }}
              >
                {t("Use custom tab color")}
              </StyledSwitch>
              {hasColor() && (
                <TextField.Root
                  class="flex flex-col gap-1.5 mt-2"
                  defaultValue={color() || ""}
                >
                  <TextField.Label class="text-[0.95rem] leading-none sr-only">
                    {t("Color")}
                  </TextField.Label>
                  <TextField.Input
                    class="text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300 "
                    spellcheck={false}
                    onChange={(event) => {
                      const value = event.currentTarget.value;
                      setColor(value);
                      updateAndSyncTabStore(
                        "tabs",
                        (t) => t.id === props.tabToEdit().id,
                        "config",
                        "color",
                        value
                      );
                    }}
                  />
                </TextField.Root>
              )}
            </div>
          </Dialog.Description>
        </Dialog.Content>
      </div>
    </Dialog.Portal>
  );
};

export default TabEditDialog;
