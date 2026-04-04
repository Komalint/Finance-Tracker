import { Router, type IRouter } from "express";
import healthRouter from "./health";
import transactionsRouter from "./transactions";
import summaryRouter from "./summary";

const router: IRouter = Router();

router.use(healthRouter);
router.use(transactionsRouter);
router.use(summaryRouter);

export default router;
