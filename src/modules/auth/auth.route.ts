import express, { Router } from "express";
import authController from "./auth.controller.ts";
import validate from "../../middlewares/validate.ts";
import authValidation from "./auth.validation.ts";

const router: Router = express.Router();

router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);
router.post("/login", validate(authValidation.login), authController.login);
router.post(
  "/verify-account",
  validate(authValidation.verifyAccount),
  authController.verifyAccount
);
router.post("/logout", validate(authValidation.logout), authController.logout);
router.post(
  "/refresh-tokens",
  validate(authValidation.refreshTokens),
  authController.refreshTokens
);
router.post(
  "/forgot-password",
  validate(authValidation.forgotPassword),
  authController.forgotPassword
);
router.post(
  "/reset-password",
  validate(authValidation.resetPassword),
  authController.resetPassword
);
router.post(
  "/change-password",
  validate(authValidation.changePassword),
  authController.changePassword
);
export default router;
