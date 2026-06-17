import { prisma } from "@/lib/prisma";

/**
 * Log a user activity to the database.
 * @param userId - The user ID (null for anonymous users)
 * @param action - Description of the action performed
 * @param details - Optional additional details
 * @param request - Optional Request object to extract IP and user agent
 */
export async function logActivity(
  userId: string | null,
  action: string,
  details?: string,
  request?: Request
): Promise<void> {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  if (request) {
    ipAddress =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      null;
    userAgent = request.headers.get("user-agent") || null;
  }

  try {
    await prisma.activityLog.create({
      data: {
        userId,
        action,
        details: details || null,
        ipAddress,
        userAgent: userAgent ? userAgent.substring(0, 500) : null,
      },
    });
  } catch (error) {
    // Don't throw on logging failures - just log to console
    console.error("Failed to log activity:", error);
  }
}
