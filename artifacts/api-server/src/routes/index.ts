import { Router, type IRouter } from "express";
import healthRouter from "./health";
import launchesRouter from "./launches";
import storageRouter from "./storage";
import liveStreamRouter from "./live-stream";

const router: IRouter = Router();

router.use(healthRouter);
router.use(launchesRouter);
router.use(storageRouter);
router.use(liveStreamRouter);

export default router;
