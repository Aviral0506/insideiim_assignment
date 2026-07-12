import { Router } from "express";
import { streamResearch } from "../controllers/research.controller.js";

const router = Router();

router.get("/stream", streamResearch);

export default router;
