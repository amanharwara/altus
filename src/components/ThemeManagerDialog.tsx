import { Dialog } from "@kobalte/core";
import { Accessor, Component, createSignal, useContext } from "solid-js";
import { I18NContext } from "../i18n/solid";
import CloseIcon from "../icons/CloseIcon";
import { themeStore } from "../stores/themes/solid";
import { EditIcon } from "../icons/EditIcon";
import { DeleteIcon } from "../icons/DeleteIcon";
import { Theme } from "../stores/themes/common";

const ListThemeItem: Component<{
  theme: Theme;
}> = (props) => {
  const { t } = useContext(I18NContext);
  const [isEditing, setIsEditing] = createSignal(false);

  return (
    <>
      <div class="flex items-center py-2 gap-2.5">
        <div class="mr-auto text-sm">{props.theme.name}</div>
        {(!!props.theme.colors || !!props.theme.customCSS) && (
          <>
            <button
              class="flex items-center justify-center w-6 h-6 border border-zinc-700 bg-zinc-700/50 hover:bg-zinc-800/50 rounded focus:bg-zinc-800/50 focus:border-zinc-600 outline-none"
              onClick={() => {
                setIsEditing(true);
              }}
            >
              <div class="sr-only">{t("editTheme")}</div>
              <EditIcon class="w-3 h-3" />
            </button>
            <button
              class="flex items-center justify-center w-6 h-6 border border-zinc-700 bg-zinc-700/50 hover:bg-zinc-800/50 rounded focus:bg-zinc-800/50 focus:border-zinc-600 outline-none"
              onClick={() => {}}
            >
              <div class="sr-only">Delete theme</div>
              <DeleteIcon class="w-3 h-3" />
            </button>
          </>
        )}
      </div>
      <Dialog.Root open={isEditing()} onOpenChange={setIsEditing}>
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
              <div class="flex items-center justify-between mb-1">
                <Dialog.Title class="font-semibold">
                  {t("editTheme")}
                </Dialog.Title>
                <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
                  <CloseIcon class="w-4 h-4" />
                </Dialog.CloseButton>
              </div>
              <Dialog.Description class="overflow-y-auto"></Dialog.Description>
            </Dialog.Content>
          </div>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

const ThemeManagerDialog: Component<{
  isOpen: Accessor<boolean>;
  setIsOpen: (value: boolean) => void;
}> = (props) => {
  const { t } = useContext(I18NContext);

  return (
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
            <div class="flex items-center justify-between mb-1">
              <Dialog.Title class="font-semibold">
                {t("Theme Manager")}
              </Dialog.Title>
              <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
                <CloseIcon class="w-4 h-4" />
              </Dialog.CloseButton>
            </div>
            <Dialog.Description class="overflow-y-auto">
              <div class="divide-y divide-zinc-700/50">
                {themeStore.themes.map((theme) => (
                  <ListThemeItem theme={theme} />
                ))}
              </div>
              {themeStore.themes.some((theme) => !!theme.colors) && (
                <button class="px-3 py-1.5 my-2 text-sm border border-zinc-700 bg-zinc-700/50 hover:bg-zinc-800/50 rounded focus:bg-zinc-800/50 focus:border-zinc-600 outline-none">
                  Update themes
                </button>
              )}
            </Dialog.Description>
          </Dialog.Content>
        </div>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default ThemeManagerDialog;
