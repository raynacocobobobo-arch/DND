import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { App } from "./App";
import { registerServiceWorker } from "./pwa/registerServiceWorker";
import "./styles/tokens.css";
import "./styles/global.css";
import "./styles/heraldic.css";
import "./styles/art-direction.css";
import "./styles/editorial-home.css";
import "./styles/final-art.css";
import "./styles/v4-execution.css";
import "./styles/v6-ui.css";
import "./styles/manuscript-v7.css";
import "./styles/scene-home.css";
import "./styles/heraldic-ui.css";
import "./styles/cloud-sync.css";

async function bootstrap() {
  // A public preview uses a self-contained local demo API; production is unchanged.
  if (import.meta.env.VITE_STATIC_PREVIEW === "true") {
    // Keep local demo intact. Cloud mode overrides only its API while offline AI remains available.
    await import("./preview/mockApi");
    const { installCloudBridge, acceptCloudRedirect } = await import("./cloud/bridge");
    installCloudBridge();
    // If a magic-link redirected here, save the user-bound session before mounting React.
    await acceptCloudRedirect().catch(() => undefined);
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
