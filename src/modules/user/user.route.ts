import express from "express";
import userController from "./user.controller";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import userValidation from "./user.validation";
import userFileUploadMiddleware from "../../middlewares/fileUploader";
import uploadTypes from "../../utils/fileTypes";
const UPLOADS_FOLDER_USERS = "./public/uploads/users";

const upload = userFileUploadMiddleware(UPLOADS_FOLDER_USERS);

const router = express.Router();

router.route("/self/in").get(auth("common"), userController.getProfile);

router.route("/self/update").patch(
  auth("common"),
  validate(userValidation.updateProfile),
  upload.fields([
    { name: "avatar", maxCount: 1 },
    { name: "content", maxCount: 1 },
  ]),
  userController.updateProfile
);

// Admin Route
router
  .route("/all")
  .get(
    auth("admin"),
    validate(userValidation.queryAllUsers),
    userController.queryAllUsers
  );

router
  .route("/restrict/:userId")
  .post(
    auth("admin"),
    validate(userValidation.restrictUser),
    userController.restrictUser
  );

router
  .route("/unrestrict/:userId")
  .post(
    auth("admin"),
    validate(userValidation.unrestrictUser),
    userController.unrestrictUser
  );

export default router;
