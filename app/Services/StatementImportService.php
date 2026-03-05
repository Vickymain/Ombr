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
     * Import transactions for an account from an uploaded statement file.
     *
     * @return int Number of transactions created
     */
    public function importFromUploadedFile(UploadedFile $file, User $user, Account $account, string $defaultCategory = 'Imported'): int
    {
        $extension = strtolower($file->getClientOriginalExtension());

        if (in_array($extension, ['csv', 'txt'], true)) {
            $rows = $this->parseCsv($file->getRealPath());
        } elseif ($extension === 'pdf') {
            $rows = $this->parsePdf($file->getRealPath(), $account->provider);
        } else {
            throw new \InvalidArgumentException('Unsupported statement file type.');
        }

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

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'account_id' => $account->id,
                'type' => $type,
                'amount' => abs($amount),
                'category' => $row['category'] ?? $defaultCategory,
                'description' => $row['description'] ?? null,
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
     * Parse a CSV or TXT file into normalized rows.
     *
     * @return array<int, array<string, mixed>>
     */
    private function parseCsv(string|false $path): array
    {
        if ($path === false) {
            throw new \RuntimeException('Unable to read uploaded file.');
        }

        $handle = fopen($path, 'r');
        if ($handle === false) {
            throw new \RuntimeException('Unable to open uploaded file.');
        }

        $header = fgetcsv($handle);
        if ($header === false) {
            fclose($handle);
            throw new \RuntimeException('The uploaded file appears to be empty.');
        }

        $header = array_map(static fn ($h) => strtolower(trim((string) $h)), $header);

        $dateIndex = $this->findFirstIndex($header, ['date', 'transaction date', 'value date']);
        $descriptionIndex = $this->findFirstIndex($header, ['description', 'details', 'narration', 'memo']);
        $amountIndex = $this->findFirstIndex($header, ['amount', 'amt']);
        $debitIndex = $this->findFirstIndex($header, ['debit', 'withdrawal']);
        $creditIndex = $this->findFirstIndex($header, ['credit', 'deposit']);
        $typeIndex = $this->findFirstIndex($header, ['type', 'dr/cr', 'direction']);

        if ($dateIndex === null || ($amountIndex === null && $debitIndex === null && $creditIndex === null)) {
            fclose($handle);
            throw new \RuntimeException('Statement must include at least a date column and an amount, debit, or credit column.');
        }

        $rows = [];

        while (($row = fgetcsv($handle)) !== false) {
            $maxIndex = max(
                $dateIndex,
                $descriptionIndex ?? 0,
                $amountIndex ?? 0,
                $debitIndex ?? 0,
                $creditIndex ?? 0,
                $typeIndex ?? 0,
            );

            if (count($row) <= $maxIndex) {
                continue;
            }

            $rawDate = $row[$dateIndex] ?? null;
            if ($rawDate === null || $rawDate === '') {
                continue;
            }

            $rawAmount = null;
            $type = null;

            if ($amountIndex !== null && isset($row[$amountIndex]) && $row[$amountIndex] !== '') {
                $rawAmount = $row[$amountIndex];
            } elseif ($debitIndex !== null && isset($row[$debitIndex]) && $row[$debitIndex] !== '') {
                $rawAmount = '-' . $row[$debitIndex];
            } elseif ($creditIndex !== null && isset($row[$creditIndex]) && $row[$creditIndex] !== '') {
                $rawAmount = $row[$creditIndex];
            }

            if ($rawAmount === null || $rawAmount === '') {
                continue;
            }

            $normalizedAmount = (float) str_replace([',', ' '], ['', ''], $rawAmount);
            if ($normalizedAmount === 0.0) {
                continue;
            }

            if ($typeIndex !== null && isset($row[$typeIndex])) {
                $rawType = strtolower(trim((string) $row[$typeIndex]));
                if (in_array($rawType, ['income', 'credit', 'cr'], true)) {
                    $type = 'income';
                } elseif (in_array($rawType, ['expense', 'debit', 'dr'], true)) {
                    $type = 'expense';
                }
            }

            if ($type === null) {
                $type = $normalizedAmount > 0 ? 'income' : 'expense';
            }

            $rows[] = [
                'date' => $rawDate,
                'description' => $descriptionIndex !== null ? ($row[$descriptionIndex] ?? null) : null,
                'amount' => $normalizedAmount,
                'type' => $type,
            ];
        }

        fclose($handle);

        return $rows;
    }

    /**
     * Parse a PDF statement into normalized rows.
     *
     * This is a generic parser that tries to detect lines with a date and amount.
     * For best results, we can later add provider-specific parsers.
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

        $lines = preg_split('/\r\n|\r|\n/', $text) ?: [];
        $rows = [];

        foreach ($lines as $line) {
            $trimmed = trim($line);
            if ($trimmed === '') {
                continue;
            }

            // Try to match: DATE ... DESCRIPTION ... AMOUNT [TYPE]
            if (!preg_match('/^(?<date>\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4})\s+(?<rest>.+)$/', $trimmed, $matches)) {
                continue;
            }

            $date = $matches['date'];
            $rest = $matches['rest'];

            // Amount is usually the last number in the line.
            if (!preg_match('/(-?\d[\d,]*\.?\d*)\s*(?<type>CR|DR|CREDIT|DEBIT)?\s*$/i', $rest, $amountMatches)) {
                continue;
            }

            $amountString = $amountMatches[1];
            $rawType = isset($amountMatches['type']) ? strtolower((string) $amountMatches['type']) : '';

            $normalizedAmount = (float) str_replace([',', ' '], ['', ''], $amountString);
            if ($normalizedAmount === 0.0) {
                continue;
            }

            // Description is everything in between date and amount.
            $description = trim(str_replace($amountMatches[0], '', $rest));

            $type = null;
            if (in_array($rawType, ['cr', 'credit'], true)) {
                $type = 'income';
            } elseif (in_array($rawType, ['dr', 'debit'], true)) {
                $type = 'expense';
            }

            if ($type === null) {
                $type = $normalizedAmount > 0 ? 'income' : 'expense';
            }

            $rows[] = [
                'date' => $date,
                'description' => $description,
                'amount' => $normalizedAmount,
                'type' => $type,
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

        $formats = [
            'Y-m-d',
            'd/m/Y',
            'd-m-Y',
            'm/d/Y',
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

