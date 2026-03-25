<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_category_keywords', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('category_key', 120);
            $table->string('keyword', 120);
            $table->timestamps();

            $table->unique(['user_id', 'category_key', 'keyword']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_category_keywords');
    }
};
