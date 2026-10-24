/**
 * Checks if a given date string falls within the current calendar week (Monday to Sunday).
 */
export function isDateInCurrentWeek(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    const currentDay = now.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() + distanceToMonday);
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return date >= startOfWeek && date <= endOfWeek;
}

/**
 * Checks if a given date string falls within the current calendar month.
 */
export function isDateInCurrentMonth(dateStr: string | null | undefined): boolean {
    if (!dateStr) return false;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;

    const now = new Date();
    return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth()
    );
}

/**
 * Formats an ISO date string to a clean YYYY-MM-DD display format.
 */
export function formatDisplayDate(dateStr: string | null | undefined): string {
    if (!dateStr) return '// NO_DATE';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return '// INVALID_DATE';
    return date.toISOString().split('T')[0];
}
