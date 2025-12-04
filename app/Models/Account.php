<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Account extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'provider',
        'account_name',
        'account_number',
        'account_type',
        'balance',
        'currency',
        'is_active',
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
            'balance' => 'decimal:2',
            'is_active' => 'boolean',
        ];
    }

    /**
     * An account belongs to a user.
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * An account can have many transactions.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }
}
