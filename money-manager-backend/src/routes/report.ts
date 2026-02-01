import { Router } from "express";
import { exportReport, generateReport } from "../controllers/report";
import { protect } from "../middlewares/auth";

const router = Router();

router.use(protect);

router.post("/export", exportReport);
router.get("/generate", generateReport);

export default router;