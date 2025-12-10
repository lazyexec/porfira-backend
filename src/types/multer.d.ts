import { File } from "multer";

declare global {
  namespace Express {
    interface MulterFiles {
      avatar?: Express.Multer.File[];
      content?: Express.Multer.File[];
      documents?: Express.Multer.File[]; // optional teacher documents
    }

    interface Request {
      files?: MulterFiles;
    }
  }
}
