import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import { createNewChat, deleteChat, getAllChats } from "../controllers/chat.controller";

const router = express.Router();

router.get("/", protectRoute, getAllChats);
router.post("/", protectRoute, createNewChat);
router.delete('/', protectRoute, deleteChat);

export default router;
