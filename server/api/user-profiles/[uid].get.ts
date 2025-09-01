import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("get user profile by uid");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const uid = getRouterParam(event, "uid");
    if (!uid) {
      throw createError({
        statusCode: 400,
        statusMessage: "User ID is required",
      });
    }
    console.log("uid", uid);
    const { getCollection } = getFirebaseAdmin();

    const userProfiles = await getCollection("userProfiles");

    const userProfile = userProfiles.find((profile) => profile.uid === uid);
    console.log("userProfile", userProfile);
    if (!userProfile) {
      throw createError({
        statusCode: 404,
        statusMessage: "User profile not found",
      });
    }

    return userProfile;
  } catch (error) {
    console.error("Error fetching user profile:", error);

    // if (error.statusCode) {
    //   throw error;
    // }

    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch user profile",
    });
  }
});
