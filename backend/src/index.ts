import express from "express";
import { Request, Response } from "express";
import { appConfig } from "./config/index.config";
import morgan from "morgan";
import cors from "cors";
import { logger } from "./utils/logger.utils";
import { connectDb } from "./config/connectDb";
import { connectRedis } from "./config/connectRedis";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import compression from "compression";
import userRouter from "./routes/user.route";
import workoutRouter from "./routes/workout.route";
import exerciseRouter from "./routes/exercise.route";
import supportingDataRouter from "./routes/supportingData.route";

const app = express();
const port = appConfig.app.port;

//rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests, please try again later.",
});

//middlewares
app.use(morgan("combined"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
    },
  }),
);
app.use(limiter);
app.use(compression()); // compress response for speed

//routes//
// health check endpoint (keep only one)
app.get("/health", (_req: Request, res: Response) => {
  res.status(200).json({ message: "Server is healthy" });
});

//User routes
app.use("/api/v1/users", userRouter);

// workout routes
app.use("/api/v1/workouts", workoutRouter);

// exercise routes
app.use("/api/v1/exercises", exerciseRouter);

// supporting data routes
app.use("/api/v1/supporting-data", supportingDataRouter);

app.listen(port, async () => {
  logger.info(
    `Server is running on http://${appConfig.app.app_host}:${port} in ${appConfig.app.mode} mode`,
  );

  await connectDb();

  await connectRedis();
});

// Handle invalid routes
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: "Route not found" });
});

export default app;
