const DEFAULT_BASE_URL = "http://localhost:3000";

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "capture-image",
    title: "Save image to Tumblr Studio",
    contexts: ["image"]
  });
  chrome.contextMenus.create({
    id: "capture-page",
    title: "Save page to Tumblr Studio",
    contexts: ["page", "selection"]
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const payload = {
    sourcePageUrl: info.pageUrl || tab?.url,
    sourcePageTitle: tab?.title,
    selectedImageUrl: info.srcUrl,
    selectedText: info.selectionText
  };
  await sendCapture(payload);
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "TUMBLR_STUDIO_CAPTURE") return false;
  sendCapture(message.payload)
    .then((result) => sendResponse({ ok: true, result }))
    .catch((error) => sendResponse({ ok: false, error: error.message }));
  return true;
});

async function sendCapture(payload) {
  const { studioBaseUrl = DEFAULT_BASE_URL, captureSecret = "" } = await chrome.storage.sync.get([
    "studioBaseUrl",
    "captureSecret"
  ]);
  const response = await fetch(`${studioBaseUrl}/api/capture`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-capture-secret": captureSecret
    },
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error(`Capture failed: ${response.status}`);
  return response.json();
}
