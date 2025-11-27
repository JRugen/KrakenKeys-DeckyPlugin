# KrakenKeys – Steam Deck Deals Overlay

Show the best deal through KrakenKeys for the game you are currently viewing in the Steam Store. The plugin adds two compact buttons to the control strip inside Game Mode:

- **Lowest price button** – Links straight to the active store offer (disabled when Steam already has the best price).
- **“X deals” button** – Opens the KrakenKeys game page so players can compare every storefront.

All lookups are performed live against the public KrakenKeys API, and you can optionally exclude key shops with a toggle in the plugin settings.

## Features

- Detects the current Steam AppID
- Calls `https://krakenkeys.com/api/v1/steam-deck/deal` with the AppID, detected currency (GBP/EUR/USD, default USD), and the key-shop preference.
- Automatically disables the “best price” button when Steam is already cheapest.
- Overlay that fits inside the control strip and respects Steam’s UI layout.

## Requirements

- Node.js 18+ and `pnpm` v9 (plugin is pure frontend; no backend build needed).
- Decky Loader ≥ 2.8

## Getting Started

```bash
pnpm install
pnpm run build
./deploy.sh # update STEAM_DECK_IP inside the script to match your steam deck IP.
```

The deploy script pushes `dist/index.js`, `package.json`, `plugin.json`, and `main.py` to `~/homebrew/plugins/krakenkeys` and restarts Decky Loader.

### Testing

```bash
pnpm test
```

Tests cover:

- `fetchKrakenDeal` – response mapping, fallback to mock data, `steam_is_lowest_price`.
- `detectUserCurrency` – mapping IP country to GBP/EUR/USD and caching the result.

### Manual QA checklist

1. Restart Decky
2. Open any Steam store page; the overlay should appear at the bottom, within the control banner.
3. Toggle “Include key-shop offers” in the plugin panel and confirm API calls include the flag.
4. Verify USD/EUR/GBP detection by changing VPN/IP country (overlay displays corresponding currency).

## Submission Prep (Decky Plugin Database)

- `plugin.json` – update `name`, `author`, `description`, `tags`, and set your icon/art.
- `README.md` – describes the plugin, installation steps, and requirements (this file).
- `LICENSE` – keep the template license footer plus your project’s license at the top.
- Build artifacts – ensure only `dist/index.js` is produced; no temporary files in the repo.
- Screenshots/video – recommend adding an image of the overlay to the repo for the submission form.

## Acknowledgements

- AppID detection approach inspired by [IsThereAnyDeal-DeckyPlugin](https://github.com/JtdeGraaf/IsThereAnyDeal-DeckyPlugin).
- Built with [@decky/ui](https://github.com/SteamDeckHomebrew/decky-frontend-lib)

Happy deal hunting! If you run into issues, open an issue or send us an email at contact@krakenkeys.com
