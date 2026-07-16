import { Router, type IRouter } from "express";
import healthRouter from "./health";
import launchesRouter from "./launches";

const router: IRouter = Router();

router.use(healthRouter);
router.use(launchesRouter);

export default router;
