<?php

namespace App\Support;

use App\Models\User;

class HeaderSearchSuggestions
{
    /**
     * Short phrases for the header search autocomplete (recent transactions, accounts, categories).
     *
     * @return list<string>
     */
    public static function forUser(?User $user): array
    {
        if ($user === null) {
            return [];
        }

        return $user->transactions()
            ->with('account')
            ->orderBy('transaction_date', 'desc')
            ->take(200)
            ->get()
            ->map(function ($t) {
                return [
                    'description' => $t->description,
                    'category' => $t->category,
                    'account_name' => $t->account?->account_name,
                    'provider' => $t->account?->provider,
                ];
            })
            ->flatMap(fn ($item) => array_filter(array_values($item)))
            ->unique()
            ->values()
            ->take(50)
            ->all();
    }
}
