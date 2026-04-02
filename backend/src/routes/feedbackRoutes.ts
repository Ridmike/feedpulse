import { Router } from "express";
import { getFeedbacks, postFeedback } from "../controllers/feedbackController";

const router = Router();

router.post("/", postFeedback);
router.get("/", getFeedbacks);

export default router;
