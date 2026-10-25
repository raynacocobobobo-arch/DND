import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import "./styles/tokens.css";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

if (document.readyState === "complete") {
  void registerServiceWorker();
} else {
  window.addEventListener("load", () => void registerServiceWorker(), { once: true });
}
