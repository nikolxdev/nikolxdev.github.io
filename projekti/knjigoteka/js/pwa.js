export function initPwa({ t, toast }) {
  const offlineBar = document.getElementById("offline-bar");
  const installButton = document.getElementById("install-btn");

  const syncOnline = () => {
    offlineBar.hidden = navigator.onLine;
    document.documentElement.classList.toggle("is-offline", !navigator.onLine);
  };
  window.addEventListener("online", () => {
    syncOnline();
    toast(t("pwa.backOnline"), { duration: 3000 });
  });
  window.addEventListener("offline", syncOnline);
  syncOnline();

  if ("serviceWorker" in navigator && window.isSecureContext) {
    let updateRequested = false;

    const offerUpdate = (worker) => {
      toast(t("pwa.updateReady"), {
        action: t("pwa.updateAction"),
        duration: 0,
        onAction: () => {
          updateRequested = true;
          worker.postMessage({ type: "SKIP_WAITING" });
        },
      });
    };

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      if (updateRequested) window.location.reload();
    });

    window.addEventListener("load", async () => {
      try {
        const registration = await navigator.serviceWorker.register("sw.js");
        if (!registration) return;
        if (registration.waiting && navigator.serviceWorker.controller) offerUpdate(registration.waiting);

        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) offerUpdate(worker);
          });
        });

        setInterval(() => registration.update().catch(() => {}), 60 * 60 * 1000);
      } catch (error) {
        console.warn("Service worker registration failed", error);
      }
    });
  }

  let deferredPrompt = null;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredPrompt = event;
    installButton.hidden = false;
  });

  installButton.addEventListener("click", async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    installButton.hidden = true;
  });

  window.addEventListener("appinstalled", () => {
    installButton.hidden = true;
    toast(t("pwa.installed"));
  });
}

export async function requestPersistence() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist();
    }
  } catch {
  }
}
