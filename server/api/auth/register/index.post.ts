import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../../middleware/auth.server";

export default defineEventHandler(async (event) => {
  console.log("register user");
  try {
    await authMiddleware(event);
    const user = event.context.user;
    console.log("event.context", event.context);

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: "Unauthorized  mnmnn",
      });
    }

    const body = await readBody(event);
    const { email, password } = body;
    console.log("email, password", email, password);
    if (!email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: "Email, password are required",
      });
    }

    const { createUser, updateDocument, getCollection } = getFirebaseAdmin();
    let firebaseUser: any = null;
    try {
      const matchingProfiles = await getCollection("userProfiles", [
        { field: "email", operator: "==", value: email },
      ]);

      if (!matchingProfiles || matchingProfiles.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "UserProfile not found for provided email",
        });
      }

      const profile: any = matchingProfiles[0];

      firebaseUser = await createUser({
        email,
        password,
      });

      await updateDocument("userProfiles", profile.id, {
        uid: firebaseUser.uid,
        updatedAt: new Date(),
      });

      return {
        success: true,
        message: "User created successfully",
        user: {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
        },
      };
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.statusCode) throw error;
      throw createError({
        statusCode: 500,
        statusMessage: `Failed to create user: ${error.message || error}`,
      });
    }
  } catch (error: any) {
    console.error("Error in register API:", error);

    if (error.statusCode) {
      throw error;
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Internal Server Error",
    });
  }
});
