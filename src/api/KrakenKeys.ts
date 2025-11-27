export type KrakenDeal = {
  appId: string;
  currency: string;
  price: string;
  storeName: string;
  storeUrl: string;
  savingsPercent: number;
  otherDealsCount: number;
  krakenUrl: string;
  steamIsLowest: boolean;
};

const API_URL = "https://krakenkeys.com/api/v1/steam-deck/deal";

type KrakenApiResponse = {
  steam_app_id: number;
  currency: string;
  keyshops_enabled: boolean;
  krakenkeys_url: string;
  best_deal_url: string | null;
  offer_count: number;
  best_price?: number;
  steam_is_lowest_price?: boolean | 0 | 1;
};

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SAMPLE_STORES = [
  { name: "Humble", slug: "humble" },
  { name: "Fanatical", slug: "fanatical" },
  { name: "GreenManGaming", slug: "gmg" },
  { name: "GamesPlanet", slug: "gamesplanet" },
];

function mapApiResponse(
  data: KrakenApiResponse,
  appId: string,
  currency: string
): KrakenDeal {
  const priceAmount = typeof data.best_price === "number" ? data.best_price : undefined;
  const resolvedCurrency = data.currency ?? currency ?? "USD";
  const storeUrl = data.best_deal_url ?? data.krakenkeys_url;
  const krakenUrl = data.krakenkeys_url ?? `https://krakenkeys.com/game/${appId}`;
  const otherDealsCount = data.offer_count ?? 0;
  const steamIsLowest =
    typeof data.steam_is_lowest_price === "boolean"
      ? data.steam_is_lowest_price
      : data.steam_is_lowest_price === 1;

  return {
    appId,
    currency: resolvedCurrency,
    price: priceAmount ? `${resolvedCurrency} ${priceAmount.toFixed(2)}` : `${resolvedCurrency} —`,
    storeName: steamIsLowest ? "Steam" : "KrakenKeys",
    storeUrl: storeUrl ?? krakenUrl,
    savingsPercent: 0,
    otherDealsCount,
    krakenUrl,
    steamIsLowest,
  };
}

async function fetchMockKrakenDeal(
  appId: string,
  currency: string,
  includeKeyshops: boolean
): Promise<KrakenDeal> {
  await delay(400 + Math.random() * 400);

  const store = SAMPLE_STORES[Math.floor(Math.random() * SAMPLE_STORES.length)];
  const priceValue = (Math.random() * 40 + 5).toFixed(2);
  const otherDealsCount = includeKeyshops
    ? Math.floor(Math.random() * 6) + 2
    : Math.floor(Math.random() * 3);

  return {
    appId,
    currency,
    price: `${currency} ${priceValue}`,
    storeName: store.name,
    storeUrl: `https://krakenkeys.com/deal/${store.slug}/${appId}`,
    savingsPercent: 0,
    otherDealsCount,
    krakenUrl: `https://krakenkeys.com/game/${appId}`,
    steamIsLowest: false,
  };
}

export async function fetchKrakenDeal(
  appId: string,
  currency: string,
  includeKeyshops: boolean
): Promise<KrakenDeal> {
  const params = new URLSearchParams({
    steam_app_id: appId,
    currency,
    keyshops_enabled: includeKeyshops ? "true" : "false",
  });

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`, {
      headers: { Accept: "application/json" },
    });

    if (!response.ok) {
      throw new Error(`KrakenKeys API responded with ${response.status}`);
    }

    const json = await response.json();
    const payload: KrakenApiResponse = json?.data ?? json;
    return mapApiResponse(payload, appId, currency);
  } catch (err) {
    console.warn("[KrakenKeys] API fetch failed, falling back to mock data", err);
    return fetchMockKrakenDeal(appId, currency, includeKeyshops);
  }
}