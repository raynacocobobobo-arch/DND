import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/heraldic.css";

async function bootstrap() {
  // A public preview uses a self-contained local demo API; production is unchanged.
  if (import.meta.env.VITE_STATIC_PREVIEW === "true") {
    await import("./preview/mockApi");
  }
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  if (import.meta.env.VITE_STATIC_PREVIEW !== "true") {
    if (document.readyState === "complete") {
      void registerServiceWorker();
    } else {
      window.addEventListener("load", () => void registerServiceWorker(), { once: true });
    }
  }
}
void bootstrap();
