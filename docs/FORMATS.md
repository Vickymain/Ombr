# Statement import formats

The import engine reads **CSV/TXT** and **PDF** statement files and turns them into transactions. Different banks and providers use different column names and layouts; the engine tries to support many of them automatically.

## Debugging: see what the engine sees

If a file (e.g. a PDF) doesn’t import, you can dump the **raw content** the parser gets:

```bash
php artisan statement:inspect "C:\path\to\your\Feb Transactions Ombr.pdf"
```

For PDFs this prints the extracted text (first 8000 chars). For CSV/TXT it prints the first 30 lines. Use that output to add new patterns or column names in `StatementImportService.php`, or share it to get help tuning the parser.

---

## CSV / TXT

- **Delimiters:** Comma, semicolon, tab, and pipe are auto-detected from the first line.
- **Encoding:** UTF-8 (with or without BOM).
- **Required:** At least one **date** column and one **amount** column (or separate **debit** and **credit** columns).

### Recognized column names (any case)

| Purpose    | Examples we recognise |
|-----------|------------------------|
| **Date**  | `date`, `transaction date`, `value date`, `completion time`, `posting date`, `booking date`, `transaction time`, `initiation time`, … |
| **Description** | `description`, `details`, `narration`, `memo`, `particulars`, `narrative`, `reference`, `recipient`, `sender`, `payee`, `payer`, … |
| **Amount** | `amount`, `transaction amount`, `total`, `value`, … |
| **Debit** | `debit`, `withdrawal`, `withdrawn`, `paid out`, `out`, … |
| **Credit** | `credit`, `deposit`, `deposited`, `paid in`, `received`, `in`, … |
| **Type**   | `type`, `dr/cr`, `direction`, `debit/credit`, … |
| **Category** | `category`, `categories` |

If your export uses a **different header name**, the importer will say it couldn’t find required columns and show the first line and headers it saw. To add support:

1. Copy the **exact first line** of your CSV (the header row).
2. Add that header (or the new column name) to the right list in `app/Services/StatementImportService.php`:
   - Date → `getDateHeaderCandidates()`
   - Description → `getDescriptionHeaderCandidates()`
   - Amount → `getAmountHeaderCandidates()`
   - Debit → `getDebitHeaderCandidates()`
   - Credit → `getCreditHeaderCandidates()`

### Date formats

We try many formats, including: `Y-m-d`, `d/m/Y`, `d-m-Y`, `m/d/Y`, `d.m.Y`, `d M Y`, `Y-m-d H:i:s`, `d/m/Y H:i`, etc. If your date still isn’t recognised, add the format to the `$formats` array in `parseDate()` in `StatementImportService.php`.

---

## PDF

- PDFs are parsed as plain text (no OCR). Tables and layout are flattened into lines.
- We look for:
  - A **date** (e.g. `YYYY-MM-DD`, `DD/MM/YYYY`) and a **numeric amount** (with optional minus, commas, or currency like KES/USD) on the same line.
  - Optional **CR/DR** (or CREDIT/DEBIT) to decide income vs expense; otherwise we use sign of the amount.

If a PDF has a very different layout (e.g. multi-column table, image-only), it may not parse. In that case you can:

- Export the same statement as CSV from your bank if possible, or
- Add a **provider-specific** PDF parser in `StatementImportService::parsePdf()` (e.g. for a known M-Pesa or bank PDF layout).

---

## Adding a new format

1. **New CSV column name:** Add it to the right `get*HeaderCandidates()` list in `StatementImportService.php`.
2. **New date format:** Add the PHP date format string to `parseDate()`’s `$formats` array.
3. **New provider PDF layout:** In `parsePdf()`, add a branch on `$provider` and use a custom regex or line-splitting logic for that provider’s PDF text layout.

After changes, run a quick test by uploading a sample file (or a unit test that calls `parseFileToRows()` with a sample path).
