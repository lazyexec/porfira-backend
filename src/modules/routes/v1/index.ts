import express, { Router } from "express";
import authRouter from "../../auth/auth.route.ts";
import userRouter from "../../user/user.route.ts";
import reviewRouter from "../../review/review.route.ts";
import feedRouter from "../../feed/feed.route.ts";
import adminRouter from "../../admin/admin.route.ts";
import bookingRouter from "../../booking/booking.route.ts";

const mainRouter: Router = express.Router();

interface routeObjects {
  path: string;
  route: Router;
}

const routes: routeObjects[] = [
  {
    path: "/auth",
    route: authRouter,
  },
  {
    path: "/user",
    route: userRouter,
  },
  {
    path: "/review",
    route: reviewRouter,
  },
  {
    path: "/feed",
    route: feedRouter,
  },
  {
    path: "/admin",
    route: adminRouter,
  },
  {
    path: "/booking",
    route: bookingRouter,
  },
];

routes.forEach((routeProvide: routeObjects) => {
  mainRouter.use(routeProvide.path, routeProvide.route);
});

export default mainRouter;
