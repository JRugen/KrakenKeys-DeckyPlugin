export type KrakenDeal = {
  appId: string;
  currency: string;
  price: string;
  storeName: string;
  storeUrl: string;
  savingsPercent: number;
  otherDealsCount: number;
  krakenUrl: string;
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

export async function fetchMockKrakenDeal(
  appId: string,
  currency: string,
  includeKeyshops: boolean
): Promise<KrakenDeal> {
  await delay(500 + Math.random() * 600);

  const store = SAMPLE_STORES[Math.floor(Math.random() * SAMPLE_STORES.length)];
  const priceValue = (Math.random() * 40 + 5).toFixed(2);
  const savingsPercent = Math.floor(Math.random() * 60) + 5;
  const otherDealsCount = includeKeyshops
    ? Math.floor(Math.random() * 6) + 2
    : Math.floor(Math.random() * 3);

  return {
    appId,
    currency,
    price: `${currency} ${priceValue}`,
    storeName: store.name,
    storeUrl: `https://krakenkeys.com/deal/${store.slug}/${appId}`,
    savingsPercent,
    otherDealsCount,
    krakenUrl: `https://krakenkeys.com/game/${appId}`,
  };
}

