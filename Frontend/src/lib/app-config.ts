/** White-label product name shown pre-login and as the in-app subtitle.
 * Operators override it via NEXT_PUBLIC_APP_NAME without touching code. */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME?.trim() || 'CRM Platform';
