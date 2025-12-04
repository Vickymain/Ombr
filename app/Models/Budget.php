<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Budget extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'category',
        'amount',
        'period',
        'start_date',
        'end_date',
        'is_active',
        'alert_enabled',
        'alert_threshold',
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
            'start_date' => 'date',
            'end_date' => 'date',
            'is_active' => 'boolean',
            'alert_enabled' => 'boolean',
            'alert_threshold' => 'integer',
        ];
    }

    /**
     * A budget belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for active budgets.
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope for budgets within a specific period.
     */
    public function scopeForPeriod($query, $date)
    {
        return $query->where('start_date', '<=', $date)
            ->where(function ($q) use ($date) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', $date);
            });
    }
}

