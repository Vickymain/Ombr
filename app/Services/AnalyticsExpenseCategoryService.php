<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Transaction;
use App\Models\User;
use App\Support\CategoryNormalizer;
use Illuminate\Support\Collection;

class AnalyticsExpenseCategoryService
{
    /** @var list<string> */
    private const GENERIC_CANONICAL = ['imported', 'uncategorised', 'uncategorized', 'other expense', ''];

    public function __construct(
        protected BudgetSpendingService $budgetSpending,
    ) {
    }

    /**
     * Map an expense row to a display label from the user's expense categories (emoji + name when set).
     * Generic/imported rows are inferred from description using the same keyword lists as budgets.
     */
    public function displayLabelForExpense(Transaction $tx, User $user, Collection $expenseCategories): string
    {
        $raw = (string) ($tx->category ?? '');
        $sorted = $expenseCategories->sortBy('sort_order')->values();

        foreach ($sorted as $cat) {
            if ($this->transactionMatchesCategoryLabel($raw, $cat)) {
                return $this->formatCategoryLabel($cat);
            }
        }

        if ($this->shouldInferFromDescription($raw)) {
            $desc = mb_strtolower((string) ($tx->description ?? ''));
            foreach ($sorted as $cat) {
                $key = CategoryNormalizer::canonical($cat->name);
                foreach ($this->budgetSpending->keywordsForCanonicalCategory($key, $user->id) as $kw) {
                    $kwLower = mb_strtolower((string) $kw);
                    if ($kwLower !== '' && mb_strpos($desc, $kwLower) !== false) {
                        return $this->formatCategoryLabel($cat);
                    }
                }
            }

            return 'Other';
        }

        return $raw !== '' ? $raw : 'Other';
    }

    private function transactionMatchesCategoryLabel(string $raw, Category $cat): bool
    {
        if ($raw === '') {
            return false;
        }

        $canonTx = CategoryNormalizer::canonical($raw);
        $canonName = CategoryNormalizer::canonical($cat->name);
        if ($canonTx === $canonName) {
            return true;
        }

        if ($cat->icon) {
            $a = CategoryNormalizer::canonical(trim($cat->icon.' '.$cat->name));
            $b = CategoryNormalizer::canonical(trim($cat->icon.$cat->name));
            if ($canonTx === $a || $canonTx === $b) {
                return true;
            }
        }

        return false;
    }

    private function shouldInferFromDescription(string $raw): bool
    {
        return in_array(CategoryNormalizer::canonical($raw), self::GENERIC_CANONICAL, true);
    }

    private function formatCategoryLabel(Category $cat): string
    {
        return $cat->icon ? trim($cat->icon.' '.$cat->name) : $cat->name;
    }
}
