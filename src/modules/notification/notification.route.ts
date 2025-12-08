import express from "express";
import auth from "../../middlewares/auth.ts";
import notificationController from "./notification.controller.ts";
import validate from "../../middlewares/validate.ts";
import notificationValidation from "./notification.validation.ts";

const router: express.Router = express.Router();

router
  .route("/:notificationId")
  .delete(
    auth("common"),
    validate(notificationValidation.deleteNotification),
    notificationController.deleteNotification
  );
router
  .route("/")
  .get(
    auth("common"),
    validate(notificationValidation.getNotification),
    notificationController.getAllNotifications
  );

export default router;
