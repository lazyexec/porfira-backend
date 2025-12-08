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
const app: Application = express();

app.use('/api/v1/webhook', webhookRouter);
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
export default app;
