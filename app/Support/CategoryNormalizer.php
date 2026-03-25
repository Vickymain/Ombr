<?php

namespace App\Support;

class CategoryNormalizer
{
    /**
     * Stable lowercase key for matching (strips leading emoji / symbols used in UI labels).
     */
    public static function canonical(?string $name): string
    {
        if ($name === null || $name === '') {
            return '';
        }
        $s = trim($name);
        // Strip leading emoji / pictographs so "🛒 Groceries" matches "Groceries"
        $s = preg_replace('/^[\p{Extended_Pictographic}\p{So}\s]+/u', '', $s);
        $s = trim($s);

        return mb_strtolower($s);
    }
}
