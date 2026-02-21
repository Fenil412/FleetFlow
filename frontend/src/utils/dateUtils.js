import { format, isValid, parseISO } from 'date-fns';

/**
 * Safely formats a date string or object using date-fns.
 * Returns a fallback string if the date is invalid or missing.
 */
export const formatSafeDate = (date, formatStr = 'MMM d, yyyy', fallback = '---') => {
    if (!date) return fallback;

    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        if (!isValid(dateObj)) return fallback;
        return format(dateObj, formatStr);
    } catch (err) {
        console.error('Date formatting error:', err);
        return fallback;
    }
};
