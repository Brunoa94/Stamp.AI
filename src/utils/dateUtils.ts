/**
 * Date formatting utility functions
 */

/**
 * Formats a date string or Date object to a user-friendly format
 * @param date - ISO date string or Date object
 * @param format - Format type: 'short' (Jan 15, 2024), 'long' (January 15, 2024), 'full' (January 15, 2024 at 2:30 PM)
 * @returns Formatted date string
 */
export const formatDate = (
  date: string | Date,
  format: 'short' | 'long' | 'full' = 'short'
): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: format === 'short' ? 'short' : 'long',
    day: 'numeric',
  };

  if (format === 'full') {
    options.hour = 'numeric';
    options.minute = '2-digit';
    options.hour12 = true;
  }

  return new Intl.DateTimeFormat('en-US', options).format(dateObj);
};

/**
 * Formats a date to relative time (e.g., "2 hours ago", "3 days ago")
 * @param date - ISO date string or Date object
 * @returns Relative time string
 */
export const formatRelativeTime = (date: string | Date): string => {
  if (!date) return '';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check for invalid date
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  // Less than 1 minute
  if (diffInSeconds < 60) {
    return 'Just now';
  }

  // Less than 1 hour
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ago`;
  }

  // Less than 1 day
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  }

  // Less than 1 week
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }

  // Less than 1 month (30 days)
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
  }

  // Less than 1 year
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} ${months === 1 ? 'month' : 'months'} ago`;
  }

  // 1 year or more
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} ${years === 1 ? 'year' : 'years'} ago`;
};

/**
 * Formats a date to a short readable format (e.g., "Jan 15, 2024")
 * @param date - ISO date string or Date object
 * @returns Short formatted date string
 */
export const formatDateShort = (date: string | Date): string => {
  return formatDate(date, 'short');
};

/**
 * Formats a date to a long readable format (e.g., "January 15, 2024")
 * @param date - ISO date string or Date object
 * @returns Long formatted date string
 */
export const formatDateLong = (date: string | Date): string => {
  return formatDate(date, 'long');
};

/**
 * Formats a date to a full readable format with time (e.g., "January 15, 2024 at 2:30 PM")
 * @param date - ISO date string or Date object
 * @returns Full formatted date string with time
 */
export const formatDateFull = (date: string | Date): string => {
  return formatDate(date, 'full');
};

/**
 * Checks if a date is today
 * @param date - ISO date string or Date object
 * @returns Boolean indicating if the date is today
 */
export const isToday = (date: string | Date): boolean => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();

  return (
    dateObj.getDate() === today.getDate() &&
    dateObj.getMonth() === today.getMonth() &&
    dateObj.getFullYear() === today.getFullYear()
  );
};

/**
 * Checks if a date is within the last N days
 * @param date - ISO date string or Date object
 * @param days - Number of days to check
 * @returns Boolean indicating if the date is within the last N days
 */
export const isWithinLastDays = (date: string | Date, days: number): boolean => {
  if (!date) return false;

  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInMs = now.getTime() - dateObj.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);

  return diffInDays <= days && diffInDays >= 0;
};
