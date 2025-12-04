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
        Schema::create('accounts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('provider'); // Bank/Institution name (e.g., Chase, Wells Fargo)
            $table->string('account_name'); // Custom name for the account
            $table->string('account_number')->nullable(); // Account number (optional)
            $table->string('account_type'); // checking, savings, credit, investment, etc.
            $table->decimal('balance', 15, 2)->default(0); // Current balance
            $table->string('currency', 3)->default('USD'); // Currency code
            $table->boolean('is_active')->default(true); // Active/Inactive status
            $table->text('notes')->nullable(); // Optional notes
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('accounts');
    }
};
