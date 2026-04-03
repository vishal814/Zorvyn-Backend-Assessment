import express from 'express';
import { createRecord, getRecords, getRecordById, updateRecord, deleteRecord } from '../controllers/record.controller';
import { protect } from '../middlewares/auth.middleware';
import { restrictTo } from '../middlewares/role.middleware';
import { validate } from '../middlewares/validate.middleware';
import { createRecordSchema, updateRecordSchema } from '../schemas/record.schema';
import { UserRole } from '../models/user.model';

const router = express.Router();

router.use(protect);

router.route('/')
  // Analyst and Admin can view records
  .get(restrictTo(UserRole.ANALYST, UserRole.ADMIN), getRecords)
  // Only Admin can create records
  .post(restrictTo(UserRole.ADMIN), validate(createRecordSchema), createRecord);

router.route('/:id')
  // Analyst and Admin can view a single record
  .get(restrictTo(UserRole.ANALYST, UserRole.ADMIN), getRecordById)
  // Only Admin can update/delete records
  .put(restrictTo(UserRole.ADMIN), validate(updateRecordSchema), updateRecord)
  .delete(restrictTo(UserRole.ADMIN), deleteRecord);

export default router;
