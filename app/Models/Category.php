<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Category extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'user_id',
        'name',
        'type',
        'icon',
        'color',
        'is_system',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
            'sort_order' => 'integer',
        ];
    }

    /**
     * A category can belong to a user (or be system-wide).
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Scope for system categories.
     */
    public function scopeSystem($query)
    {
        return $query->where('is_system', true);
    }

    /**
     * Scope for user-specific categories.
     */
    public function scopeForUser($query, $userId)
    {
        return $query->where('user_id', $userId);
    }

    /**
     * Scope for filtering by type.
     */
    public function scopeOfType($query, $type)
    {
        return $query->whereIn('type', [$type, 'both']);
    }
}

