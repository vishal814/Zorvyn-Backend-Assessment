import { Request, Response } from 'express';
import { Record, RecordType } from '../models/record.model';

export const getDashboardSummary = async (req: Request, res: Response) => {
  try {
    const pipeline = [
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          totalIncome: {
            $sum: { $cond: [{ $eq: ['$type', RecordType.INCOME] }, '$amount', 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ['$type', RecordType.EXPENSE] }, '$amount', 0] },
          },
        },
      },
    ];

    const totalsResult = await Record.aggregate(pipeline);
    const totals = totalsResult[0] || { totalIncome: 0, totalExpenses: 0 };
    const netBalance = totals.totalIncome - totals.totalExpenses;

    const categoryWiseTotals = await Record.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          income: { $sum: { $cond: [{ $eq: ['$type', RecordType.INCOME] }, '$amount', 0] } },
          expenses: { $sum: { $cond: [{ $eq: ['$type', RecordType.EXPENSE] }, '$amount', 0] } },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { totalAmount: -1 },
      },
      {
        $project: {
          category: '$_id',
          income: 1,
          expenses: 1,
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
    ]);

    const recentActivity = await Record.find({ isActive: true })
      .sort({ date: -1 })
      .limit(5)
      .populate('createdBy', 'name');

    // Monthly Trends
    const monthlyTrends = await Record.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" }
          },
          totalIncome: { $sum: { $cond: [{ $eq: ["$type", "income"] }, "$amount", 0] } },
          totalExpenses: { $sum: { $cond: [{ $eq: ["$type", "expense"] }, "$amount", 0] } }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    res.json({
      totals: {
        totalIncome: totals.totalIncome,
        totalExpenses: totals.totalExpenses,
        netBalance,
      },
      categoryWiseTotals,
      recentActivity,
      monthlyTrends
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};
