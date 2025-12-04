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
        Schema::create('budgets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('category'); // Category name (matches transaction categories)
            $table->decimal('amount', 15, 2); // Budget limit
            $table->enum('period', ['weekly', 'monthly', 'yearly'])->default('monthly');
            $table->date('start_date');
            $table->date('end_date')->nullable(); // null = ongoing
            $table->boolean('is_active')->default(true);
            $table->boolean('alert_enabled')->default(true);
            $table->integer('alert_threshold')->default(80); // Alert when 80% spent
            $table->timestamps();

            // Indexes
            $table->index(['user_id', 'is_active']);
            $table->index(['start_date', 'end_date']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('budgets');
    }
};

