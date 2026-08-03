import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import scheduleRouter from "./schedule";
import viewcoinsRouter from "./viewcoins";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(scheduleRouter);
router.use(viewcoinsRouter);

export default router;
