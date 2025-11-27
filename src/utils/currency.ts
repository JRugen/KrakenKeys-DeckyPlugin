import { CACHE } from "./Cache";

const GBP_COUNTRIES = new Set(["GB", "UK", "GG", "IM", "JE"]);
const EUR_COUNTRIES = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE",
  "IT","LT","LU","LV","MT","NL","PL","PT","RO","SE","SI","SK","ES"
]);

const CACHE_KEY = "krakenkeys:currency";

export async function detectUserCurrency(): Promise<string> {
  const cached = await CACHE.loadValue(CACHE_KEY);
  if (typeof cached === "string") {
    return cached;
  }

  let detected = "USD";
  try {
    const country = await SteamClient.User?.GetIPCountry?.();
    if (country) {
      const upper = country.toUpperCase();
      if (GBP_COUNTRIES.has(upper)) {
        detected = "GBP";
      } else if (EUR_COUNTRIES.has(upper)) {
        detected = "EUR";
      } else if (upper === "US") {
        detected = "USD";
      }
    }
  } catch (err) {
    console.warn("[KrakenKeys] Failed to detect currency, defaulting to USD", err);
  }

  CACHE.setValue(CACHE_KEY, detected);
  return detected;
}

