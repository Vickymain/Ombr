<?php

namespace App\Support;

class ChartCategoryLabel
{
    /**
     * Merge generic stored categories into a single “Other” slice in charts (no Uncategorized / Imported labels).
     */
    public static function foldGenericSlices(string $label): string
    {
        $c = mb_strtolower(trim($label));
        if ($c === '') {
            return 'Other';
        }
        if (in_array($c, [
            'uncategorised',
            'uncategorized',
            'imported',
            'other expense',
        ], true)) {
            return 'Other';
        }

        return $label;
    }
}
