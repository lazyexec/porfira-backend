import express from "express";
import dashboardController from "./dashboard.controller";
import auth from "../../middlewares/auth";

const router: express.Router = express.Router();

router.route("/").get(auth("common"), dashboardController.getDashboard); //  Upcoming lesson, completed lesson, total lesson and given review(in counts), array of 5 upcoming lessons, lessons completed from pending lessons, ratings maybe(not sure ), total hours, total earnings
export default router;
