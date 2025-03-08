// eslint-disable-next-line import/no-unresolved
import { Tooltip } from "@kobalte/core/tooltip";
import { Show, useContext } from "solid-js";
import { I18NContext } from "../i18n/solid";
import { ColorPickerIcon } from "../icons/ColorPickerIcon";

export function ColorPickerButton(props: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { t } = useContext(I18NContext);
  let input: HTMLInputElement | undefined;

  return (
    <Tooltip openDelay={100} gutter={5}>
      <Tooltip.Trigger
        as="label"
        class="relative w-8 h-8 rounded outline-none border border-zinc-600 p-4 focus:border-zinc-300"
        style={{
          "background-color": props.value,
        }}
        onClick={() => {
          input?.click();
        }}
      >
        <span class="sr-only">{t("Pick color")}</span>
        <Show when={!props.value}>
          <ColorPickerIcon class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5" />
        </Show>
        <input
          ref={input}
          class="pointer-events-none absolute top-0 left-0 h-full w-full opacity-0"
          type="color"
          value={props.value}
          onChange={(event) => {
            const value = event.target.value;
            props.onChange(value);
          }}
        />
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content class="z-50 px-2 py-1.5 text-sm bg-zinc-700 text-zinc-100 rounded outline-none border border-transparent">
          <div>{t("Pick color")}</div>
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip>
  );
}
