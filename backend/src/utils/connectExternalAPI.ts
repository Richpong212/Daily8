import { appConfig } from "../config/index.config";
import { logger } from "./logger.utils";

export const checkMuscleWikiAPIHealth = async () => {
  try {
    const response = await fetch("https://api.musclewiki.com/health", {
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": appConfig.externalAPIs.muscleWiki,
      },
    });

    if (!response.ok) {
      throw new Error(`MuscleWiki API returned ${response.status}`);
    }

    logger.info("Connected to MuscleWiki API successfully");

    return response.json();
  } catch (error) {
    logger.error("Error connecting to MuscleWiki API:", error);
    throw error;
  }
};

export const getMuscleWikiExercises = async () => {
  try {
    const response = await fetch(
      "https://api.musclewiki.com/exercises?limit=5&category=barbell&difficulty=intermediate",
      {
        headers: {
          "X-API-Key": appConfig.externalAPIs.muscleWiki,
        },
      },
    );

    if (!response.ok) {
      const error = await response.text();

      throw new Error(`MuscleWiki API returned ${response.status}: ${error}`);
    }

    logger.info("Exercises retrieved from MuscleWiki API successfully");

    return response.json();
  } catch (error) {
    logger.error("Error retrieving MuscleWiki exercises:", error);
    throw error;
  }
};
