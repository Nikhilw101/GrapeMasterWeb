/**
 * Single source of truth for order statistics and revenue logic.
 * Use everywhere: dashboard, order stats, user stats, analytics.
 * Ensures accuracy after any order update (status, approve, reject, cancel, delete, deliver).
 */
import { ORDER_STATUS, PAYMENT_STATUS, PAYMENT_METHODS } from './constants.js';

// Orders that count as "active" (exclude cancelled, rejected, admin-deleted)
export const EXCLUDED_ORDER_STATUSES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED];
export const EFFECTIVE_ORDER_STATUSES = Object.values(ORDER_STATUS).filter(
    s => !EXCLUDED_ORDER_STATUSES.includes(s)
);

/** Filter: effective orders only (not cancelled, not rejected) */
export const effectiveOrderFilter = {
    orderStatus: { $in: EFFECTIVE_ORDER_STATUSES }
};

/** Filter: orders that contribute to revenue (effective AND (paid online OR COD delivered/completed)) */
export const revenueMatch = {
    orderStatus: { $in: EFFECTIVE_ORDER_STATUSES },
    $or: [
        { paymentStatus: PAYMENT_STATUS.SUCCESS },
        {
            paymentMethod: PAYMENT_METHODS.COD,
            orderStatus: { $in: [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED] }
        }
    ]
};

/**
 * MongoDB $cond expression: value if order is revenue-eligible, else 0.
 * Use in $group: { revenue: { $sum: revenueOnlyCond } } after $addFields with revenueOnlyCond.
 * Or use revenueEligibleCond in $addFields then $sum that field.
 */
export const revenueEligibleCond = {
    $cond: {
        if: {
            $and: [
                { $in: ['$orderStatus', EFFECTIVE_ORDER_STATUSES] },
                {
                    $or: [
                        { $eq: ['$paymentStatus', PAYMENT_STATUS.SUCCESS] },
                        {
                            $and: [
                                { $eq: ['$paymentMethod', PAYMENT_METHODS.COD] },
                                { $in: ['$orderStatus', [ORDER_STATUS.DELIVERED, ORDER_STATUS.COMPLETED]] }
                            ]
                        }
                    ]
                }
            ]
        },
        then: '$pricing.total',
        else: 0
    }
};

/** Pending orders filter (awaiting admin action) */
export const pendingOrdersFilter = {
    orderStatus: { $in: [ORDER_STATUS.SUBMITTED, ORDER_STATUS.PAYMENT_COMPLETED] }
};
