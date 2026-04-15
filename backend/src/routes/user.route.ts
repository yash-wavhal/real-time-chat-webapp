import express from 'express';
import { getAllUsers, getMe } from '../controllers/user.controller';
import { protectRoute } from '../middleware/protectRoute';
const router = express.Router();

router.get('/me', protectRoute, getMe);
router.get('/', protectRoute, getAllUsers);

export default router;
