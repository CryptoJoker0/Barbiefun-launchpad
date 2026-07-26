import { Router, type IRouter } from "express";
import healthRouter from "./health";
import launchesRouter from "./launches";
import storageRouter from "./storage";
import liveStreamRouter from "./live-stream";
import adminAuthRouter from "./admin-auth";
import x1Router from "./x1";

const router: IRouter = Router();

router.use(healthRouter);
router.use(launchesRouter);
router.use(storageRouter);
router.use(liveStreamRouter);
router.use(adminAuthRouter);
router.use(x1Router);

export default router;
