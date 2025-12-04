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
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('account_id')->constrained()->onDelete('cascade');
            $table->enum('type', ['income', 'expense', 'transfer']);
            $table->decimal('amount', 15, 2);
            $table->string('category'); // e.g., salary, groceries, rent, utilities
            $table->string('description')->nullable();
            $table->date('transaction_date');
            $table->foreignId('transfer_to_account_id')->nullable()->constrained('accounts')->onDelete('set null'); // For transfers
            $table->string('payment_method')->nullable(); // cash, card, bank transfer
            $table->string('reference_number')->nullable();
            $table->boolean('is_recurring')->default(false);
            $table->string('recurring_frequency')->nullable(); // daily, weekly, monthly, yearly
            $table->text('notes')->nullable();
            $table->timestamps();

            // Indexes for better query performance
            $table->index('transaction_date');
            $table->index(['user_id', 'transaction_date']);
            $table->index(['account_id', 'type']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('transactions');
    }
};

