import express from "express";
import userController from "./user.controller";
import auth from "../../middlewares/auth";
import validate from "../../middlewares/validate";
import userValidation from "./user.validation";
import userFileUploadMiddleware from "../../middlewares/fileUploader";
const uploadAll = userFileUploadMiddleware("./public/uploads/all").fields([
  { name: "avatar", maxCount: 1 },
  { name: "content", maxCount: 1 },
  { name: "documents", maxCount: 2 },
]);

const router = express.Router();

router.route("/self/in").get(auth("common"), userController.getProfile);

router
  .route("/self/update")
  .patch(
    auth("common"),
    uploadAll,
    validate(userValidation.updateProfile),
    userController.updateProfile
  );

router
  .route("/:userId")
  .get(
    auth("common"),
    validate(userValidation.getUserById),
    userController.getProfileById
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
