import express from "express";
import stripeController from "./stripe.controller.ts";
import bodyParser from "body-parser";

const router = express.Router();

router.post(
  "/",
  bodyParser.raw({ type: "application/json" }),
  stripeController.webhook
);

export default router;
