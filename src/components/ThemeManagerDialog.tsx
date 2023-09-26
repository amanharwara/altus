import { Dialog, RadioGroup, TextField } from "@kobalte/core";
import {
  Accessor,
  Component,
  Match,
  Setter,
  Show,
  Switch,
  createEffect,
  createSignal,
  useContext,
} from "solid-js";
import { I18NContext } from "../i18n/solid";
import CloseIcon from "../icons/CloseIcon";
import { removeTheme, themeStore } from "../stores/themes/solid";
import { EditIcon } from "../icons/EditIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Theme } from "../stores/themes/common";
import StyledSelect from "./StyledSelect";
import StyledTextField from "./StyledTextField";

const themePresets = {
  dark: { bg: "#1f232a", fg: "#eeeeee", ac: "#7289da" },
  darkMint: { bg: "#10151E", fg: "#eeeeee", ac: "#40C486" },
  purplish: { bg: "#15192E", fg: "#eeeeee", ac: "#125DBF" },
};
type ThemePreset = keyof typeof themePresets;

function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

const ThemeDialog: Component<{
  theme?: Theme;
  setIsOpen: Setter<boolean>;
}> = (props) => {
  const { t } = useContext(I18NContext);

  const [name, setName] = createSignal(props.theme?.name ?? "");
  const [type, setType] = createSignal<"simple" | "css">("simple");

  const [preset, setPreset] = createSignal<ThemePreset | undefined>(undefined);
  const [colors, setColors] = createSignal<Theme["colors"] | undefined>(
    props.theme?.colors ?? undefined
  );
  createEffect(() => {
    if (type() === "css") {
      setColors(undefined);
      setPreset(undefined);
    }

    const _preset = preset();
    if (_preset) {
      setColors(themePresets[_preset]);
    } else {
      setColors(themePresets.dark);
    }
  });

  const [css, setCss] = createSignal(props.theme?.css ?? "");

  return (
    <Dialog.Root open onOpenChange={props.setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay class="fixed inset-0 z-50 bg-black/30" />
        <div class="fixed inset-0 z-50 flex items-center justify-center">
          <Dialog.Content
            class="flex flex-col z-50 bg-zinc-800 text-white border rounded border-zinc-600 min-w-[27rem] px-3.5 pt-3 pb-2 max-w-[min(calc(100vw_-_1rem),27rem)] max-h-[70vh] overflow-hidden"
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
            <div class="flex items-center justify-between mb-1">
              <Dialog.Title class="font-semibold">
                {props.theme ? t("editTheme") : t("addTheme")}
              </Dialog.Title>
              <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
                <CloseIcon class="w-4 h-4" />
              </Dialog.CloseButton>
            </div>
            <Dialog.Description class="overflow-y-auto">
              <StyledTextField
                value={name()}
                onChange={setName}
                label={t("Name")}
              />
              <RadioGroup.Root
                class="flex flex-col gap-2 py-2"
                value={type()}
                onChange={setType}
              >
                <RadioGroup.Label class="text-[0.95rem] leading-none">
                  Type
                </RadioGroup.Label>
                <div class="flex divide-x divide-zinc-600 rounded border border-zinc-600 select-none">
                  <RadioGroup.Item
                    value="simple"
                    class="flex text-sm ui-checked:bg-zinc-700/50 [&:has(:focus-visible)]:outline [&:has(:focus-visible)]:outline-zinc-600 rounded-bl rounded-tl flex-grow"
                  >
                    <RadioGroup.ItemInput />
                    <RadioGroup.ItemLabel class="px-2.5 py-1.5 flex-grow text-center">
                      Choose colors
                    </RadioGroup.ItemLabel>
                  </RadioGroup.Item>
                  <RadioGroup.Item
                    value="css"
                    class="flex text-sm ui-checked:bg-zinc-700/50 [&:has(:focus-visible)]:outline [&:has(:focus-visible)]:outline-zinc-600 rounded-br rounded-tr flex-grow"
                  >
                    <RadioGroup.ItemInput />
                    <RadioGroup.ItemLabel class="px-2.5 py-1.5 flex-grow text-center">
                      Use CSS
                    </RadioGroup.ItemLabel>
                  </RadioGroup.Item>
                </div>
              </RadioGroup.Root>
              <Switch>
                <Match when={type() === "simple"}>
                  <StyledSelect
                    rootClass="flex-col py-2"
                    multiple={false}
                    options={Object.keys(themePresets)}
                    label={t("Preset")}
                    placeholder={t("Select a preset...")}
                    value={preset()}
                    onChange={setPreset()}
                    class="flex flex-col gap-1.5 py-2"
                    valueRender={(state) =>
                      capitalizeFirstLetter(state.selectedOption())
                    }
                    itemLabelRender={(item) =>
                      capitalizeFirstLetter(item.rawValue)
                    }
                  />
                  <Show when={colors()}>
                    {(colors) => (
                      <>
                        <StyledTextField
                          value={colors().bg}
                          onChange={(value) =>
                            setColors({ ...colors(), bg: value })
                          }
                          label="Background color"
                        />
                        <StyledTextField
                          value={colors().fg}
                          onChange={(value) =>
                            setColors({ ...colors(), fg: value })
                          }
                          label="Foreground color"
                        />
                        <StyledTextField
                          value={colors().ac}
                          onChange={(value) =>
                            setColors({ ...colors(), ac: value })
                          }
                          label="Accent color"
                        />
                      </>
                    )}
                  </Show>
                </Match>
                <Match when={type() === "css"}>
                  <textarea />
                </Match>
              </Switch>
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

const ThemeManagerDialog: Component<{
  isOpen: Accessor<boolean>;
  setIsOpen: (value: boolean) => void;
}> = (props) => {
  const { t } = useContext(I18NContext);
  const [isThemeDialogOpen, setIsThemeDialogOpen] = createSignal(false);
  const [editingTheme, setEditingTheme] = createSignal<Theme | undefined>(
    undefined
  );

  return (
    <>
      <Dialog.Root open={props.isOpen()} onOpenChange={props.setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay class="fixed inset-0 z-50 bg-black/30" />
          <div class="fixed inset-0 z-50 flex items-center justify-center">
            <Dialog.Content
              class="flex flex-col z-50 bg-zinc-800 text-white border rounded border-zinc-600 min-w-[25rem] px-3.5 pt-3 pb-2 max-w-[min(calc(100vw_-_1rem),25rem)] max-h-[70vh] overflow-hidden"
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
              <div class="flex items-center justify-between mb-2">
                <Dialog.Title class="font-semibold">
                  {t("Theme Manager")}
                </Dialog.Title>
                <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
                  <CloseIcon class="w-4 h-4" />
                </Dialog.CloseButton>
              </div>
              <Dialog.Description class="flex flex-col overflow-hidden">
                <div class="overflow-y-auto min-h-0 flex-grow divide-y divide-zinc-700/50">
                  {themeStore.themes.map((theme) => (
                    <div class="flex items-center py-2 gap-2.5">
                      <div class="mr-auto text-sm">{theme.name}</div>
                      {theme.id !== "default" && theme.id !== "dark" && (
                        <>
                          <button
                            class="flex items-center justify-center w-6 h-6 border border-zinc-700 bg-zinc-700/50 hover:bg-zinc-800/50 rounded focus:bg-zinc-800/50 focus:border-zinc-600 outline-none"
                            onClick={() => {
                              setEditingTheme(theme);
                              setIsThemeDialogOpen(true);
                            }}
                          >
                            <div class="sr-only">{t("editTheme")}</div>
                            <EditIcon class="w-3 h-3" />
                          </button>
                          <button
                            class="flex items-center justify-center w-6 h-6 border border-zinc-700 bg-zinc-700/50 hover:bg-zinc-800/50 rounded focus:bg-zinc-800/50 focus:border-zinc-600 outline-none"
                            onClick={() => {
                              if (confirm(t("deleteThemeConfirm"))) {
                                removeTheme(theme);
                              }
                            }}
                          >
                            <div class="sr-only">{t("deleteTheme")}</div>
                            <DeleteIcon class="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  ))}
                </div>
                <div class="flex items-center gap-3 flex-shrink-0">
                  <button
                    class="px-3 py-1.5 my-2 text-sm border border-zinc-700 bg-zinc-700/50 hover:bg-zinc-800/50 rounded focus:bg-zinc-800/50 focus:border-zinc-600 outline-none"
                    onClick={() => {
                      setEditingTheme(undefined);
                      setIsThemeDialogOpen(true);
                    }}
                  >
                    Add theme
                  </button>
                  {themeStore.themes.some((theme) => !!theme.colors) && (
                    <button class="px-3 py-1.5 my-2 text-sm border border-zinc-700 bg-zinc-700/50 hover:bg-zinc-800/50 rounded focus:bg-zinc-800/50 focus:border-zinc-600 outline-none">
                      Update themes
                    </button>
                  )}
                </div>
              </Dialog.Description>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
      <Show when={isThemeDialogOpen()}>
        <ThemeDialog theme={editingTheme()} setIsOpen={setIsThemeDialogOpen} />
      </Show>
    </>
  );
};

export default ThemeManagerDialog;
