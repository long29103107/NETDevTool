/**
 * This file is the entry point for the React app, it sets up the root
 * element and renders the App component to the DOM.
 *
 * It is included in `src/index.html`.
 */

import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";

const basename =
  typeof window !== "undefined" && window.location.pathname.startsWith("/_devtool")
    ? "/_devtool"
    : "/";

function start() {
  const root = createRoot(document.getElementById("root")!);
  root.render(
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  );
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}
