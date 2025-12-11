import express from "express";
import auth from "../../middlewares/auth";
import notificationController from "./notification.controller";
import validate from "../../middlewares/validate";
import notificationValidation from "./notification.validation";

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
router.delete(
  "/clear",
  auth("common"),
  notificationController.deleteAllNotification
);

export default router;
