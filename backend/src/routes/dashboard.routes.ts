import express from 'express';
import { getDashboardSummary } from '../controllers/dashboard.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

router.use(protect);

// Viewers, Analysts, and Admins can all view dashboard data
router.get('/', restrictTo(UserRole.VIEWER, UserRole.ANALYST, UserRole.ADMIN), getDashboardSummary);

export default router;
