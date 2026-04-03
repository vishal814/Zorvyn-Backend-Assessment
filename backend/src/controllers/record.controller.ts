import { Request, Response } from 'express';
import { Record } from '../models/record.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createRecord = async (req: AuthRequest, res: Response) => {
  try {
    const { amount, type, category, date, notes } = req.body;

    const record = new Record({
      amount,
      type,
      category,
      date,
      notes,
      createdBy: req.user?._id,
    });

    const createdRecord = await record.save();
    res.status(201).json(createdRecord);
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getRecords = async (req: Request, res: Response) => {
  try {
    const { category, type, startDate, endDate, search } = req.query;

    let query: any = { isActive: true };

    if (category) query.category = category;
    if (type) query.type = type;

    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate as string),
        $lte: new Date(endDate as string)
      };
    } else if (startDate) {
      query.date = { $gte: new Date(startDate as string) };
    } else if (endDate) {
      query.date = { $lte: new Date(endDate as string) };
    }

    if (search) {
      const term = (search as string).trim();
      if (term.length > 0) {
        const regex = new RegExp(term, 'i');
        query.$or = [
          { category: regex },
          { type: regex },
          { notes: regex }
        ];
      }
    }

    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    // Get paginated records
    const records = await Record.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    // Count total records
    const totalRecords = await Record.countDocuments(query);

    const totalPages = Math.ceil(totalRecords / limit);

    res.json({
      records,
      pagination: {
        currentPage: page,
        totalPages,
        totalRecords,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const getRecordById = async (req: Request, res: Response) => {
  try {
    const record = await Record.findById(req.params.id).populate('createdBy', 'name email');

    if (record && record.isActive) {
      res.json(record);
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateRecord = async (req: Request, res: Response) => {
  try {
    const { amount, type, category, date, notes } = req.body;
    const record = await Record.findById(req.params.id);

    if (record && record.isActive) {
      record.amount = amount !== undefined ? amount : record.amount;
      record.type = type || record.type;
      record.category = category || record.category;
      record.date = date || record.date;
      record.notes = notes !== undefined ? notes : record.notes;

      const updatedRecord = await record.save();
      res.json(updatedRecord);
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export const deleteRecord = async (req: Request, res: Response) => {
  try {
    const record = await Record.findById(req.params.id);

    if (record && record.isActive) {
      record.isActive = false;
      await record.save();
      res.json({ message: 'Record removed' });
    } else {
      res.status(404).json({ message: 'Record not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
};
