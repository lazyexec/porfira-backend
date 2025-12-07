import express from "express";

const router: express.Router = express.Router();

router.route("/").post(); // POS

export default router;
