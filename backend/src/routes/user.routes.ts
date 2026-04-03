import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/user.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { UserRole } from '../models/user.model';

const router = express.Router();

router.use(protect);
router.use(restrictTo(UserRole.ADMIN)); // Only Admins can manage users

router.route('/')
  .get(getUsers);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
