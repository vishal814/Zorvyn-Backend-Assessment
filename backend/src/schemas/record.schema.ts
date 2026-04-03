import { z } from 'zod';
import { RecordType } from '../models/record.model';

export const createRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive'),
    type: z.nativeEnum(RecordType),
    category: z.string().min(1, 'Category is required'),
    date: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Invalid date format',
    }),
    notes: z.string().optional(),
  }),
});

export const updateRecordSchema = z.object({
  body: z.object({
    amount: z.number().positive('Amount must be positive').optional(),
    type: z.nativeEnum(RecordType).optional(),
    category: z.string().min(1, 'Category is required').optional(),
    date: z.string().or(z.date()).refine((val) => !isNaN(new Date(val).getTime()), {
      message: 'Invalid date format',
    }).optional(),
    notes: z.string().optional(),
  }),
});
