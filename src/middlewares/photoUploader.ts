import multer from "multer";
import path from "path";
import fs from "../utils/fs.ts";

export default function (UPLOADS_FOLDER: string) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      try {
        fs.createFolder(UPLOADS_FOLDER);
      } catch (error) {
        console.error("Error creating upload folder:", error);
      }
      cb(null, UPLOADS_FOLDER);
    },
    filename: (req, file, cb) => {
      const fileExt = path.extname(file.originalname);
      const filename =
        file.originalname
          .replace(fileExt, "")
          .toLocaleLowerCase()
          .split(" ")
          .join("-") +
        "-" +
        Date.now();

      cb(null, filename + fileExt);
    },
  });

  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 200000000000000000000000000, // 20MB
    },
    fileFilter: (req, file, cb) => {
      if (
        file.mimetype == "image/jpg" ||
        file.mimetype == "image/png" ||
        file.mimetype == "image/jpeg" ||
        file.mimetype == "image/heic" ||
        file.mimetype == "image/heif"
      ) {
        cb(null, true);
      } else {
        cb(new Error("Only jpg, png, jpeg format allowed!"));
      }
    },
  });

  return upload; // Return the configured multer upload middleware
}
