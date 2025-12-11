import { Router } from "express";
import auth from "../../middlewares/auth";
import messageController from "./message.controller";
import fileUploader from "../../middlewares/fileUploader";
import validate from "../../middlewares/validate";
import messageValidation from "./message.validation";
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

router.route("/all").get(auth("common"), messageController.getConversations);

export default router;
