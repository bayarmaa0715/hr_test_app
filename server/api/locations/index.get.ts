import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export async function fetchLocationData() {
  const config = useRuntimeConfig();
  const url = `${config.locationApiUrl}?apikey=${config.locationApiKey}`;

  const data = await $fetch<{
    city: string;
    country: string;
    latitude: number;
    longitude: number;
  }>(url, {
    method: "GET" as const,
    headers: {
      "X-RapidAPI-Key": config.rapidApiKey,
      "X-RapidAPI-Host": config.rapidApiHost,
    },
  });
  console.log("data", data);
  return {
    city: data.city,
    country: data.country,
    latitude: data.latitude,
    longitude: data.longitude,
  };
}

export default defineEventHandler(async (event) => {
  console.log("get locations");
  try {
    await authMiddleware(event);
    const user = event.context.user;

    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const { getCollection } = getFirebaseAdmin();
    const locations = await getCollection("locations");

    return locations;
  } catch (error) {
    console.error("Error fetching locations:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch locations",
    });
  }
});
