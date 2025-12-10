import express from "express";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import feedController from "./social.controller";
import feedValidation from "./social.validation";

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
