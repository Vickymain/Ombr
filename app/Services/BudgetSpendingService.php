<?php

namespace App\Services;

use App\Models\Budget;
use App\Models\Category;
use App\Models\UserCategoryKeyword;
use App\Support\CategoryNormalizer;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\Relation;

class BudgetSpendingService
{
    /**
     * Spending window for the budget: respects explicit end_date, otherwise rolls by period
     * (current month / week / year) clipped to today and budget start_date.
     *
     * @return array{0: Carbon, 1: Carbon}
     */
    public function periodWindow(Budget $budget): array
    {
        $now = Carbon::now();
        $budgetStart = Carbon::parse($budget->start_date)->startOfDay();

        if ($budget->end_date) {
            $end = Carbon::parse($budget->end_date)->endOfDay();
            if ($end->greaterThan($now)) {
                $end = $now->copy()->endOfDay();
            }

            return [$budgetStart, $end];
        }

        return match ($budget->period) {
            'weekly' => $this->weeklyWindow($budgetStart, $now),
            'yearly' => $this->yearlyWindow($budgetStart, $now),
            default => $this->monthlyWindow($budgetStart, $now),
        };
    }

    /**
     * Human label for the current evaluation window (e.g. "Mar 1 – Mar 25, 2026").
     */
    public function periodLabel(Budget $budget): string
    {
        [$start, $end] = $this->periodWindow($budget);
        if ($start->isSameDay($end)) {
            return $start->format('M j, Y');
        }

        return $start->format('M j') . ' – ' . $end->format('M j, Y');
    }

    /**
     * Total expense amount matching this budget's category inside the computed window.
     *
     * @param  Builder<\App\Models\Transaction>|Relation  $transactionQuery  Scoped query or relation (e.g. $user->transactions())
     */
    public function sumSpent(Builder|Relation $transactionQuery, Budget $budget): float
    {
        $builder = $transactionQuery instanceof Relation
            ? $transactionQuery->getQuery()
            : $transactionQuery;

        [$start, $end] = $this->periodWindow($budget);

        $q = $builder->clone()
            ->where('type', 'expense')
            ->whereBetween('transaction_date', [$start->toDateString(), $end->toDateString()]);

        $this->applyBudgetCategoryScope($q, $budget);

        return (float) ($q->sum('amount') ?? 0);
    }

    /**
     * @param  Builder<\App\Models\Transaction>  $query
     */
    public function applyBudgetCategoryScope(Builder $query, Budget $budget): void
    {
        $aliases = $this->categoryAliasStrings($budget);
        $keywords = $this->keywordsForCanonicalCategory(
            CategoryNormalizer::canonical($budget->category),
            $budget->user_id
        );
        $query->where(function (Builder $outer) use ($aliases, $keywords) {
            $outer->whereIn('category', $aliases);

            if ($keywords !== []) {
                $outer->orWhere(function (Builder $inner) use ($keywords) {
                    $inner->where(function (Builder $desc) use ($keywords) {
                        foreach ($keywords as $kw) {
                            $desc->orWhere('description', 'LIKE', '%' . $kw . '%');
                        }
                    });
                });
            }
        });
    }

    /**
     * Global config keywords plus this user's custom phrases for an expense category (canonical key).
     *
     * @return list<string>
     */
    public function keywordsForCanonicalCategory(string $canonicalKey, int $userId): array
    {
        $fromConfig = config('budget_keywords.' . $canonicalKey, []);
        $fromUser = UserCategoryKeyword::query()
            ->where('user_id', $userId)
            ->where('category_key', $canonicalKey)
            ->pluck('keyword')
            ->all();

        $merged = array_merge($fromConfig, $fromUser);
        $seen = [];
        $out = [];

        foreach ($merged as $k) {
            if ($k === null || $k === '') {
                continue;
            }
            $norm = mb_strtolower((string) $k);
            if (isset($seen[$norm])) {
                continue;
            }
            $seen[$norm] = true;
            $out[] = $k;
        }

        return $out;
    }

    /**
     * @return list<string>
     */
    public function categoryAliasStrings(Budget $budget): array
    {
        $canon = CategoryNormalizer::canonical($budget->category);

        $names = Category::query()
            ->where(function (Builder $q) use ($budget) {
                $q->whereNull('user_id')
                    ->orWhere('user_id', $budget->user_id);
            })
            ->get(['name', 'icon']);

        $out = collect();
        foreach ($names as $c) {
            if (CategoryNormalizer::canonical($c->name) !== $canon) {
                continue;
            }
            $out->push($c->name);
            if ($c->icon) {
                $out->push(trim($c->icon . ' ' . $c->name));
                $out->push(trim($c->icon . $c->name));
            }
        }

        $out->push($budget->category);

        $withCaseVariants = collect();
        foreach ($out as $label) {
            $withCaseVariants->push($label);
            $withCaseVariants->push(mb_strtolower($label));
            $withCaseVariants->push(mb_convert_case($label, MB_CASE_TITLE, 'UTF-8'));
        }

        return $withCaseVariants->unique()->filter()->values()->all();
    }

    private function monthlyWindow(Carbon $budgetStart, Carbon $now): array
    {
        $monthStart = $now->copy()->startOfMonth();
        $monthEnd = $now->copy()->endOfDay();
        $start = $monthStart->greaterThan($budgetStart) ? $monthStart : $budgetStart;

        return [$start->copy()->startOfDay(), $monthEnd];
    }

    private function weeklyWindow(Carbon $budgetStart, Carbon $now): array
    {
        $weekStart = $now->copy()->startOfWeek();
        $weekEnd = $now->copy()->endOfDay();
        $start = $weekStart->greaterThan($budgetStart) ? $weekStart : $budgetStart;

        return [$start->copy()->startOfDay(), $weekEnd];
    }

    private function yearlyWindow(Carbon $budgetStart, Carbon $now): array
    {
        $yearStart = $now->copy()->startOfYear();
        $yearEnd = $now->copy()->endOfDay();
        $start = $yearStart->greaterThan($budgetStart) ? $yearStart : $budgetStart;

        return [$start->copy()->startOfDay(), $yearEnd];
    }
}
