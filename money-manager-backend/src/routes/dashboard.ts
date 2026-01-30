import { Router } from "express";
import {
  getSummary,
  categorySummary,
  rangeSummary,
} from "../controllers/dashboard";
import { protect } from "../middlewares/auth";


const router = Router();

// Get summary
router.get("/summary", protect, getSummary);

// Get category summary
router.get("/categories", protect, categorySummary);

// Get range summary
router.get("/range", protect, rangeSummary);

export default router;
