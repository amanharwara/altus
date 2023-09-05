import "./index.css";

import { render } from "solid-js/web";

import App from "./App";

let root: HTMLDivElement | null = document.getElementById(
  "root"
) as HTMLDivElement | null;

if (!root) {
  root = document.createElement("div");
  root.id = "root";
  document.body.appendChild(root);
}

render(() => <App />, root);
