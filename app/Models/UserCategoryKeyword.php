<?php

namespace App\Models;

use App\Support\CategoryNormalizer;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserCategoryKeyword extends Model
{
    protected $fillable = [
        'user_id',
        'category_key',
        'keyword',
    ];

    protected static function booted(): void
    {
        static::saving(function (UserCategoryKeyword $row) {
            $row->category_key = CategoryNormalizer::canonical($row->category_key);
            $row->keyword = mb_strtolower(trim($row->keyword));
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
