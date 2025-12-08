import express from "express";
import adminController from "./admin.controller.ts";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import adminValidation from "./admin.validation.ts";

const router = express.Router();

// Teacher management
router
  .route("/teachers/:id/approve")
  .post(
    auth("admin"),
    validate(adminValidation.approveTeacher),
    adminController.approveTeacher
  );

router
  .route("/teachers/:id/reject")
  .post(
    auth("admin"),
    validate(adminValidation.rejectTeacher),
    adminController.rejectTeacher
  );

router
  .route("/teachers/pending")
  .get(
    auth("admin"),
    validate(adminValidation.getPendingTeachers),
    adminController.getPendingTeachers
  );

router
  .route("/teachers/:id/earnings")
  .get(
    auth("admin"),
    validate(adminValidation.getTeacherEarnings),
    adminController.getTeacherEarnings
  );

// Bookings and transactions

router
  .route("/transactions")
  .get(
    auth("admin"),
    validate(adminValidation.getAllTransactions),
    adminController.getAllTransactions
  );

// System revenue
router
  .route("/revenue")
  .get(auth("admin"), adminController.getSystemRevenue);

export default router;
