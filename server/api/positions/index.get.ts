import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("get positions");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const { getCollection } = getFirebaseAdmin();
    const positions = await getCollection("positions");

    return positions;
  } catch (error) {
    console.error("Error fetching positions:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch positions",
    });
  }
});
