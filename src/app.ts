import express, { type Application } from "express";
import v1Router from "./modules/routes/v1/index.ts";
import {
  errorConverter,
  errorHandler,
} from "./middlewares/globalErrorHandler.ts";
import compresson from "compression";
import helmet from "helmet";
import "./configs/passport.ts";
import passport from "passport";
import deviceMiddleware from "./middlewares/device.ts";
import webhookRouter from "./modules/stripe/stripe.route.ts";
import morgan from "morgan";
import env from "./configs/env.ts";
import cors from "cors";

const app: Application = express();

app.use(express.static("public"));

// Morgan Logger for logging requests
if (env.DEBUG) {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// enable corsy
app.use(
  cors({
    origin: env.FRONTEND_URL,
  })
);

// Webhook Route for raw body
app.use("/api/v1/webhook", webhookRouter);
// parse json request body
app.use(express.json());
// // set security HTTP headers
app.use(helmet());
// malter for file upload
app.use(express.static("public"));
// // parse urlencoded request body
app.use(express.urlencoded({ extended: true }));
app.use(passport.initialize());

// // gzip compression
app.use(deviceMiddleware);
app.use(compresson());
app.use("/api/v1", v1Router);

app.use(errorConverter);
app.use(errorHandler);

app.get("/health", (req, res) => {
  res.send("Api is Healthy");
});

export default app;
