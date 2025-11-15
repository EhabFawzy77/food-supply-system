import { NextResponse } from 'next/server';
import connectDB from '../../../lib/mongodb';
import Customer from '../../../lib/models/Customer.js';

export async function GET(request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const withDebts = searchParams.get('withDebts') === 'true';

    if (withDebts) {
      // Aggregate customers with their debts
      const customersWithDebts = await Customer.aggregate([
        {
          $lookup: {
            from: 'invoices',
            let: { customerId: '$_id' },
            pipeline: [
              {
                $match: {
                  $expr: { $eq: ['$customer', '$$customerId'] },
                  isArchived: false,
                  paymentStatus: { $in: ['unpaid', 'partial', 'overdue'] },
                  dueDate: { $lt: new Date() } // Overdue means due date has passed
                }
              },
              {
                $project: {
                  total: 1,
                  paidAmount: 1,
                  dueDate: 1,
                  outstanding: { $subtract: ['$total', '$paidAmount'] }
                }
              }
            ],
            as: 'overdueInvoices'
          }
        },
        {
          $addFields: {
            debtsCount: { $size: '$overdueInvoices' },
            totalDebt: {
              $sum: {
                $map: {
                  input: '$overdueInvoices',
                  as: 'inv',
                  in: { $max: ['$$inv.outstanding', 0] }
                }
              }
            },
            nextDueDate: {
              $min: {
                $filter: {
                  input: '$overdueInvoices',
                  as: 'inv',
                  cond: { $ne: ['$$inv.dueDate', null] }
                }
              }
            }
          }
        },
        {
          $match: {
            debtsCount: { $gt: 0 } // Only customers with debts
          }
        },
        {
          $sort: { totalDebt: -1, name: 1 }
        }
      ]);

      return NextResponse.json({ success: true, data: customersWithDebts });
    } else {
      const customers = await Customer.find().sort({ name: 1 });
      return NextResponse.json({ success: true, data: customers });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const customer = await Customer.create(body);
    return NextResponse.json(
      { success: true, data: customer },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}