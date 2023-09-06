import { Dialog, Select, Switch, TextField } from "@kobalte/core";
import { Accessor, Component, Setter, createMemo } from "solid-js";
import { Tab } from "../stores/tabs/common";
import CloseIcon from "../icons/CloseIcon";
import { themeStore } from "../stores/themes/solid";
import { Theme } from "../stores/themes/common";
import CaretSortIcon from "../icons/CaretSortIcon";
import CheckIcon from "../icons/CheckIcon";
import { updateTabStore } from "../stores/tabs/solid";

const StyledSwitch: Component<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}> = (props) => {
  return (
    <Switch.Root
      checked={props.checked}
      onChange={props.onChange}
      class="flex items-center justify-between gap-1.5 py-2"
    >
      <Switch.Label class="text-[0.95rem] leading-none">
        {props.label}
      </Switch.Label>
      <Switch.Input class="peer" />
      <Switch.Control class="inline-flex items-center h-6 w-11 px-px bg-zinc-700/50 rounded-xl border border-zinc-600 peer-focus:border-zinc-300 ui-checked:bg-zinc-300 transition-colors duration-75">
        <Switch.Thumb class="h-5 w-5 rounded-full bg-white ui-checked:translate-x-[calc(100%_-_1px)] ui-checked:bg-zinc-800 transition-all duration-75" />
      </Switch.Control>
    </Switch.Root>
  );
};

const TabEditDialog: Component<{
  tabToEdit: Accessor<Tab>;
  setTabToEdit: Setter<Tab | null>;
}> = (props) => {
  const availableThemes = createMemo(() => {
    return themeStore.themes;
  });

  const theme = createMemo(() =>
    availableThemes().find(
      (theme) => theme.id === props.tabToEdit().config.theme
    )
  );

  return (
    <Dialog.Portal>
      <Dialog.Overlay class="fixed inset-0 z-50 bg-black/30" />
      <div class="fixed inset-0 z-50 flex items-center justify-center">
        <Dialog.Content class="z-50 bg-zinc-800 text-white border rounded border-zinc-600 min-w-[15rem] px-3.5 pt-3 pb-2 max-w-[min(calc(100vw_-_1rem),32rem)]">
          <div class="flex items-center justify-between">
            <Dialog.Title class="font-semibold">Edit tab</Dialog.Title>
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
                Name
              </TextField.Label>
              <TextField.Input
                class="text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300 "
                spellcheck={false}
                onChange={(event) => {
                  const value = event.currentTarget.value;
                  updateTabStore(
                    "tabs",
                    (t) => t.id === props.tabToEdit().id,
                    "name",
                    value
                  );
                }}
              />
            </TextField.Root>
            <Select.Root
              options={availableThemes()}
              optionValue="id"
              optionTextValue="name"
              placeholder="Select a theme..."
              value={theme()}
              onChange={(theme) => {
                updateTabStore(
                  "tabs",
                  (t) => t.id === props.tabToEdit().id,
                  "config",
                  "theme",
                  theme.id
                );
              }}
              class="flex flex-col gap-1.5 py-2"
              itemComponent={(props) => (
                <Select.Item
                  item={props.item}
                  class="flex items-center justify-between outline-none border border-transparent focus:border-zinc-500 focus:bg-zinc-800/50 rounded py-1 px-2 ui-selected:bg-zinc-800"
                >
                  <Select.ItemLabel>
                    {props.item.rawValue.name}
                  </Select.ItemLabel>
                  <Select.ItemIndicator>
                    <CheckIcon class="w-4 h-4" />
                  </Select.ItemIndicator>
                </Select.Item>
              )}
            >
              <Select.Label class=" text-[0.95rem] leading-none">
                Theme
              </Select.Label>
              <Select.Trigger
                class="flex items-center justify-between text-sm text-left py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300"
                aria-label="Theme"
              >
                <Select.Value<Theme>>
                  {(state) => state.selectedOption().name}
                </Select.Value>
                <Select.Icon>
                  <CaretSortIcon class="w-4 h-4" />
                </Select.Icon>
              </Select.Trigger>
              <Select.Portal>
                <Select.Content class="z-50 text-sm text-left py-1 px-1 bg-zinc-700 border rounded border-zinc-600 text-white">
                  <Select.Listbox class="space-y-1" />
                </Select.Content>
              </Select.Portal>
            </Select.Root>
            <StyledSwitch
              label="Notifications"
              checked={props.tabToEdit().config.notifications}
              onChange={(value) => {
                updateTabStore(
                  "tabs",
                  (t) => t.id === props.tabToEdit().id,
                  "config",
                  "notifications",
                  value
                );
              }}
            />
            <StyledSwitch
              label="Sound"
              checked={props.tabToEdit().config.sound}
              onChange={(value) => {
                updateTabStore(
                  "tabs",
                  (t) => t.id === props.tabToEdit().id,
                  "config",
                  "sound",
                  value
                );
              }}
            />
            <StyledSwitch
              label="Spellcheck"
              checked={props.tabToEdit().config.spellChecker}
              onChange={(value) => {
                updateTabStore(
                  "tabs",
                  (t) => t.id === props.tabToEdit().id,
                  "config",
                  "spellChecker",
                  value
                );
              }}
            />
          </Dialog.Description>
        </Dialog.Content>
      </div>
    </Dialog.Portal>
  );
};

export default TabEditDialog;
