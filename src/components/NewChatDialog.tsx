import { Dialog, TextField } from "@kobalte/core";
import CloseIcon from "../icons/CloseIcon";
import { createSignal, useContext } from "solid-js";
import { getActiveWebviewElement } from "../stores/tabs/solid";
import { I18NContext } from "../i18n/solid";

const NewChatDialog = (props: { close: () => void }) => {
  const { t } = useContext(I18NContext);
  const [phoneNumber, setPhoneNumber] = createSignal("");

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
            <Dialog.Title class="font-semibold">
              {t("Start &New Chat").replace("&", "")}
            </Dialog.Title>
            <Dialog.CloseButton class="p-1 bg-zinc-700/50 hover:bg-zinc-600 rounded outline-none border border-transparent focus:border-zinc-300">
              <CloseIcon class="w-4 h-4" />
            </Dialog.CloseButton>
          </div>
          <Dialog.Description class="pt-0.5 pb-2">
            <form
              onSubmit={() => {
                const activeWebview = getActiveWebviewElement();
                if (!activeWebview) return;
                const number = phoneNumber();
                if (!number) return;
                activeWebview.src = `https://web.whatsapp.com/send/?phone=${number}`;
                props.close();
              }}
            >
              <TextField.Root
                class="flex flex-col gap-1.5 py-2"
                value={phoneNumber()}
                onChange={setPhoneNumber}
              >
                <TextField.Label class="text-[0.95rem] leading-none">
                  {t("Phone number")}:
                </TextField.Label>
                <TextField.Input
                  class="text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300"
                  spellcheck={false}
                  ref={(element) => {
                    setTimeout(() => {
                      element.focus();
                    }, 5);
                  }}
                />
              </TextField.Root>
              <button
                type="submit"
                class="mt-1 text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300 select-none hover:bg-zinc-700 focus:bg-zinc-700 active:bg-zinc-700/75"
              >
                {t("Start chat")}
              </button>
            </form>
          </Dialog.Description>
        </Dialog.Content>
      </div>
    </Dialog.Portal>
  );
};

export default NewChatDialog;
