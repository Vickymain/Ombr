<?php

namespace App\Services;

use App\Models\Account;
use App\Models\Transaction;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\UploadedFile;
use Smalot\PdfParser\Parser as PdfParser;

class StatementImportService
{
    /**
     * Get raw text extracted from a PDF (for debugging / inspect command).
     */
    public function getPdfRawText(string $path): string
    {
        $parser = new PdfParser();
        $pdf = $parser->parseFile($path);
        return $pdf->getText();
    }

    /**
     * Parse an uploaded statement file into normalized rows (no DB writes).
     * Use this to validate files before creating an account.
     *
     * @return array<int, array<string, mixed>>
     * @throws \Throwable when the file cannot be read or parsed
     */
    public function parseFileToRows(UploadedFile $file, ?string $provider = null): array
    {
        $path = $file->getRealPath();
        $extension = strtolower($file->getClientOriginalExtension());

        if (in_array($extension, ['csv', 'txt'], true)) {
            return $this->parseCsv($path);
        }
        if ($extension === 'pdf') {
            return $this->parsePdf($path, $provider);
        }

        throw new \InvalidArgumentException('Unsupported statement file type.');
    }

    /**
     * Create transactions from already-parsed rows and update account balance.
     *
     * @param array<int, array<string, mixed>> $rows
     * @return int Number of transactions created
     */
    public function importFromRows(array $rows, User $user, Account $account, string $defaultCategory = 'Imported'): int
    {
        $createdCount = 0;

        foreach ($rows as $row) {
            if (!isset($row['date'], $row['amount'], $row['type'])) {
                continue;
            }

            $date = $this->parseDate($row['date']);
            if (!$date) {
                continue;
            }

            $amount = (float) $row['amount'];
            if ($amount === 0.0) {
                continue;
            }

            $type = $row['type'] === 'income' ? 'income' : 'expense';

            $description = isset($row['description']) ? (string) $row['description'] : null;
            if ($description !== null && strlen($description) > 65535) {
                $description = substr($description, 0, 65535);
            }

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'type' => $type,
                'amount' => abs($amount),
                'category' => $row['category'] ?? $defaultCategory,
                'description' => $description,
                'transaction_date' => $date->toDateString(),
                'payment_method' => $row['payment_method'] ?? null,
                'reference_number' => $row['reference'] ?? null,
                'is_recurring' => false,
                'recurring_frequency' => null,
                'notes' => null,
            ]);

            if ($type === 'income') {
                $account->balance += $transaction->amount;
            } else {
                $account->balance -= $transaction->amount;
            }

            $createdCount++;
        }

        $account->save();

        return $createdCount;
    }

    /**
     * Import transactions for an account from an uploaded statement file.
     *
     * @return int Number of transactions created
     */
    public function importFromUploadedFile(UploadedFile $file, User $user, Account $account, string $defaultCategory = 'Imported'): int
    {
        $rows = $this->parseFileToRows($file, $account->provider);
        return $this->importFromRows($rows, $user, $account, $defaultCategory);
    }

    /**
     * Parse a CSV or TXT file into normalized rows.
     * Handles BOM, comma/semicolon delimiters, and many common column names.
     *
     * @return array<int, array<string, mixed>>
     */
    private function parseCsv(string|false $path): array
    {
        if ($path === false) {
            throw new \RuntimeException('Unable to read uploaded file.');
        }

        $content = file_get_contents($path);
        if ($content === false || $content === '') {
            throw new \RuntimeException('The uploaded file appears to be empty.');
        }

        // Strip UTF-8 BOM
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);
        $allLines = preg_split('/\r\n|\r|\n/', $content, -1, PREG_SPLIT_NO_EMPTY);

        if (empty($allLines)) {
            throw new \RuntimeException('The uploaded file appears to be empty.');
        }

        // Find the header row by scanning lines for one with recognized columns
        $header = [];
        $delimiter = ',';
        $headerLineIndex = null;
        $delimiters = [',', ';', "\t", '|'];

        foreach ($allLines as $lineIdx => $rawLine) {
            $rawLine = trim($rawLine);
            if ($rawLine === '') continue;

            foreach ($delimiters as $d) {
                $candidate = str_getcsv($rawLine, $d);
                $candidate = array_map(static fn ($h) => strtolower(trim((string) $h)), $candidate);
                $candidate = array_values(array_filter($candidate, static fn ($h) => $h !== ''));

                if (count($candidate) < 2) continue;

                $dateIdx = $this->findFirstIndex($candidate, $this->getDateHeaderCandidates());
                $amtIdx = $this->findFirstIndex($candidate, $this->getAmountHeaderCandidates());
                $debIdx = $this->findFirstIndex($candidate, $this->getDebitHeaderCandidates());
                $credIdx = $this->findFirstIndex($candidate, $this->getCreditHeaderCandidates());

                if ($dateIdx !== null && ($amtIdx !== null || $debIdx !== null || $credIdx !== null)) {
                    $header = $candidate;
                    $delimiter = $d;
                    $headerLineIndex = $lineIdx;
                    break 2;
                }
            }
        }

        if ($headerLineIndex === null) {
            $firstLine = $allLines[0] ?? '';
            throw new \RuntimeException(
                'Could not find required columns. The file needs a date column and an amount (or debit/credit) column. First line: "' . substr($firstLine, 0, 200) . '". If your export uses different names, share it to extend support.'
            );
        }

        $dateIndex = $this->findFirstIndex($header, $this->getDateHeaderCandidates());
        $descriptionIndex = $this->findFirstIndex($header, $this->getDescriptionHeaderCandidates());
        $amountIndex = $this->findFirstIndex($header, $this->getAmountHeaderCandidates());
        $debitIndex = $this->findFirstIndex($header, $this->getDebitHeaderCandidates());
        $creditIndex = $this->findFirstIndex($header, $this->getCreditHeaderCandidates());
        $typeIndex = $this->findFirstIndex($header, $this->getTypeHeaderCandidates());
        $categoryIndex = $this->findFirstIndex($header, ['category', 'categories']);

        if ($dateIndex === null || ($amountIndex === null && $debitIndex === null && $creditIndex === null)) {
            throw new \RuntimeException(
                'Could not find required columns. Headers we see: [' . implode(', ', $header) . '].'
            );
        }

        $rows = [];
        $dataLines = array_slice($allLines, $headerLineIndex + 1);
        $maxIndex = (int) max(
            $dateIndex,
            $descriptionIndex ?? 0,
            $amountIndex ?? 0,
            $debitIndex ?? 0,
            $creditIndex ?? 0,
            $typeIndex ?? 0,
            $categoryIndex ?? 0,
        );

        foreach ($dataLines as $line) {
            $line = trim($line);
            if ($line === '') {
                continue;
            }

            $row = str_getcsv($line, $delimiter);
            if (count($row) <= $maxIndex) {
                continue;
            }

            $rawDate = isset($row[$dateIndex]) ? trim((string) $row[$dateIndex]) : null;
            if ($rawDate === null || $rawDate === '') {
                continue;
            }

            // Skip if this looks like a repeated header row
            if (in_array(strtolower($rawDate), ['date', 'transaction date', 'value date', 'completion time', 'timestamp'], true)) {
                continue;
            }

            $rawAmount = null;
            $type = null;

            if ($amountIndex !== null && isset($row[$amountIndex]) && (string) $row[$amountIndex] !== '') {
                $rawAmount = $row[$amountIndex];
            } elseif ($debitIndex !== null && isset($row[$debitIndex]) && (string) $row[$debitIndex] !== '') {
                $debitVal = trim((string) $row[$debitIndex]);
                $rawAmount = $debitVal !== '' ? '-' . $debitVal : null;
            } elseif ($creditIndex !== null && isset($row[$creditIndex]) && (string) $row[$creditIndex] !== '') {
                $rawAmount = $row[$creditIndex];
            }

            if ($rawAmount === null || (string) $rawAmount === '') {
                continue;
            }

            $normalizedAmount = (float) str_replace([',', ' ', '"'], ['', '', ''], (string) $rawAmount);
            if ($normalizedAmount === 0.0) {
                continue;
            }

            if ($typeIndex !== null && isset($row[$typeIndex])) {
                $rawType = strtolower(trim((string) $row[$typeIndex]));
                if (in_array($rawType, ['income', 'credit', 'cr', 'c', 'receive', 'buy'], true)) {
                    $type = 'income';
                } elseif (in_array($rawType, ['expense', 'debit', 'dr', 'd', 'send', 'sell', 'convert'], true)) {
                    $type = 'expense';
                }
            }

            if ($type === null) {
                $type = $normalizedAmount > 0 ? 'income' : 'expense';
            }

            $category = null;
            if ($categoryIndex !== null && isset($row[$categoryIndex]) && (string) $row[$categoryIndex] !== '') {
                $category = trim((string) $row[$categoryIndex]);
            }

            $rows[] = [
                'date' => $rawDate,
                'description' => $descriptionIndex !== null && isset($row[$descriptionIndex]) ? trim((string) $row[$descriptionIndex]) : null,
                'amount' => $normalizedAmount,
                'type' => $type,
                'category' => $category,
            ];
        }

        return $rows;
    }

    /** @return list<string> */
    private function getDateHeaderCandidates(): array
    {
        return [
            'date', 'transaction date', 'value date', 'trans date', 'completion time', 'timestamp', 'posting date', 'booking date',
            'transaction date and time', 'date/time', 'time', 'transaction time', 'created', 'processed date',
            'cleared date', 'settlement date', 'effective date', 'transaction time (ect)', 'initiation time',
        ];
    }

    /** @return list<string> */
    private function getDescriptionHeaderCandidates(): array
    {
        return [
            'description', 'details', 'narration', 'memo', 'particulars', 'narrative', 'reference', 'remarks',
            'notes', 'asset',
            'transaction details', 'transaction reference', 'recipient', 'sender', 'payee', 'payer', 'name',
            'details_2', 'transaction particulars', 'payment details', 'beneficiary', 'counter party',
            'transaction narrative', 'transaction description', 'remarks_2', 'narrative_2', 'transaction_ref',
        ];
    }

    /** @return list<string> */
    private function getAmountHeaderCandidates(): array
    {
        return [
            'amount', 'amt', 'transaction amount', 'total', 'sum', 'value', 'transaction amount (account currency)',
            'amount (local)', 'amount (usd)', 'gross amount', 'net amount',
            'subtotal', 'total (inclusive of fees and/or spread)', 'quantity transacted',
        ];
    }

    /** @return list<string> */
    private function getDebitHeaderCandidates(): array
    {
        return [
            'debit', 'withdrawal', 'withdrawals', 'debit amount', 'out', 'paid', 'sent', 'withdrawn', 'paid out',
            'debits', 'withdrawal amount', 'amount debited', 'outflow',
        ];
    }

    /** @return list<string> */
    private function getCreditHeaderCandidates(): array
    {
        return [
            'credit', 'deposit', 'deposits', 'credit amount', 'in', 'received', 'paid in', 'deposited',
            'credits', 'deposit amount', 'amount credited', 'inflow',
        ];
    }

    /** @return list<string> */
    private function getTypeHeaderCandidates(): array
    {
        return [
            'type', 'dr/cr', 'direction', 'dr cr', 'debit/credit', 'transaction type', 'transaction type (credit/debit)',
        ];
    }

    /**
     * Parse a PDF statement into normalized rows.
     * Tries multiple patterns: date at start, amount at end; amount with currency; date anywhere.
     *
     * @return array<int, array<string, mixed>>
     */
    private function parsePdf(string|false $path, ?string $provider = null): array
    {
        if ($path === false) {
            throw new \RuntimeException('Unable to read uploaded file.');
        }

        $parser = new PdfParser();
        $pdf = $parser->parseFile($path);
        $text = $pdf->getText();
        $rows = [];

        // M-Pesa full statement: "Receipt DateTime Description... COMPLETED PaidIn Withdrawal Balance"
        if (stripos($text, 'MPESA') !== false && stripos($text, 'COMPLETED') !== false && preg_match('/\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/', $text)) {
            $mpesaRows = $this->parseMpesaPdfText($text);
            if (!empty($mpesaRows)) {
                return $mpesaRows;
            }
        }

        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];
        $datePattern = '\d{4}-\d{2}-\d{2}|\d{2}/\d{2}/\d{4}|\d{2}-\d{2}-\d{4}|\d{2}\.\d{2}\.\d{4}|\d{1,2}\s+[A-Za-z]{3}\s+\d{4}|\d{1,2}\s+[A-Za-z]+\s+\d{4}';

        // Normalize: replace multiple spaces/newlines with single space for fallback
        $textNormalized = preg_replace('/\s+/', ' ', $text);

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (strlen($trimmed) < 10) {
                continue;
            }

            $date = null;
            $amountString = null;
            $rawType = '';
            $description = '';

            // Pattern 1: DATE at start, then text, then AMOUNT (optional CR/DR) at end
            if (preg_match('/^(?<date>' . $datePattern . ')\s+(?<rest>.+)$/u', $trimmed, $m)) {
                $date = $m['date'];
                $rest = $m['rest'];
                if (preg_match('/(?<amt>-?\d[\d,]*\.?\d*)\s*(?<type>CR|DR|CREDIT|DEBIT)?\s*$/iu', $rest, $am)) {
                    $amountString = $am['amt'];
                    $rawType = isset($am['type']) ? strtolower($am['type']) : '';
                    $description = trim(str_replace($am[0], '', $rest));
                }
            }

            // Pattern 2: Look for amount with optional currency (KES 1,234.56 or -1,234.56)
            if ($amountString === null && preg_match('/(?:KES|USD|\$|EUR|€)\s*(-?\s*\d[\d,]*\.?\d*)\s*$/iu', $trimmed, $cur)) {
                $amountString = str_replace(' ', '', $cur[1]);
                if (preg_match('/^(' . $datePattern . ')/u', $trimmed, $d)) {
                    $date = $d[1];
                }
                $description = trim(preg_replace('/\s*(?:KES|USD|\$|EUR|€)\s*-?\s*\d[\d,]*\.?\d*\s*$/iu', '', $trimmed));
            }

            // Pattern 3: Any line containing a date and a number that looks like money
            if ($amountString === null && preg_match('/(' . $datePattern . ')/u', $trimmed, $d)) {
                $date = $d[1];
                if (preg_match('/(-?\d[\d,]*\.?\d{2})\s*$/u', $trimmed, $am)) {
                    $amountString = str_replace([',', ' '], ['', ''], $am[1]);
                    $description = trim(str_replace([$date, $am[0]], ['', ''], $trimmed));
                }
            }

            if ($date === null || $amountString === null) {
                continue;
            }

            $normalizedAmount = (float) str_replace([',', ' ', '"'], ['', '', ''], $amountString);
            if ($normalizedAmount === 0.0) {
                continue;
            }

            $type = null;
            if (in_array($rawType, ['cr', 'credit'], true)) {
                $type = 'income';
            } elseif (in_array($rawType, ['dr', 'debit'], true)) {
                $type = 'expense';
            }
            if ($type === null) {
                $type = $normalizedAmount > 0 ? 'income' : 'expense';
            }

            $parsedDate = $this->parseDate($date);
            if ($parsedDate === null) {
                continue;
            }

            $rows[] = [
                'date' => $date,
                'description' => $description ?: null,
                'amount' => $normalizedAmount,
                'type' => $type,
            ];
        }

        // Fallback: if no rows from line-by-line, try splitting whole text by date pattern (handles PDFs with poor line breaks)
        if (count($rows) === 0 && strlen($textNormalized) > 20) {
            $chunks = preg_split('/(?=' . $datePattern . ')/u', $textNormalized, -1, PREG_SPLIT_NO_EMPTY);
            foreach ($chunks as $chunk) {
                $chunk = trim($chunk);
                if (strlen($chunk) < 10) {
                    continue;
                }
                if (!preg_match('/^(' . $datePattern . ')\s*(?<rest>.+)$/u', $chunk, $m)) {
                    continue;
                }
                $date = $m['date'];
                $rest = $m['rest'];
                if (!preg_match('/(?<amt>-?\d[\d,]*\.?\d*)\s*$/u', $rest, $am)) {
                    continue;
                }
                $amountString = $am['amt'];
                $normalizedAmount = (float) str_replace([',', ' ', '"'], ['', '', ''], $amountString);
                if ($normalizedAmount === 0.0) {
                    continue;
                }
                $parsedDate = $this->parseDate($date);
                if ($parsedDate === null) {
                    continue;
                }
                $description = trim(str_replace($am[0], '', $rest));
                $type = $normalizedAmount > 0 ? 'income' : 'expense';
                $rows[] = [
                    'date' => $date,
                    'description' => $description ?: null,
                    'amount' => $normalizedAmount,
                    'type' => $type,
                ];
            }
        }

        return $rows;
    }

    /**
     * Parse M-Pesa full statement PDF text.
     * Format: ReceiptNo YYYY-MM-DD HH:MM:SS Description... COMPLETED PaidIn Withdrawal Balance
     *
     * @return array<int, array<string, mixed>>
     */
    private function parseMpesaPdfText(string $text): array
    {
        $rows = [];
        // Receipt (10 alphanumeric), datetime, description (minimal until COMPLETED), then three amounts
        $pattern = '/\b([A-Z0-9]{10})\s+(\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2})\s*(.*?)COMPLETED\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)\s+([\d,]+\.?\d*)/s';
        if (!preg_match_all($pattern, $text, $matches, PREG_SET_ORDER)) {
            return [];
        }
        foreach ($matches as $m) {
            $paidIn = (float) str_replace(',', '', $m[4]);
            $withdrawal = (float) str_replace(',', '', $m[5]);
            if ($paidIn > 0 && $withdrawal > 0) {
                continue; // skip malformed
            }
            $amount = $paidIn > 0 ? $paidIn : -$withdrawal;
            if ($amount === 0.0) {
                continue;
            }
            $description = trim(preg_replace('/\s+/', ' ', $m[3]));
            $parsedDate = $this->parseDate($m[2]);
            if ($parsedDate === null) {
                continue;
            }
            $rows[] = [
                'date' => $m[2],
                'description' => $description ?: null,
                'amount' => $amount,
                'type' => $amount > 0 ? 'income' : 'expense',
            ];
        }
        return $rows;
    }

    /**
     * Find the first index in the header that matches any of the candidate names.
     */
    private function findFirstIndex(array $header, array $candidates): ?int
    {
        foreach ($candidates as $name) {
            $index = array_search($name, $header, true);
            if ($index !== false) {
                return $index;
            }
        }

        return null;
    }

    private function parseDate(string $value): ?Carbon
    {
        $value = trim($value);
        if ($value === '') {
            return null;
        }

        // If value contains space, take only the date part (e.g. "01/12/2024 14:30" -> "01/12/2024")
        if (preg_match('/^\S+\s+\S+/', $value)) {
            $value = trim(preg_split('/\s+/', $value, 2)[0] ?? $value);
        }

        // Strip timezone suffix for ISO-style (e.g. 2024-01-15T10:30:00+03:00)
        $value = preg_replace('/\s*[+-]\d{2}:?\d{2}\s*$/', '', $value);
        $value = preg_replace('/\s*Z\s*$/i', '', $value);

        $formats = [
            'Y-m-d',
            'Y-m-d H:i:s',
            'Y-m-d H:i',
            'd/m/Y',
            'd/m/Y H:i:s',
            'd/m/Y H:i',
            'd-m-Y',
            'd-m-Y H:i',
            'm/d/Y',
            'm/d/Y H:i',
            'd.m.Y',
            'Y/m/d',
            'd M Y',     // 01 Dec 2024
            'd M y',     // 01 Dec 24
            'd F Y',     // 01 December 2024
            'M d, Y',    // Dec 01, 2024
            'F d, Y',    // December 01, 2024
            'd-M-Y',     // 01-Dec-2024
            'd/m/y',     // 01/12/24
            'm-d-Y',
            'j M Y',     // 1 Dec 2024 (no leading zero)
            'j/n/Y',     // 1/1/2024
        ];

        foreach ($formats as $format) {
            try {
                $dt = Carbon::createFromFormat($format, $value);
                if ($dt !== false) {
                    return $dt;
                }
            } catch (\Throwable) {
                // Try next format
            }
        }

        try {
            return Carbon::parse($value);
        } catch (\Throwable) {
            return null;
        }
    }
}

