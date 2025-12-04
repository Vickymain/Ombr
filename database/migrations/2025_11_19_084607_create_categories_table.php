<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('cascade'); // null = system-wide category
            $table->string('name');
            $table->enum('type', ['income', 'expense', 'both'])->default('both');
            $table->string('icon')->nullable(); // icon class or emoji
            $table->string('color')->nullable(); // hex color code for UI
            $table->boolean('is_system')->default(false); // system vs user-defined
            $table->integer('sort_order')->default(0);
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};

