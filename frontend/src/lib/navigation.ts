import type { NavigationParam, ModuleType } from "@/types/platform";
import { APP_ENV_URLS } from "@/types/platform";

// Message types for postMessage communication with iframes
export interface PlatformMessage {
  type: "PLATFORM_NAVIGATE" | "PLATFORM_NAV_PARAM" | "IFRAME_OBJECT_CLICK" | "IFRAME_ACTION";
  payload: Record<string, unknown>;
}

// Send a navigation parameter to an iframe
export function sendNavParamToIframe(iframe: HTMLIFrameElement, param: NavigationParam) {
  const message: PlatformMessage = {
    type: "PLATFORM_NAV_PARAM",
    payload: {
      objectType: param.objectType,
      objectId: param.objectId,
      objectTitle: param.objectTitle,
      sourceModule: param.sourceModule,
    },
  };
  iframe.contentWindow?.postMessage(message, "*");
}

// Get the iframe URL for a module, optionally with a nav parameter
export function getModuleURL(moduleType: ModuleType, navParam?: NavigationParam): string {
  const baseURL = APP_ENV_URLS[moduleType];
  if (!baseURL) return "";
  if (!navParam) return baseURL;

  const url = new URL(baseURL);
  url.searchParams.set("objectType", navParam.objectType);
  url.searchParams.set("objectId", navParam.objectId);
  return url.toString();
}

// Listen for messages from iframes
export type IframeMessageHandler = (moduleType: ModuleType, message: PlatformMessage) => void;

export function createIframeListener(handler: IframeMessageHandler) {
  const listener = (event: MessageEvent) => {
    const data = event.data as PlatformMessage;
    if (!data?.type) return;

    if (data.type === "IFRAME_OBJECT_CLICK" || data.type === "IFRAME_ACTION") {
      // Find which module sent this by matching origin to APP_ENV_URLS
      for (const [key, url] of Object.entries(APP_ENV_URLS)) {
        try {
          if (new URL(url).origin === event.origin) {
            handler(key as ModuleType, data);
            return;
          }
        } catch {
          // skip invalid URLs
        }
      }
    }
  };
  window.addEventListener("message", listener);
  return () => window.removeEventListener("message", listener);
}
