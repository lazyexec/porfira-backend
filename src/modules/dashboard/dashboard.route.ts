import express from "express";

const router: express.Router = express.Router();

router.route("/student").get(); //  Upcoming lesson, completed lesson, total lesson and given review(in counts), array of 5 upcoming lessons, lessons completed from pending lessons, ratings maybe(not sure ), total hours, total earnings 
router.route("/teacher").get(); //  Total Students,Total Earnings, Upcoming Lessons and Completed Lessons (in counts), array of 5 upcoming lessons,  
export default router;