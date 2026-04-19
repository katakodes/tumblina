const baseUrlInput = document.querySelector("#baseUrl");
const secretInput = document.querySelector("#secret");
const captureButton = document.querySelector("#capture");

chrome.storage.sync.get(["studioBaseUrl", "captureSecret"]).then((settings) => {
  baseUrlInput.value = settings.studioBaseUrl || "http://localhost:3000";
  secretInput.value = settings.captureSecret || "";
});

baseUrlInput.addEventListener("change", () => {
  chrome.storage.sync.set({ studioBaseUrl: baseUrlInput.value });
});

secretInput.addEventListener("change", () => {
  chrome.storage.sync.set({ captureSecret: secretInput.value });
});

captureButton.addEventListener("click", async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  const snapshot = await chrome.tabs.sendMessage(tab.id, { type: "TUMBLR_STUDIO_PAGE_SNAPSHOT" });
  chrome.runtime.sendMessage({ type: "TUMBLR_STUDIO_CAPTURE", payload: snapshot }, (response) => {
    captureButton.textContent = response?.ok ? "Saved" : "Could not save";
    setTimeout(() => {
      captureButton.textContent = "Capture page";
    }, 1400);
  });
});
