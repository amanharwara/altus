import { As, Tabs } from "@kobalte/core";
import { OverrideComponentProps } from "@kobalte/utils";
import { Component, For, splitProps } from "solid-js";
import { removeTab, tabStore } from "../stores/tabs/solid";
import { Tab } from "../stores/tabs/common";
import CloseIcon from "../icons/CloseIcon";

interface TabComponentProps
  extends OverrideComponentProps<"div", Tabs.TabsTriggerOptions> {
  tab: Tab;
}

const TabComponent: Component<TabComponentProps> = (props) => {
  const [{ tab }, rest] = splitProps(props, ["tab"]);

  return (
    <div
      class="group flex items-center gap-2.5 bg-zinc-800 px-3 py-1.5 text-white text-sm leading-4 ui-selected:bg-zinc-700 hover:bg-zinc-600 select-none"
      {...rest}
    >
      <span>{tab.name}</span>
      <button
        class="p-1 bg-zinc-700/25 hover:bg-zinc-800 rounded group-data-[selected]:bg-zinc-600/25 group-data-[selected]:hover:bg-zinc-800"
        onClick={(event) => {
          event.stopImmediatePropagation();
          event.preventDefault();
          removeTab(tab);
        }}
      >
        <CloseIcon class="w-4 h-4" />
      </button>
    </div>
  );
};

const TabsList: Component = () => {
  return (
    <Tabs.List class="flex bg-zinc-800 divide-x divide-zinc-700/20">
      <For each={tabStore.tabs}>
        {(tab) => (
          <Tabs.Trigger value={tab.id} asChild>
            <As component={TabComponent} tab={tab} />
          </Tabs.Trigger>
        )}
      </For>
    </Tabs.List>
  );
};

export default TabsList;
