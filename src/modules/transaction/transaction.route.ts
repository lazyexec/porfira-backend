import express from "express";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import transactionValidation from "./transaction.validation.ts";
import transactionController from "./transaction.controller.ts";
import stripeController from "../stripe/stripe.controller.ts";

const router = express.Router();

router.get(
  "/all",
  auth("admin"),
  validate(transactionValidation.getAllTransactions),
  transactionController.getAllTransactions
);

// Teacher Wallet
router.post(
  "/wallet",
  auth("teacher"),
  stripeController.completeTeacherWalletIntent
);

export default router;
