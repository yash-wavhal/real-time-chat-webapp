import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import { createNewChat, getAllChats } from "../controllers/chat.controller";

const router = express.Router();

router.get("/", protectRoute, getAllChats);
router.post("/", protectRoute, createNewChat);

export default router;
