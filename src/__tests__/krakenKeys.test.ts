import { describe, it, expect, vi, afterEach } from "vitest";
import { fetchKrakenDeal } from "../api/KrakenKeys";

describe("fetchKrakenDeal", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("maps the KrakenKeys API response wrapped in data", async () => {
    const mockResponse = {
      data: {
        steam_app_id: 367520,
        currency: "USD",
        keyshops_enabled: true,
        krakenkeys_url: "https://krakenkeys.com/game/hollow-knight",
        best_deal_url: "https://krakenkeys.com/out/268413",
        best_price: 14.99,
        offer_count: 6,
        steam_is_lowest_price: false,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });
    vi.stubGlobal("fetch", fetchMock);

    const deal = await fetchKrakenDeal("367520", "USD", true);

    expect(fetchMock).toHaveBeenCalledWith(
      expect.stringContaining("steam_app_id=367520"),
      expect.any(Object)
    );
    expect(deal.price).toBe("USD 14.99");
    expect(deal.storeUrl).toBe(mockResponse.data.best_deal_url);
    expect(deal.otherDealsCount).toBe(6);
    expect(deal.steamIsLowest).toBe(false);
  });

  it("falls back to mock data if the API request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("network")));
    vi.spyOn(Math, "random").mockReturnValue(0.25);

    const deal = await fetchKrakenDeal("123456", "USD", true);

    expect(deal.appId).toBe("123456");
    expect(deal.krakenUrl).toContain("123456");
  });
});

