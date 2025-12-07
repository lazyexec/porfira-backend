import express from "express";
import reviewController from "./lesson.controller.ts";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import lessonService from "./lesson.service.ts";
import lessonValidation from "./lesson.validation.ts";

const router = express.Router();

router.post(
  "/claim",
  auth("student"),
  validate(lessonValidation.claimLesson),
  reviewController.claimLesson
);
export default router;
