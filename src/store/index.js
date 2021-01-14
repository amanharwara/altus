import { writable } from "svelte/store";

let tabs = writable([]);

let themes = writable([]);

let paths = writable({
  userData: "",
});

export { tabs, themes, paths };
