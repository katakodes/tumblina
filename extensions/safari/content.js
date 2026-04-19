let lastImage = null;

document.addEventListener(
  "mouseover",
  (event) => {
    const target = event.target;
    if (target instanceof HTMLImageElement && target.currentSrc) {
      lastImage = {
        selectedImageUrl: target.currentSrc,
        altText: target.alt || undefined
      };
    }
  },
  true
);

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "TUMBLR_STUDIO_PAGE_SNAPSHOT") return false;
  sendResponse({
    sourcePageUrl: location.href,
    sourcePageTitle: document.title,
    selectedText: window.getSelection()?.toString(),
    ...lastImage
  });
  return true;
});
