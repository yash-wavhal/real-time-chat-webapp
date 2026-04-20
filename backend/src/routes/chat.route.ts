import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import { createNewChat, deleteChat, getAllChats, markChatAsRead } from "../controllers/chat.controller";

const router = express.Router();

router.get("/", protectRoute, getAllChats);
router.post("/", protectRoute, createNewChat);
router.delete('/', protectRoute, deleteChat);
router.post('/mark-read', protectRoute, markChatAsRead);

export default router;
