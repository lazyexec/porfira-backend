import database from "./configs/database.ts";
import env from "./configs/env.ts";
import app from "./app.ts";
import logger from "./utils/logger.ts";

if (env.DEBUG) {
  database.connect();
  // Adding listen for debugging purposes
  app.listen(env.PORT, () => {
    logger.info(`Server running on http://localhost:${env.PORT}`);
  });
}

console.log(env);
