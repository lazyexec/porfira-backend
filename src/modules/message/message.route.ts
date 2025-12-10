import { Router } from "express";
import auth from "../../middlewares/auth.ts";
import messageController from "./message.controller.ts";
import fileUploader from "../../middlewares/fileUploader.ts";
import uploadTypes from "../../utils/fileTypes.ts";
import validate from "../../middlewares/validate.ts";
import messageValidation from "./message.validation.ts";
const fileUploaderMessage = fileUploader("./public/uploads/messages");

const router = Router();

router
  .route("/create/:targetId")
  .post(
    auth("common"),
    validate(messageValidation.createConversation),
    messageController.createConversation
  );
router
  .route("/:conversationId")
  .post(
    auth("common"),
    validate(messageValidation.sendMessage),
    fileUploaderMessage.single("attachment"),
    messageController.sendMessage
  );
router
  .route("/:conversationId/all")
  .get(
    auth("common"),
    validate(messageValidation.getMessages),
    messageController.getMessages
  );

export default router;
