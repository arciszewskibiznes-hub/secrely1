// Admin configuration
// Only this user ID has access to the moderation panel
export const ADMIN_USER_ID = "29d2e355-95da-490a-a3c5-c4a3d428c9fd";

export function isAdmin(userId: string | undefined | null): boolean {
  return userId === ADMIN_USER_ID;
}
