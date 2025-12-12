import fs from "fs";

const createFolder = (folderPath: string) => {
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
};

const deleteFolder = (folderPath: string) => {
  if (fs.existsSync(folderPath)) {
    fs.rmdirSync(folderPath, { recursive: true });
  }
};

const sanitizePath = (path: string) => {
  return path.replace(/\\/g, "/").replace("public", "");
};

export default {
  createFolder,
  deleteFolder,
  sanitizePath
};
