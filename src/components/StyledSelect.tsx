import { Select } from "@kobalte/core";
import { JSX } from "solid-js";
import CheckIcon from "../icons/CheckIcon";
import CaretSortIcon from "../icons/CaretSortIcon";
import { twMerge } from "tailwind-merge";

type Props<Option> = Select.SelectRootProps<Option> & {
  label: JSX.Element;
  valueRender: Select.SelectValueProps<Option>["children"];
  itemLabelRender: (
    item: Select.SelectRootItemComponentProps<Option>["item"]
  ) => JSX.Element;
  rootClass?: string;
  triggerClass?: string;
};

function StyledSelect<Option>(props: Props<Option>) {
  return (
    <Select.Root
      {...props}
      class={twMerge("flex gap-1.5", props.rootClass)}
      itemComponent={(itemProps) => (
        <Select.Item
          item={itemProps.item}
          class="flex items-center justify-between outline-none border border-transparent focus:border-zinc-500 focus:bg-zinc-800/50 rounded py-1.5 px-2 ui-selected:bg-zinc-800"
        >
          <Select.ItemLabel>
            {props.itemLabelRender(itemProps.item)}
          </Select.ItemLabel>
          <Select.ItemIndicator>
            <CheckIcon class="w-4 h-4" />
          </Select.ItemIndicator>
        </Select.Item>
      )}
    >
      <Select.Label class="text-[0.95rem] leading-none">
        {props.label}
      </Select.Label>
      <Select.Trigger
        class={twMerge(
          "flex items-center justify-between text-sm text-left py-1.5 px-2.5 bg-zinc-700/50 border rounded border-zinc-600 outline-none focus:border-zinc-300",
          props.triggerClass
        )}
        aria-label="Theme"
      >
        <Select.Value<Option> children={props.valueRender} />
        <Select.Icon>
          <CaretSortIcon class="w-4 h-4" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content class="z-50 text-sm text-left py-1 px-1 bg-zinc-700 border rounded border-zinc-600 text-white">
          <Select.Listbox class="space-y-0.5" />
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

export default StyledSelect;
