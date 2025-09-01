import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../../middleware/auth.server";
import { getAuth } from "firebase-admin/auth";

export default defineEventHandler(async (event) => {
  console.log("get ");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }
    const { getCollection } = getFirebaseAdmin();
    const list = await getAuth().listUsers(1000);

    const userProfiles = await getCollection("userProfiles");
    const authedEmails = new Set(
      list.users.map((u: any) => u.email).filter((e: string | null) => !!e)
    );
    const authedUsers = userProfiles.filter((p: any) =>
      authedEmails.has(p.email)
    );

    return {
      authedUsers,
    };
  } catch (error) {
    console.error("Error fetching employees:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch employees",
    });
  }
});
