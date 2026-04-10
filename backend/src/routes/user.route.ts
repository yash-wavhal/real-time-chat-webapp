import express from 'express';
import { getMe } from '../controllers/user.controller';
import { protectRoute } from '../middleware/protectRoute';
const router = express.Router();

router.get('/me', protectRoute, getMe);

export default router;
