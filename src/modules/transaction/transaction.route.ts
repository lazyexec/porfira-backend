import express from "express";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import transactionValidation from "./transaction.validation.ts";
import transactionController from "./transaction.controller.ts";

const router = express.Router();

router.get("/all",  auth('admin'), transactionController.getAllTransactions);

export default router;
