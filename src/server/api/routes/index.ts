import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import productsRouter from "./products";
import ordersRouter from "./orders";
import servicesRouter from "./services";
import bookingsRouter from "./bookings";
import galleryRouter from "./gallery";
import reviewsRouter from "./reviews";
import inventoryRouter from "./inventory";
import accountingRouter from "./accounting";
import deliveryRouter from "./delivery";
import customersRouter from "./customers";
import employeesRouter from "./employees";
import dashboardRouter from "./dashboard";
import uploadsRouter from "./uploads";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(productsRouter);
router.use(ordersRouter);
router.use(servicesRouter);
router.use(bookingsRouter);
router.use(galleryRouter);
router.use(reviewsRouter);
router.use(inventoryRouter);
router.use(accountingRouter);
router.use(deliveryRouter);
router.use(customersRouter);
router.use(employeesRouter);
router.use(dashboardRouter);
router.use(uploadsRouter);

export default router;
