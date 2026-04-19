const TUMBLR_IMAGE_SIZE_PATTERN = /\/s\d+x\d+\//;

export function getTumblrDisplayImageUrl(url: string, size = "s640x960") {
  if (!url.includes("media.tumblr.com")) return url;
  return url.replace(TUMBLR_IMAGE_SIZE_PATTERN, `/${size}/`);
}
