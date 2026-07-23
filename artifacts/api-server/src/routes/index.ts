import { Router, type IRouter } from "express";
import healthRouter from "./health";
import launchesRouter from "./launches";
import storageRouter from "./storage";

const router: IRouter = Router();

router.use(healthRouter);
router.use(launchesRouter);
router.use(storageRouter);

export default router;
