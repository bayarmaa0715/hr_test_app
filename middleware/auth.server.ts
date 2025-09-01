import type { DecodedIdToken } from "firebase-admin/auth";
import { getFirebaseAdmin } from "../server/utils/firebase-admin";

export default defineEventHandler(async (event) => {
  // Only apply to API routes that need authentication
  const path = getRequestURL(event).pathname;

  // Skip authentication for public routes
  if (path.startsWith("/api/public")) {
    return;
  }

  // Get the authorization header
  const authHeader = getHeader(event, "authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - No valid token provided",
    });
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix

  try {
    const { verifyIdToken } = getFirebaseAdmin();
    const decodedToken: DecodedIdToken = await verifyIdToken(token);
    console.log("decodedToken.uid==-==-=-==,", decodedToken.uid);

    // Add user info to the event context
    event.context.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
      role: decodedToken.role || "user",
    };
  } catch (error) {
    console.error("Token verification failed:", error);
    throw createError({
      statusCode: 401,
      statusMessage: "Unauthorized - Invalid token",
    });
  }
});
