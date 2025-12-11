import express from "express";
import userController from "./user.controller";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import userValidation from "./user.validation";
import userFileUploadMiddleware from "../../middlewares/fileUploader";
import uploadTypes from "../../utils/fileTypes";

const UPLOADS_FOLDER_AVATARS = "./public/uploads/avatars";
const UPLOADS_FOLDER_CONTENT = "./public/uploads/content";
const UPLOADS_FOLDER_DOCUMENTS = "./public/uploads/documents";

const uploadAvatar = userFileUploadMiddleware(UPLOADS_FOLDER_AVATARS);
const uploadContent = userFileUploadMiddleware(UPLOADS_FOLDER_CONTENT);
const uploadDocuments = userFileUploadMiddleware(UPLOADS_FOLDER_DOCUMENTS);

const router = express.Router();

router.route("/self/in").get(auth("common"), userController.getProfile);

router.route("/self/update").patch(
  auth("common"),
  validate(userValidation.updateProfile),
  (req, res, next) => {
    // Chain uploads: avatar -> content -> documents
    uploadAvatar.fields([{ name: "avatar", maxCount: 1 }])(req, res, (err) => {
      if (err) return next(err);
      uploadContent.fields([{ name: "content", maxCount: 1 }])(req, res, (err) => {
        if (err) return next(err);
        uploadDocuments.fields([{ name: "documents", maxCount: 2 }])(req, res, next);
      });
    });
  },
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
