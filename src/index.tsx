import {
  PanelSection,
  PanelSectionRow,
  ToggleField,
  staticClasses
} from "@decky/ui";
import {
  definePlugin,
  routerHook,
} from "@decky/api"
import { useEffect, useState } from "react";
import { FaTag } from "react-icons/fa";

import GamePageNumber from "./components/GamePageNumber";
import { patchStore } from "./patches/StorePatch";
import { Cache, CACHE } from "./utils/Cache";

const KEYSHOP_STORAGE_KEY = "krakenkeys:keyshopsEnabled";

function readStoredKeyshopPref(): boolean {
  try {
    const stored = window.localStorage?.getItem(KEYSHOP_STORAGE_KEY);
    if (stored === null) return true;
    return stored === "true" || stored === "1";
  } catch {
    return true;
  }
}

function persistKeyshopPref(value: boolean) {
  try {
    window.localStorage?.setItem(KEYSHOP_STORAGE_KEY, value ? "true" : "false");
  } catch {
    /* Ignoring storage errors for now */
  }
}

const SettingsPanel = () => {
  const [keyshopsEnabled, setKeyshopsEnabled] = useState<boolean>(() => readStoredKeyshopPref());

  useEffect(() => {
    CACHE.setValue(CACHE.KEYSHOP_PREF_KEY, keyshopsEnabled);
  }, [keyshopsEnabled]);

  const handleToggle = (value: boolean) => {
    setKeyshopsEnabled(value);
    persistKeyshopPref(value);
  };

  return (
    <PanelSection title="Preferences">
      <PanelSectionRow>
        <ToggleField
          checked={keyshopsEnabled}
          label="Include key-shop offers"
          description="Shows deals from marketplaces like Eneba, Driffle, Gamivo etc. Disable if you want official store pricing only, such as IndieGala, GreenManGaming etc. "
          onChange={handleToggle}
        />
      </PanelSectionRow>
      <PanelSectionRow>
        <div style={{ fontSize: "12px", color: "#888" }}>
          This preference is stored locally, and sent to KrakenKeys so we can respect your choice.
        </div>
      </PanelSectionRow>
    </PanelSection>
  );
};

export default definePlugin(() => {
  /* Init cache */
  Cache.init()
  const initialPref = readStoredKeyshopPref();
  CACHE.setValue(CACHE.KEYSHOP_PREF_KEY, initialPref);
  
  routerHook.addGlobalComponent("GamePageNumber", GamePageNumber)
  const storePatch = patchStore()

  return {
    name: "KrakenKeys",
    titleView: <div className={staticClasses.Title}>KrakenKeys - Decky Edition</div>,
    content: (
      <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <SettingsPanel />
      </div>
    ),
    // The icon displayed in the plugin list @todo - make this a proper icon
    icon: <FaTag />,
    /* On unload */
    onDismount() {
      console.log("KrakenKeys plugin unloading")
      routerHook.removeGlobalComponent("GamePageNumber")
      if (storePatch) storePatch()
    },
  };
});
