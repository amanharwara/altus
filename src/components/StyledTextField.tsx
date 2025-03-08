import {
  Input,
  Label,
  Root,
  TextFieldRootProps,
  // eslint-disable-next-line import/no-unresolved
} from "@kobalte/core/text-field";
import { Component } from "solid-js";
import { twMerge } from "tailwind-merge";

const StyledTextField: Component<
  TextFieldRootProps & {
    label: string;
    class?: string;
  }
> = (props) => {
  return (
    <Root {...props} class={twMerge("flex flex-col gap-1.5 py-2", props.class)}>
      <Label class="text-[0.95rem] leading-none">{props.label}</Label>
      <Input
        class="text-sm py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300 "
        spellcheck={false}
      />
    </Root>
  );
};

export default StyledTextField;
