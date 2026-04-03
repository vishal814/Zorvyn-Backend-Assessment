import mongoose, { Document, Schema } from 'mongoose';

export enum RecordType {
  INCOME = 'income',
  EXPENSE = 'expense',
}

export interface IRecord extends Document {
  amount: number;
  type: RecordType;
  category: string;
  date: Date;
  notes?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
}

const recordSchema = new Schema<IRecord>(
  {
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(RecordType),
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    notes: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const Record = mongoose.model<IRecord>('Record', recordSchema);
