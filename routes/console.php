<?php

use App\Services\StatementImportService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/**
 * Inspect a statement file (PDF or CSV) and output its raw content.
 * Use this to see what the import engine "sees" so we can fix parsing.
 * Example: php artisan statement:inspect "C:\Users\Wanjohi\Desktop\Feb Transactions Ombr.pdf"
 */
Artisan::command('statement:inspect {file : Path to CSV or PDF file}', function () {
    $path = $this->argument('file');
    if (!is_file($path)) {
        $this->error("File not found: {$path}");
        return 1;
    }
    $ext = strtolower(pathinfo($path, PATHINFO_EXTENSION));
    if ($ext === 'pdf') {
        if (!class_exists(\Smalot\PdfParser\Parser::class)) {
            $this->error('PDF parser not installed. Run: composer require smalot/pdfparser');
            $this->line('Then run this command again and paste the output to adapt the parser.');
            return 1;
        }
        $importService = app(StatementImportService::class);
        $text = $importService->getPdfRawText($path);
        $this->line('=== PDF extracted text (first 8000 chars) ===');
        $this->line(substr($text, 0, 8000));
        if (strlen($text) > 8000) {
            $this->line('... [truncated, total ' . strlen($text) . ' chars]');
        }
        return 0;
    }
    if (in_array($ext, ['csv', 'txt'], true)) {
        $content = file_get_contents($path);
        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content);
        $lines = preg_split('/\r\n|\r|\n/', $content, 31);
        $first30 = array_slice($lines, 0, 30);
        $this->line('=== First 30 lines of CSV/TXT ===');
        foreach ($first30 as $i => $line) {
            $this->line(($i + 1) . ': ' . $line);
        }
        return 0;
    }
    $this->error('Unsupported file type. Use .pdf, .csv or .txt');
    return 1;
})->purpose('Inspect statement file content to debug import parsing');
