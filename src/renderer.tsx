import "./index.css";

import { render } from "solid-js/web";

import App from "./App";
import { isDev } from "./utils/isDev";

const root = document.getElementById("root");

if (isDev && !(root instanceof HTMLElement)) {
  throw new Error(
    "Root element not found. Did you forget to add it to your index.html? Or maybe the id attribute got misspelled?"
  );
}

render(() => <App />, root);
