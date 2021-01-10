import { writable } from "svelte/store";

let tabs = writable([
  {
    id: "tab1",
    name: "Aman",
    active: true,
    config: {
      theme: "dark",
      notifications: true,
      sound: true,
      utilityBar: false,
      color: "#2A3440",
      spellChecker: false,
    },
  },
  {
    id: "tab2",
    name: "Another",
    active: false,
    config: {
      theme: "dark",
      notifications: true,
      sound: true,
      utilityBar: false,
      color: "#2A3440",
      spellChecker: false,
    },
  },
  {
    id: "tab3",
    name: "One More",
    active: false,
    config: {
      theme: "dark",
      notifications: true,
      sound: true,
      utilityBar: false,
      color: "#2A3440",
      spellChecker: false,
    },
  },
]);

export { tabs };
