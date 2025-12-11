import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import transactionValidation from "./transaction.validation";
import transactionController from "./transaction.controller";
import stripeController from "../stripe/stripe.controller";

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

router.get(
  "/teacher/wallet",
  auth("teacher"),
  transactionController.getTeacherWalletDashboard
);

router.get(
  "/student/wallet",
  auth("student"),
  transactionController.getStudentWalletDashboard
);

router.get(
  "/teacher/transactions",
  auth("teacher"),
  validate(transactionValidation.getTeacherTransactions),
  transactionController.getTeacherTransactions
);

router.get(
  "/student/transactions",
  auth("student"),
  validate(transactionValidation.getStudentTransactions),
  transactionController.getStudentTransactions
);

router.get(
  "/:transactionId",
  auth("common"),
  validate(transactionValidation.getTransaction),
  transactionController.getTransaction
);

export default router;
