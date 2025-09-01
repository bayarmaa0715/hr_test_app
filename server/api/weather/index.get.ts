import { getFirebaseAdmin } from "~/server/utils/firebase-admin";
import authMiddleware from "../../../middleware/auth.server.js";

export default defineEventHandler(async (event) => {
  console.log("get weather for employee locations");
  try {
    await authMiddleware(event);
    const user = event.context.user;
    console.log("user", user);
    if (!user) {
      throw createError({ statusCode: 401, statusMessage: "Unauthorized" });
    }

    const config = useRuntimeConfig();
    const apiKey = config.openWeatherMapApiKey;

    // Get employees and locations from database
    const { getCollection } = getFirebaseAdmin();
    const [employees, allLocations] = await Promise.all([
      getCollection("employees"),
      getCollection("locations"),
    ]);

    if (
      !employees ||
      employees.length === 0 ||
      !allLocations ||
      allLocations.length === 0
    ) {
      return [];
    }

    // Get unique location IDs from employees
    const employeeLocationIds = [
      ...new Set(employees.map((emp: any) => emp.locationId)),
    ];

    // Filter locations to only include those with employees
    const locations = allLocations.filter((loc: any) =>
      employeeLocationIds.includes(loc.id)
    );

    if (locations.length === 0) {
      return [];
    }

    try {
      const promises = locations.map(async (loc: any) => {
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc.city},${loc.country}&appid=${apiKey}&units=metric`;
        const res = await $fetch<{
          main: {
            temp: number;
            humidity: number;
            pressure: number;
          };
          weather: Array<{
            description: string;
            icon: string;
          }>;
          wind: {
            speed: number;
          };
        }>(url);
        // Count employees in this location
        const employeeCount = employees.filter(
          (emp: any) => emp.locationId === loc.id
        ).length;

        return {
          id: loc.id,
          city: loc.city,
          country: loc.country,
          temp: res.main.temp,
          weather: res.weather[0].description,
          windSpeed: res.wind.speed,
          humidity: res.main.humidity,
          pressure: res.main.pressure,
          icon: res.weather[0].icon,
          employeeCount,
        };
      });

      const results = await Promise.all(promises);
      return results;
    } catch (err) {
      console.error("Error fetching weather:", err);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch weather data",
      });
    }
  } catch (error) {
    console.error("Error in weather API:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch weather",
    });
  }
});
