import { TextField } from "@kobalte/core";
import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

const StyledTextField: Component<
  TextField.TextFieldRootProps & {
    label: string;
  }
> = (props) => {
  return (
    <TextField.Root
      {...props}
      class={twMerge("flex flex-col gap-1.5 py-2", props.class)}
    >
      <TextField.Label class="text-[0.95rem] leading-none">
        {props.label}
      </TextField.Label>
      <TextField.Input
        class="text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300 "
        spellcheck={false}
      />
    </TextField.Root>
  );
};

export default StyledTextField;
