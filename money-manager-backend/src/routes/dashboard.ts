import { Router } from "express";
import {
    getSummary,
    categorySummary,
    rangeSummary
} from "../controllers/dashboard";

const router = Router();

router.get("/summary", getSummary);
router.get("/categories", categorySummary);
router.get("/range", rangeSummary);

export default router;
