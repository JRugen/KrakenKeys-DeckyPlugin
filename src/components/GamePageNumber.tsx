import { Navigation } from "@decky/ui";
import { useEffect, useRef, useState } from 'react'
import { CACHE } from '../utils/Cache';
import { fetchKrakenDeal, KrakenDeal } from "../api/KrakenKeys";
import { detectUserCurrency } from "../utils/currency";

const SAFE_ZONE_FROM_BOTTOM = 8;
const LEFT_SAFE_MARGIN = 150;
const BUTTON_HEIGHT = 25;
const BUTTON_WIDTH = 128;

const GamePageNumber = () => {
  const [appId, setAppId] = useState<string | null>(null)
  const [keyshopsEnabled, setKeyshopsEnabled] = useState<boolean>(true);
  const [deal, setDeal] = useState<KrakenDeal | null>(null);
  const [isVisible, setIsVisible] = useState(false)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState<string>("USD");
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [measuredHeight, setMeasuredHeight] = useState(BUTTON_HEIGHT);

  useEffect(() => {
    const id = "GamePageNumber_APP";
    function loadAppId() {
      CACHE.loadValue(CACHE.APP_ID_KEY).then((value) => {
        setAppId(value || null);
        setIsVisible(!!value);
      });
    }
    loadAppId();
    CACHE.subscribe(id, loadAppId);

    return () => {
      CACHE.unsubscribe(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    detectUserCurrency().then((code) => {
      if (!cancelled && code) {
        setCurrency(code);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const id = "GamePageNumber_PREF";
    function loadPref() {
      CACHE.loadValue(CACHE.KEYSHOP_PREF_KEY).then((value) => {
        if (typeof value === "boolean") {
          setKeyshopsEnabled(value);
        }
      });
    }
    loadPref();
    CACHE.subscribe(id, loadPref);
    return () => {
      CACHE.unsubscribe(id);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!appId) {
        setDeal(null);
        setError(null);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const result = await fetchKrakenDeal(appId, currency, keyshopsEnabled);
        if (!cancelled) {
          setDeal(result);
        }
      } catch (err) {
        console.error("[KrakenKeys] failed to fetch mock deal", err);
        if (!cancelled) {
          setDeal(null);
          setError("Could not fetch deals");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [appId, keyshopsEnabled, currency]);

  useEffect(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMeasuredHeight(rect.height || BUTTON_HEIGHT);
  }, [deal, loading, error, isVisible, appId]);

  if (!isVisible || !appId) {
    return null;
  }

  const openUrl = (url: string) => {
    if (!url) return;
    Navigation.NavigateToExternalWeb(url);
  };

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",
        flexDirection: "row",
        gap: 8,
        width: "auto",
        zIndex: 7002,
        position: "fixed",
        bottom: `${SAFE_ZONE_FROM_BOTTOM}px`,
        left: `${LEFT_SAFE_MARGIN}px`,
        transform: `translateY(${isVisible ? 0 : measuredHeight + 12}px)`,
        transition: "transform 0.22s cubic-bezier(0, 0.73, 0.48, 1)",
      }}>
      <button
        style={{
          width: BUTTON_WIDTH,
          height: BUTTON_HEIGHT,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.25)",
          background: deal
            ? deal.steamIsLowest
              ? "rgba(255,255,255,0.12)"
              : "rgba(85, 33, 181, 1)"
            : "rgba(255,255,255,0.08)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          whiteSpace: "nowrap",
          cursor: deal && !deal.steamIsLowest ? "pointer" : "default",
        }}
        disabled={!deal || deal.steamIsLowest}
        onClick={() => deal && !deal.steamIsLowest && deal.storeUrl && openUrl(deal.storeUrl)}
      >
        {deal
          ? deal.steamIsLowest
            ? "Steam best price"
            : `${deal.price}`
          : loading
            ? "Searching…"
            : "No deal"}
      </button>
      <button
        style={{
          width: BUTTON_WIDTH,
          height: BUTTON_HEIGHT,
          borderRadius: 12,
          border: "1px solid rgba(255,255,255,0.25)",
          background: deal ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.05)",
          color: "#fff",
          fontWeight: 600,
          fontSize: 13,
          whiteSpace: "nowrap",
          cursor: deal ? "pointer" : "default",
        }}
        disabled={!deal}
        onClick={() => deal && openUrl(deal.krakenUrl)}
      >
        {deal ? `${deal.otherDealsCount} deals` : loading ? "…" : "—"}
      </button>
    </div> 
  )
}

export default GamePageNumber

