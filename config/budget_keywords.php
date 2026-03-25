<?php

/**
 * Keywords matched against transaction description (case-insensitive) when the
 * transaction category is generic (e.g. Imported) so spending still counts toward budgets.
 * Keys must match CategoryNormalizer::canonical() of the budget category name.
 */
return [
    'groceries' => ['naivas', 'carrefour', 'tuskys', 'quickmart', 'chandarana', 'choppies', 'foodplus', 'supermarket', 'grocery', 'woolworths'],
    'dining out' => ['restaurant', 'cafe', 'café', 'pizza', 'burger', 'kfc', 'domino', 'ubereats', 'uber eats', 'deliveroo', 'dining'],
    'transportation' => ['uber', 'bolt', 'taxi', 'matatu', 'fuel', 'petrol', 'shell', 'total', 'parking', 'ntsa'],
    'utilities' => ['kplc', 'electric', 'water bill', 'internet', 'safaricom fiber', 'zuku', 'dstv'],
    'entertainment' => ['netflix', 'spotify', 'cinema', 'youtube premium', 'showmax', 'steam', 'playstation', 'xbox'],
    'subscriptions' => ['netflix', 'spotify', 'showmax', 'dstv', 'icloud', 'google one', 'dropbox', 'adobe', 'microsoft 365', 'subscription', 'prime video'],
    'shopping' => ['amazon', 'jumia', 'kilimall', 'shein', 'mall', 'boutique'],
    'personal care' => ['salon', 'barber', 'spa', 'cosmetic'],
    'healthcare' => ['hospital', 'clinic', 'pharmacy', 'nhif', 'medical'],
    'fitness' => ['gym', 'fitness', 'peloton'],
    'travel' => ['airline', 'booking.com', 'airbnb', 'hotel', 'flight'],
    'education' => ['school', 'tuition', 'course', 'udemy', 'coursera'],
    'rent/mortgage' => ['rent', 'mortgage', 'landlord'],
    'insurance' => ['insurance', 'britam', 'apa', 'cic insurance'],
    'gifts & donations' => ['donation', 'charity', 'gift'],
    'taxes' => ['kra', 'tax', 'withholding'],
];
