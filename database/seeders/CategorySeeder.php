<?php

namespace Database\Seeders;

use App\Models\Category;
use Illuminate\Database\Seeder;

class CategorySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $categories = [
            // Income Categories
            ['name' => 'Salary', 'type' => 'income', 'icon' => '💼', 'color' => '#10b981', 'sort_order' => 1],
            ['name' => 'Freelance', 'type' => 'income', 'icon' => '💻', 'color' => '#10b981', 'sort_order' => 2],
            ['name' => 'Investment', 'type' => 'income', 'icon' => '📈', 'color' => '#10b981', 'sort_order' => 3],
            ['name' => 'Rental Income', 'type' => 'income', 'icon' => '🏠', 'color' => '#10b981', 'sort_order' => 4],
            ['name' => 'Business', 'type' => 'income', 'icon' => '🏢', 'color' => '#10b981', 'sort_order' => 5],
            ['name' => 'Gift', 'type' => 'income', 'icon' => '🎁', 'color' => '#10b981', 'sort_order' => 6],
            ['name' => 'Other Income', 'type' => 'income', 'icon' => '💰', 'color' => '#10b981', 'sort_order' => 7],

            // Expense Categories
            ['name' => 'Groceries', 'type' => 'expense', 'icon' => '🛒', 'color' => '#ef4444', 'sort_order' => 10],
            ['name' => 'Dining Out', 'type' => 'expense', 'icon' => '🍽️', 'color' => '#ef4444', 'sort_order' => 11],
            ['name' => 'Transportation', 'type' => 'expense', 'icon' => '🚗', 'color' => '#ef4444', 'sort_order' => 12],
            ['name' => 'Utilities', 'type' => 'expense', 'icon' => '💡', 'color' => '#ef4444', 'sort_order' => 13],
            ['name' => 'Rent/Mortgage', 'type' => 'expense', 'icon' => '🏡', 'color' => '#ef4444', 'sort_order' => 14],
            ['name' => 'Healthcare', 'type' => 'expense', 'icon' => '⚕️', 'color' => '#ef4444', 'sort_order' => 15],
            ['name' => 'Insurance', 'type' => 'expense', 'icon' => '🛡️', 'color' => '#ef4444', 'sort_order' => 16],
            ['name' => 'Entertainment', 'type' => 'expense', 'icon' => '🎬', 'color' => '#ef4444', 'sort_order' => 17],
            ['name' => 'Shopping', 'type' => 'expense', 'icon' => '🛍️', 'color' => '#ef4444', 'sort_order' => 18],
            ['name' => 'Education', 'type' => 'expense', 'icon' => '📚', 'color' => '#ef4444', 'sort_order' => 19],
            ['name' => 'Travel', 'type' => 'expense', 'icon' => '✈️', 'color' => '#ef4444', 'sort_order' => 20],
            ['name' => 'Subscriptions', 'type' => 'expense', 'icon' => '📱', 'color' => '#ef4444', 'sort_order' => 21],
            ['name' => 'Personal Care', 'type' => 'expense', 'icon' => '💅', 'color' => '#ef4444', 'sort_order' => 22],
            ['name' => 'Fitness', 'type' => 'expense', 'icon' => '💪', 'color' => '#ef4444', 'sort_order' => 23],
            ['name' => 'Gifts & Donations', 'type' => 'expense', 'icon' => '🎁', 'color' => '#ef4444', 'sort_order' => 24],
            ['name' => 'Taxes', 'type' => 'expense', 'icon' => '📝', 'color' => '#ef4444', 'sort_order' => 25],
            ['name' => 'Other Expense', 'type' => 'expense', 'icon' => '💸', 'color' => '#ef4444', 'sort_order' => 26],
        ];

        foreach ($categories as $category) {
            Category::create(array_merge($category, [
                'is_system' => true,
                'user_id' => null, // System-wide category
            ]));
        }
    }
}

