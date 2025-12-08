import express from "express";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import feedController from "./feed.controller.ts";
import feedValidation from "./feed.validation.ts";

const router = express.Router();

router
  .route("/teachers")
  .get(
    auth("student"),
    validate(feedValidation.queryTeachers),
    feedController.queryTeachers
  );

router
  .route("/students")
  .get(
    auth("teacher"),
    validate(feedValidation.queryStudents),
    feedController.queryStudents
  );

export default router;
