import { Router } from "express";
import passport from "passport";
import { register, login, googleCallback, me } from "../controllers/auth";
import { protect } from "../middlewares/auth";

const router = Router();

// Manual auth
router.post("/register", register);
router.post("/login", login);

//me
router.get("/me", protect, me);

// Google OAuth
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false }),
    googleCallback
);

export default router;
