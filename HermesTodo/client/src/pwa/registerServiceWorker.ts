interface RegistrationEnvironment {
  isSecureContext: boolean;
  serviceWorker?: Pick<ServiceWorkerContainer, "register"> | null;
}

export async function registerServiceWorker(environment?: RegistrationEnvironment) {
  const isSecureContext = environment?.isSecureContext ?? (typeof window !== "undefined" && window.isSecureContext);
  const serviceWorker = environment?.serviceWorker ?? (typeof navigator !== "undefined" ? navigator.serviceWorker : null);
  if (!isSecureContext || !serviceWorker) return;
  return serviceWorker.register("/sw.js", { scope: "/" });
}
