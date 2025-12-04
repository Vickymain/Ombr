<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'account_id',
        'type',
        'amount',
        'category',
        'description',
        'transaction_date',
        'transfer_to_account_id',
        'payment_method',
        'reference_number',
        'is_recurring',
        'recurring_frequency',
        'notes',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'amount' => 'decimal:2',
            'transaction_date' => 'date',
            'is_recurring' => 'boolean',
        ];
    }

    /**
     * A transaction belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * A transaction belongs to an account.
     */
    public function account()
    {
        return $this->belongsTo(Account::class);
    }

    /**
     * For transfers, the destination account.
     */
    public function transferToAccount()
    {
        return $this->belongsTo(Account::class, 'transfer_to_account_id');
    }

    /**
     * Scope for filtering by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope for filtering by date range.
     */
    public function scopeBetweenDates($query, $startDate, $endDate)
    {
        return $query->whereBetween('transaction_date', [$startDate, $endDate]);
    }

    /**
     * Scope for filtering by category.
     */
    public function scopeInCategory($query, $category)
    {
        return $query->where('category', $category);
    }
}

