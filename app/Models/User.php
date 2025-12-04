<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * The attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * A user can have many accounts.
     */
    public function accounts()
    {
        return $this->hasMany(Account::class);
    }

    /**
     * A user can have many transactions.
     */
    public function transactions()
    {
        return $this->hasMany(Transaction::class);
    }

    /**
     * A user can have many budgets.
     */
    public function budgets()
    {
        return $this->hasMany(Budget::class);
    }

    /**
     * A user can have custom categories.
     */
    public function categories()
    {
        return $this->hasMany(Category::class);
    }
}
