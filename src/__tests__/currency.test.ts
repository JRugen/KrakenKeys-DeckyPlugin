import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { detectUserCurrency } from "../utils/currency";
import { Cache } from "../utils/Cache";

describe("detectUserCurrency", () => {
  beforeEach(() => {
    Cache.init();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // @ts-ignore - cleanup test stub
    delete globalThis.SteamClient;
  });

  it("returns GBP for UK IPs", async () => {
    (globalThis as any).SteamClient = {
      User: {
        GetIPCountry: vi.fn().mockResolvedValue("GB"),
      },
    };

    await expect(detectUserCurrency()).resolves.toBe("GBP");
  });

  it("returns EUR for EU IPs", async () => {
    (globalThis as any).SteamClient = {
      User: {
        GetIPCountry: vi.fn().mockResolvedValue("DE"),
      },
    };

    await expect(detectUserCurrency()).resolves.toBe("EUR");
  });

  it("defaults to USD otherwise", async () => {
    (globalThis as any).SteamClient = {
      User: {
        GetIPCountry: vi.fn().mockResolvedValue("JP"),
      },
    };

    await expect(detectUserCurrency()).resolves.toBe("USD");
  });
});

