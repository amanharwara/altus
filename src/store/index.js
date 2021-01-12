import { writable } from "svelte/store";

let tabs = writable([]);

let themes = writable([]);

export { tabs, themes };
