/**
 * Parse a transaction's description and type to produce a human-friendly label
 * and extract the counterparty (organization/person).
 *
 * Returns { action, counterparty, displayLabel }
 */
export function parseTransactionLabel(transaction) {
    const desc = (transaction.description || '').trim();
    const type = (transaction.type || '').toLowerCase();
    const category = (transaction.category || '').trim();

    let action = null;
    let counterparty = null;

    // --- M-Pesa specific patterns ---
    if (/customer\s+transfer\s+to\s+/i.test(desc)) {
        action = 'Sent';
        counterparty = extractNamedCounterparty(desc, /customer\s+transfer\s+to\s+/i);
    } else if (/funds?\s+received\s+from\s+/i.test(desc)) {
        action = 'Received';
        counterparty = extractNamedCounterparty(desc, /funds?\s+received\s+from\s+/i);
    } else if (/pay\s+bill.*?to\s+/i.test(desc)) {
        action = 'Paid';
        counterparty = extractNamedCounterparty(desc, /pay\s+bill.*?to\s+/i);
    } else if (/buy\s+goods.*?(?:to|from|at)\s+/i.test(desc)) {
        action = 'Paid';
        counterparty = extractNamedCounterparty(desc, /buy\s+goods.*?(?:to|from|at)\s+/i);
    } else if (/merchant\s+payment.*?(?:to|at)\s+/i.test(desc)) {
        action = 'Paid';
        counterparty = extractNamedCounterparty(desc, /merchant\s+payment.*?(?:to|at)\s+/i);
    } else if (/customer\s+transfer\s+of\s+funds?\s+charge/i.test(desc)) {
        action = 'Paid';
        counterparty = 'Service Fee';
    } else if (/(?:airtime|top[\s-]?up)/i.test(desc)) {
        action = 'Paid';
        counterparty = 'Airtime';
    } else if (/withdraw/i.test(desc)) {
        action = 'Withdrawn';
        counterparty = extractCleanName(desc);
    } else if (/deposit/i.test(desc)) {
        action = 'Deposited';
        counterparty = extractCleanName(desc);

    // --- Generic bank patterns ---
    } else if (/(?:transfer|sent)\s+to\s+/i.test(desc)) {
        action = 'Sent';
        counterparty = extractNamedCounterparty(desc, /(?:transfer|sent)\s+to\s+/i);
    } else if (/(?:received|from)\s+/i.test(desc) && type === 'income') {
        action = 'Received';
        counterparty = extractNamedCounterparty(desc, /(?:received\s+from|from)\s+/i) || extractCleanName(desc);
    } else if (/payment\s+(?:to|for)\s+/i.test(desc)) {
        action = 'Paid';
        counterparty = extractNamedCounterparty(desc, /payment\s+(?:to|for)\s+/i);
    } else if (/(?:charge|fee|deduction|debit)\s*/i.test(desc)) {
        action = 'Paid';
        counterparty = extractCleanName(desc) || 'Charge';
    } else if (/transfer/i.test(desc)) {
        action = 'Transfer';
        counterparty = extractCleanName(desc);
    }

    // Fallback based on type
    if (!action) {
        if (type === 'income') action = 'Received';
        else if (type === 'expense') action = 'Paid';
        else if (type === 'transfer') action = 'Transfer';
        else action = 'Transaction';
    }

    // Clean counterparty
    if (counterparty) {
        counterparty = counterparty
            .replace(/[-–—]\s*$/, '')
            .replace(/\s+/g, ' ')
            .trim();
        // Title case if all uppercase or all lowercase
        if (counterparty === counterparty.toUpperCase() || counterparty === counterparty.toLowerCase()) {
            counterparty = toTitleCase(counterparty);
        }
        if (counterparty.length > 40) counterparty = counterparty.slice(0, 40) + '…';
        if (counterparty.length < 2) counterparty = null;
    }

    // If no counterparty extracted, try the category if it's not "Imported"
    if (!counterparty && category && category !== 'Imported' && category !== 'Uncategorised') {
        counterparty = category;
    }

    const displayLabel = counterparty ? `${action}, ${counterparty}` : action;

    return { action, counterparty, displayLabel };
}

function extractNamedCounterparty(desc, pattern) {
    const match = desc.match(pattern);
    if (!match) return null;
    let rest = desc.slice(match.index + match[0].length).trim();
    // Take first meaningful segment
    rest = rest.split(/\s*[-–—|\.]\s*/)[0].trim();

    // If the result is purely numeric (a phone number), try to find a name elsewhere in the description
    if (/^\d[\d\s*]+$/.test(rest)) {
        const name = findNameInDescription(desc);
        if (name) return name;
        return null;
    }

    // If it starts with a phone number followed by a name, extract the name
    const phoneNameMatch = rest.match(/^(?:\+?\d[\d\s*]{6,})\s+(.+)/);
    if (phoneNameMatch && phoneNameMatch[1]) {
        return phoneNameMatch[1].trim();
    }

    // Strip leading phone numbers
    rest = rest.replace(/^\+?\d[\d\s*]{6,}\s*/, '').trim();
    if (!rest) {
        const name = findNameInDescription(desc);
        if (name) return name;
        return null;
    }

    return rest || null;
}

function findNameInDescription(desc) {
    // Look for capitalized words that form a name (2+ words starting with uppercase)
    const namePattern = /\b([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)\b/;
    const match = desc.match(namePattern);
    if (match) {
        const candidate = match[1].trim();
        // Filter out common non-name phrases
        const skipWords = /^(Customer Transfer|Funds Received|Pay Bill|Buy Goods|Merchant Payment|Bank Transfer|Mobile Money|Service Fee|Transaction Fee)/i;
        if (!skipWords.test(candidate) && candidate.length >= 4 && candidate.length < 50) {
            return candidate;
        }
    }

    // Also try all-caps names (like "IRENE WANJOHI")
    const allCapsPattern = /\b([A-Z]{2,}(?:\s+[A-Z]{2,})+)\b/;
    const capsMatch = desc.match(allCapsPattern);
    if (capsMatch) {
        const candidate = capsMatch[1].trim();
        const skipWords = /^(CUSTOMER TRANSFER|FUNDS RECEIVED|PAY BILL|BUY GOODS|MERCHANT PAYMENT|BANK TRANSFER|MOBILE MONEY|SERVICE FEE|TRANSACTION FEE)/i;
        if (!skipWords.test(candidate) && candidate.length >= 4 && candidate.length < 50) {
            return candidate;
        }
    }

    return null;
}

function extractCleanName(desc) {
    // Remove common transaction keywords and phone numbers, keep names
    const cleaned = desc
        .replace(/\b(Customer|Transfer|Funds?|Charge|Payment|Transaction|via|API|of|to|from|the|a|an|at|for|on|Withdraw|Deposit|ATM|Agent|Received|Sent)\b/gi, '')
        .replace(/\b\+?\d[\d\s*]{6,}\b/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    if (cleaned.length > 2 && cleaned.length < 50) {
        // If it has at least one alphabetic character, return it
        if (/[a-zA-Z]/.test(cleaned)) return cleaned;
    }

    // Fallback: try to find a name in the original description
    return findNameInDescription(desc);
}

function toTitleCase(str) {
    return str.toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
}

/**
 * Get icon color classes for a transaction action
 */
export function getActionStyle(action) {
    switch (action) {
        case 'Received':
        case 'Deposited':
            return { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'up' };
        case 'Sent':
        case 'Paid':
        case 'Withdrawn':
            return { bg: 'bg-red-100', text: 'text-red-600', icon: 'down' };
        case 'Transfer':
            return { bg: 'bg-blue-100', text: 'text-blue-600', icon: 'transfer' };
        default:
            return { bg: 'bg-gray-100', text: 'text-gray-600', icon: 'down' };
    }
}
