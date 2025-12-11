import express, { Router } from "express";
import authRouter from "../../auth/auth.route";
import userRouter from "../../user/user.route";
import reviewRouter from "../../review/review.route";
import socialRouter from "../../social/social.route";
import adminRouter from "../../admin/admin.route";
import bookingRouter from "../../booking/booking.route";
import notificationRouter from "../../notification/notification.route";
import transactionRouter from "../../transaction/transaction.route";
import messageRouter from "../../message/message.route";
import dashboardRouter from "../../dashboard/dashboard.route";

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
    path: "/social",
    route: socialRouter,
  },
  {
    path: "/admin",
    route: adminRouter,
  },
  {
    path: "/booking",
    route: bookingRouter,
  },
  {
    path: "/notification",
    route: notificationRouter,
  },
  {
    path: "/transaction",
    route: transactionRouter,
  },
  {
    path: "/dashboard",
    route: dashboardRouter,
  },
  // TODO: Test Messaging Properly.
  {
    path: "/message",
    route: messageRouter,
  },
];

routes.forEach((routeProvide: routeObjects) => {
  mainRouter.use(routeProvide.path, routeProvide.route);
});

export default mainRouter;
