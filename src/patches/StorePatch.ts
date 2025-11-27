/* Polls remote debugging endpoint to detect the current Steam store page */
import { fetchNoCors } from "@decky/api"
import { CACHE } from "../utils/Cache"

type Tab = {
  description: string
  devtoolsFrontendUrl: string
  id: string
  title: string
  type: 'page'
  url: string
  webSocketDebuggerUrl: string
}

const STORE_URL_PATTERN = /https:\/\/store\.steampowered\.com\/app\/([\d]+)\//;

export function patchStore(): () => void {
  let stopped = false;
  let timeout: ReturnType<typeof setTimeout> | null = null;
  let lastUrl = "";

  const loop = async () => {
    if (stopped) return;

    try {
      const response = await fetchNoCors("http://localhost:8080/json");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const tabs = (await response.json()) as Tab[];
      const storeTab = tabs.find((tab) => STORE_URL_PATTERN.test(tab.url));

      if (storeTab) {
        if (storeTab.url !== lastUrl) {
          lastUrl = storeTab.url;
          const match = storeTab.url.match(STORE_URL_PATTERN);
          const appId = match?.[1] ?? null;
          if (appId) {
            CACHE.setValue(CACHE.APP_ID_KEY, appId);
          } else {
            CACHE.setValue(CACHE.APP_ID_KEY, "");
          }
        }
      } else {
        lastUrl = "";
        CACHE.setValue(CACHE.APP_ID_KEY, "");
      }
    } catch (err) {
      console.error("[KrakenKeys] Failed to query Steam store tabs", err);
      lastUrl = "";
      CACHE.setValue(CACHE.APP_ID_KEY, "");
    } finally {
      if (!stopped) {
        timeout = setTimeout(loop, 1500);
      }
    }
  };

  loop();

  return () => {
    stopped = true;
    if (timeout) {
      clearTimeout(timeout);
    }
    CACHE.setValue(CACHE.APP_ID_KEY, "");
  };
}

