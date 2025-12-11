import cron from "node-cron";
import { Order } from "../models/order";
import { Product } from "../models/product";

/**
 * Background job to handle expired orders
 * 
 * Runs every hour to find orders that are:
 * - More than 24 hours old
 * - Not completed or cancelled
 * - Still have pending/confirmed/ready_for_pickup status
 * 
 * Actions taken:
 * 1. Mark order as cancelled
 * 2. Return reserved stock back to product inventory
 * 3. Update product stats (decrement order count and total sold)
 */
export const startOrderCleanupJob = () => {
    // Run every hour
    cron.schedule("0 * * * *", async () => {
        try {
            const twentyFourHoursAgo = new Date();
            twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

            // Find expired orders (older than 24 hours and not completed/cancelled)
            const expiredOrders = await Order.find({
                createdAt: { $lt: twentyFourHoursAgo },
                status: { $nin: ['completed', 'cancelled'] }
            }).populate('items.product');

            let cancelledCount = 0;

            for (const order of expiredOrders) {
                try {
                    // Return stock to products atomically
                    for (const item of order.items) {
                        await Product.findByIdAndUpdate(
                            item.product,
                            {
                                $inc: {
                                    'inventory.availableStock': item.quantity,
                                    'stats.orderCount': -1,
                                    'stats.totalSold': -item.quantity
                                }
                            }
                        );
                    }

                    // Cancel the order
                    order.status = 'cancelled';
                    order.cancellationReason = 'Order expired - not completed within 24 hours';
                    order.cancelledAt = new Date();
                    await order.save();

                    cancelledCount++;
                } catch (error) {
                    console.error(`Failed to cancel expired order ${order.orderNumber}:`, error);
                }
            }

            if (cancelledCount > 0) {
                console.log(`[Order Cleanup] Cancelled ${cancelledCount} expired orders and restored stock`);
            }
        } catch (error) {
            console.error("Order cleanup job failed:", error);
        }
    });
    
    console.log('Order cleanup job scheduled to run hourly');
};
