import "./index.css";

import { render } from "solid-js/web";

import App from "./App";

const root = document.getElementById("root");

// @ts-expect-error - import.meta.env works fine but TS throws an error
if (import.meta.env.DEV && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(() => <App />, root);
