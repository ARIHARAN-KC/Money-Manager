import { Router } from "express";
import {
  createBudget,
  getBudgets,
  updateBudget,
  deleteBudget,
} from "../controllers/budget";
import { protect } from "../middlewares/auth";

const router = Router();

router.use(protect);

router.post("/", createBudget);
router.get("/", getBudgets);
router.put("/:id", updateBudget);
router.delete("/:id", deleteBudget);

export default router;