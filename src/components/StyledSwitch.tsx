import { Switch } from "@kobalte/core";
import { Component, JSX } from "solid-js";
import CheckIcon from "../icons/CheckIcon";
import { twMerge } from "tailwind-merge";

export const StyledSwitch: Component<{
  checked?: boolean;
  onChange: (checked: boolean) => void;
  defaultChecked?: boolean;
  disabled?: boolean;
  class?: string;
  children: JSX.Element;
}> = (props) => {
  return (
    <Switch.Root
      checked={props.checked}
      onChange={props.onChange}
      class={twMerge("flex items-center justify-between gap-1.5", props.class)}
      disabled={props.disabled}
      defaultChecked={props.defaultChecked}
    >
      <Switch.Label class="text-[0.95rem] leading-none">
        {props.children}
      </Switch.Label>
      <Switch.Input class="peer" />
      <Switch.Control class="inline-flex items-center h-6 w-10 px-px bg-zinc-700/50 rounded-xl border border-zinc-600 peer-focus:border-zinc-300 ui-checked:bg-zinc-900 transition-colors duration-75">
        <Switch.Thumb class="h-5 w-5 flex items-center justify-center rounded-full bg-white group ui-checked:translate-x-[calc(100%_-_0.275rem)]  transition-all duration-75">
          <CheckIcon class="w-3.5 h-3.5 opacity-0 group-data-[checked]:opacity-100 transition-opacity duration-75 text-black" />
        </Switch.Thumb>
      </Switch.Control>
    </Switch.Root>
  );
};
