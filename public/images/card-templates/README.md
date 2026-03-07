# Card template images

Place provider card template images here so account cards in the app match each provider’s look (e.g. Equity red card, NCBA dark card, Binance gold-on-black).

## File names

Use the **provider id** as the filename, with `.png` or `.jpg`:

| Provider        | Filename        |
|-----------------|-----------------|
| Equity Bank     | `equity.png`    |
| NCBA            | `ncba.png`      |
| KCB Bank        | `kcb.png`      |
| Cooperative Bank| `cooperative.png` |
| Mpesa           | `mpesa.png`     |
| Binance         | `binance.png`   |
| Coinbase        | `coinbase.png`  |
| Bybit           | `bybit.png`     |

## Image guidelines

- **Size:** About 320×192 px (or same aspect ratio as the card, ~5:3) is enough; the app scales with `background-size: cover`.
- **Format:** PNG or JPG.
- **Content:** Your screenshot or design of the card face. The app draws balance, card number (masked), and cardholder name on top with a light overlay so text stays readable.

If a provider has no image here, the app falls back to a gradient and the same card layout (chip, contactless icon, network badge).
