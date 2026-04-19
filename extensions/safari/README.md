# Tumblr Studio Safari Extension

This scaffold targets Mac Safari first with a Web Extension packaged through Xcode. Safari Web Extensions use standard extension files plus a native app or app-extension wrapper for distribution.

## Development Flow

1. Install the Next.js app and run it at `http://localhost:3000`.
2. Copy `.env.example` to `.env` and set `CAPTURE_SHARED_SECRET`.
3. In Xcode, create a Safari Web Extension wrapper and point the extension resources at this folder, or import these files into the generated extension target.
4. Set the extension option for `studioBaseUrl` to `http://localhost:3000`.
5. Enable Develop menu in Safari, then allow unsigned extensions for local testing.

## Why Web Extension First

The toolbar button, context menu, content script, selected image detection, and page metadata capture are a natural fit for Safari Web Extensions. A native Share Extension can be added later for iOS/iPadOS share-sheet workflows and deeper cross-device capture.

## iPhone and iPad Path

Safari Web Extensions are available on iOS and iPadOS, but packaging, entitlements, and app distribution add friction. The MVP keeps the capture contract plain JSON so the same background script can be adapted later.
