import express from "express";
import userController from "./user.controller.ts";
import auth from "../../middlewares/auth.ts";
import validate from "../../middlewares/validate.ts";
import userValidation from "./user.validation.ts";
import userFileUploadMiddleware from "../../middlewares/photoUploader.ts";
const UPLOADS_FOLDER_USERS = "./public/uploads/users";

const uploadUsers = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const router = express.Router();

router.route("/self/in").get(auth("common"), userController.getProfile);

router
  .route("/self/update")
  .patch(
    auth("common"),
    validate(userValidation.updateProfile),
    [uploadUsers.single("image")],
    userController.updateProfile
  );

export default router;
