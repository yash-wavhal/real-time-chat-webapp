import express from "express";
import { protectRoute } from "../middleware/protectRoute";
import { createNewMsg, getAllMsgs } from "../controllers/message.controller";

const router = express.Router();

router.get("/:chatid", protectRoute, getAllMsgs);
router.post("/", protectRoute, createNewMsg);

export default router;
